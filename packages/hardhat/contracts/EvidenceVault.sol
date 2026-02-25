// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ─────────────────────────────────────────────────────────────────────────────
//  OpenZeppelin Upgradeable
// ─────────────────────────────────────────────────────────────────────────────
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

// ─────────────────────────────────────────────────────────────────────────────
//  Local
// ─────────────────────────────────────────────────────────────────────────────
import { IEvidenceVault } from "./interface/IEvidenceVault.sol";
import { IZKVerifier } from "./interface/IZKVerifier.sol";
import { EvidenceVaultStorage } from "./EvidenceVaultStorage.sol";

/**
 * @title   EvidenceVault
 * @author  Decentralised Evidence Vault — Production v1
 * @notice  Stores cryptographic proofs of encrypted files permanently kept on
 *          Arweave (primary) and optionally IPFS (backup).
 *          Only metadata is stored on-chain; file content lives off-chain.
 *
 * @dev     ┌─────────────────────────────────────────────────────────────┐
 *          │  ZK PROOF FLOW (real — no secret touches chain)            │
 *          │                                                             │
 *          │  OFF-CHAIN (client)                                         │
 *          │    secret      = random bytes32                             │
 *          │    fileHash_f  = fileHash mod BN254_p                       │
 *          │    commitment  = Poseidon(fileHash_f, secret)               │
 *          │    zkProof     = groth16.fullProve({fileHash_f, secret})    │
 *          │                                                             │
 *          │  ON-CHAIN (createProof)                                     │
 *          │    store commitment, arweaveTxId, ipfsCid, owner, block     │
 *          │                                                             │
 *          │  ON-CHAIN (verifyOwnership)                                 │
 *          │    IZKVerifier.verifyProof(zkProof, [fileHash_f, commit])   │
 *          │    ← secret NEVER appears in calldata or state              │
 *          └─────────────────────────────────────────────────────────────┘
 *
 *          Architecture
 *          ─────────────
 *          • UUPS upgradeable (EIP-1822)
 *          • OwnableUpgradeable         → admin / upgrade authority
 *          • ReentrancyGuardUpgradeable → defence in depth
 *          • PausableUpgradeable        → emergency circuit-breaker
 *          • EvidenceVaultStorage       → isolated, append-only layout + __gap
 *          • Custom errors              → gas-efficient reverts
 *          • CEI pattern throughout
 *
 * @custom:security-contact security@yourdomain.com
 */
contract EvidenceVault is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    EvidenceVaultStorage,
    IEvidenceVault
{
    // ─────────────────────────────────────────────────────────────────────────
    //  Constructor
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Disable implementation-level initialisation (EIP-1967 proxy safety).
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() {
        _disableInitializers();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Initializer
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice One-time proxy initialisation — replaces the constructor.
     * @param  initialOwner  Address that receives contract ownership.
     *                       Should be a Gnosis Safe multisig in production.
     */
    function initialize(address initialOwner) external initializer {
        if (initialOwner == address(0)) revert InvalidInput();

        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core: createProof
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @inheritdoc IEvidenceVault
     * @dev  Gas notes:
     *         • All string args as `calldata` — avoids memory copy.
     *         • Single storage pointer `p` avoids repeated SLOADs.
     *         • `uint64(block.timestamp)` safe until year 584,942.
     *         • `unchecked` on proof counter — cannot overflow uint256.
     *         • Arweave TxIDs are always exactly 43 bytes (Base64url encoded).
     *         • Commitment must be a valid BN254 field element (< field size).
     */
    function createProof(
        bytes32 fileHash,
        bytes32 commitment,
        string calldata arweaveTxId,
        string calldata ipfsCid
    ) external override nonReentrant whenNotPaused {
        /* ── Checks ────────────────────────────────────────────────────────── */
        if (fileHash == bytes32(0)) revert InvalidInput();
        if (commitment == bytes32(0)) revert InvalidInput();

        // Commitment must be a valid BN254 field element
        if (uint256(commitment) >= BN254_FIELD_SIZE) revert InvalidInput();

        // Arweave TxID is always exactly 43 Base64url characters
        uint256 arLen = bytes(arweaveTxId).length;
        if (arLen != MAX_ARWEAVE_ID_LEN) revert StorageIdTooLong();

        // IPFS CID is optional but bounded if provided
        uint256 ipfsLen = bytes(ipfsCid).length;
        if (ipfsLen > MAX_IPFS_CID_LEN) revert StorageIdTooLong();

        // Proof must not already exist
        if (_proofs[fileHash].owner != address(0)) revert ProofAlreadyExists();

        /* ── Effects ────────────────────────────────────────────────────────── */
        Proof storage p = _proofs[fileHash];

        // Slot 0: owner + revoked (packed)
        p.owner = msg.sender;
        p.revoked = false;

        // Slot 1: timestamp + blockNumber (packed)
        p.timestamp = uint64(block.timestamp);
        p.blockNumber = uint64(block.number);

        // Slots 2-3: hashes
        p.fileHash = fileHash;
        p.commitment = commitment;

        // Slots 4-5: storage IDs
        p.arweaveTxId = arweaveTxId;
        if (ipfsLen > 0) {
            p.ipfsCid = ipfsCid;
        }

        unchecked {
            _ownerProofCount[msg.sender]++;
        }

        emit ProofCreated(msg.sender, fileHash, uint64(block.timestamp), uint64(block.number));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core: addBackup
    // ─────────────────────────────────────────────────────────────────────────

    /// @inheritdoc IEvidenceVault
    function addBackup(bytes32 fileHash, string calldata ipfsCid) external override nonReentrant whenNotPaused {
        /* ── Checks ────────────────────────────────────────────────────────── */
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (p.revoked) revert ProofIsRevoked();
        if (bytes(p.ipfsCid).length > 0) revert BackupAlreadySet();

        uint256 ipfsLen = bytes(ipfsCid).length;
        if (ipfsLen == 0 || ipfsLen > MAX_IPFS_CID_LEN) revert StorageIdTooLong();

        /* ── Effects ────────────────────────────────────────────────────────── */
        p.ipfsCid = ipfsCid;

        emit BackupAdded(fileHash, ipfsCid);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core: revokeProof
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @inheritdoc IEvidenceVault
     * @dev Soft revocation: data remains for audit trail. Flag is permanent.
     */
    function revokeProof(bytes32 fileHash) external override nonReentrant whenNotPaused {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (p.revoked) revert ProofIsRevoked();

        p.revoked = true;

        emit ProofRevoked(msg.sender, fileHash);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Access Control
    // ─────────────────────────────────────────────────────────────────────────

    /// @inheritdoc IEvidenceVault
    function grantAccess(bytes32 fileHash, address grantee) external override nonReentrant {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (grantee == address(0)) revert InvalidInput();
        // Granting access to a revoked proof is allowed (auditors may need it)

        _accessGrants[fileHash][grantee] = true;

        emit AccessGranted(fileHash, grantee);
    }

    /// @inheritdoc IEvidenceVault
    function revokeAccess(bytes32 fileHash, address grantee) external override nonReentrant {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (grantee == address(0)) revert InvalidInput();

        _accessGrants[fileHash][grantee] = false;

        emit AccessRevoked(fileHash, grantee);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Queries
    // ─────────────────────────────────────────────────────────────────────────

    /// @inheritdoc IEvidenceVault
    function proofExists(bytes32 fileHash) external view override returns (bool) {
        Proof storage p = _proofs[fileHash];
        return p.owner != address(0) && !p.revoked;
    }

    /**
     * @inheritdoc IEvidenceVault
     * @dev  Caller must be the proof owner OR a granted grantee.
     *       Returns a memory copy — no external calls, reentrancy not possible.
     */
    function getProof(bytes32 fileHash) external view override returns (Proof memory) {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();

        bool isOwner = p.owner == msg.sender;
        bool isGrantee = _accessGrants[fileHash][msg.sender];

        if (!isOwner && !isGrantee) revert AccessDenied();

        return p;
    }

    /// @inheritdoc IEvidenceVault
    function hasAccess(bytes32 fileHash, address grantee) external view override returns (bool) {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        return p.owner == grantee || _accessGrants[fileHash][grantee];
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  ZK Verification — Real Groth16
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @inheritdoc IEvidenceVault
     *
     * @dev     TRUE ZK: the `secret` is embedded inside `zkProof` as a private
     *          witness. It is proven to satisfy `commitment = Poseidon(fileHash, secret)`
     *          WITHOUT ever appearing in calldata, state, or event logs.
     *
     *          Public inputs the circuit exposes (and the verifier checks):
     *            publicInputs[0] = fileHash   as BN254 field element
     *            publicInputs[1] = commitment as BN254 field element
     *
     *          Additional on-chain check: publicInputs[1] must match the stored
     *          commitment — prevents a valid proof for a *different* commitment
     *          from passing verification.
     */
    function verifyOwnership(
        bytes32 fileHash,
        bytes calldata zkProof,
        uint256[] calldata publicInputs
    ) external view override returns (bool) {
        /* ── Checks ────────────────────────────────────────────────────────── */
        if (_zkVerifier == address(0)) revert ZKVerifierNotSet();

        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.revoked) revert ProofIsRevoked();

        // publicInputs must carry exactly 2 field elements
        if (publicInputs.length != 2) revert InvalidInput();

        // Public input[0] must match the stored fileHash (as field element)
        if (publicInputs[0] != uint256(fileHash)) revert InvalidInput();

        /*
         * Public input[1] must match the stored commitment.
         * This binds the ZK proof to THIS specific commitment on-chain.
         */
        if (publicInputs[1] != uint256(p.commitment)) revert InvalidInput();

        /* ── External call (view — no state change) ─────────────────────────
         * Delegate to the Groth16 pairing verifier.
         * The secret lives only inside zkProof as a Groth16 witness.
         */
        bool valid = IZKVerifier(_zkVerifier).verifyProof(zkProof, publicInputs);
        if (!valid) revert ZKProofInvalid();

        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────────

    /// @inheritdoc IEvidenceVault
    function setZKVerifier(address verifier) external override onlyOwner {
        // Allow setting to address(0) to disable ZK verification
        _zkVerifier = verifier;
        emit ZKVerifierUpdated(verifier);
    }

    /// @inheritdoc IEvidenceVault
    function pause() external override onlyOwner {
        _pause();
    }

    /// @inheritdoc IEvidenceVault
    function unpause() external override onlyOwner {
        _unpause();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Total proofs submitted by `owner` (includes revoked).
    function ownerProofCount(address owner) external view returns (uint256) {
        return _ownerProofCount[owner];
    }

    /// @notice Active ZK verifier address (zero = ZK verification disabled).
    function zkVerifier() external view returns (address) {
        return _zkVerifier;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UUPS Upgrade Authority
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Only the contract owner (multisig + timelock in production) may
     *      authorise an upgrade. Called internally by `upgradeTo()`.
     */
    function _authorizeUpgrade(address /*newImplementation*/) internal override onlyOwner {}
}
