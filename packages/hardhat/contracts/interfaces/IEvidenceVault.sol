// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title   IEvidenceVault
 * @notice  Complete public surface of the Decentralised Evidence Vault.
 *          Implemented by EvidenceVault.sol.
 */
interface IEvidenceVault {

    // ─────────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Emitted when a new proof is registered.
    event ProofCreated(
        address indexed owner,
        bytes32 indexed fileHash,
        uint64  timestamp,
        uint64  blockNumber
    );

    /// @notice Emitted when the owner soft-revokes a proof.
    event ProofRevoked(address indexed owner, bytes32 indexed fileHash);

    /// @notice Emitted when an IPFS backup CID is added to an existing proof.
    event BackupAdded(bytes32 indexed fileHash, string ipfsCid);

    /// @notice Emitted when read access is granted to a third party.
    event AccessGranted(bytes32 indexed fileHash, address indexed grantee);

    /// @notice Emitted when read access is revoked from a third party.
    event AccessRevoked(bytes32 indexed fileHash, address indexed grantee);

    /// @notice Emitted when the ZK verifier contract is updated.
    event ZKVerifierUpdated(address indexed newVerifier);

    // ─────────────────────────────────────────────────────────────────────────
    //  Custom Errors
    // ─────────────────────────────────────────────────────────────────────────

    error ProofAlreadyExists();
    error ProofNotFound();
    error ProofIsRevoked();
    error NotProofOwner();
    error AccessDenied();
    error InvalidInput();
    error StorageIdTooLong();
    error BackupAlreadySet();
    error ZKVerifierNotSet();
    error ZKProofInvalid();

    // ─────────────────────────────────────────────────────────────────────────
    //  Data Structures
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice On-chain metadata for a single evidence proof.
     * @dev    Storage layout (slots):
     *           slot 0: owner (20B) + revoked (1B)           = 21B packed
     *           slot 1: timestamp (8B) + blockNumber (8B)    = 16B packed
     *           slot 2: fileHash   (32B)
     *           slot 3: commitment (32B)
     *           slot 4: arweaveTxId (dynamic string)
     *           slot 5: ipfsCid     (dynamic string — optional backup)
     */
    struct Proof {
        address owner;          // 20 bytes ─┐
        bool    revoked;        //  1 byte   ─┘ slot 0
        uint64  timestamp;      //  8 bytes ─┐
        uint64  blockNumber;    //  8 bytes ─┘ slot 1
        bytes32 fileHash;       // 32 bytes    slot 2
        bytes32 commitment;     // 32 bytes    slot 3  (Poseidon(fileHash,secret))
        string  arweaveTxId;    // dynamic     slot 4  (primary storage)
        string  ipfsCid;        // dynamic     slot 5  (optional backup)
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core Write Functions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Register a new evidence proof on-chain.
     * @param  fileHash     keccak256 of the plaintext file (reduced mod BN254 p).
     * @param  commitment   Poseidon(fileHash, secret) — generated off-chain.
     * @param  arweaveTxId  Primary Arweave transaction ID (permanent storage).
     * @param  ipfsCid      Optional IPFS CID backup (pass "" to omit).
     */
    function createProof(
        bytes32        fileHash,
        bytes32        commitment,
        string calldata arweaveTxId,
        string calldata ipfsCid
    ) external;

    /**
     * @notice Add an IPFS backup CID to an existing proof.
     * @dev    Only callable by the proof owner. Can only be set once.
     * @param  fileHash  Identifies the proof.
     * @param  ipfsCid   IPFS CID of the encrypted backup.
     */
    function addBackup(bytes32 fileHash, string calldata ipfsCid) external;

    /// @notice Permanently soft-revoke a proof (data stays on-chain for audit).
    function revokeProof(bytes32 fileHash) external;

    // ─────────────────────────────────────────────────────────────────────────
    //  Access Control
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Grant a third party (auditor, court, employer) read access.
    function grantAccess(bytes32 fileHash, address grantee) external;

    /// @notice Revoke a previously granted read access.
    function revokeAccess(bytes32 fileHash, address grantee) external;

    // ─────────────────────────────────────────────────────────────────────────
    //  Query Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns true when a non-revoked proof exists for `fileHash`.
    function proofExists(bytes32 fileHash) external view returns (bool);

    /// @notice Returns proof metadata. Caller must be owner or an approved grantee.
    function getProof(bytes32 fileHash) external view returns (Proof memory);

    /// @notice Returns true if `grantee` has read access to the proof.
    function hasAccess(bytes32 fileHash, address grantee) external view returns (bool);

    // ─────────────────────────────────────────────────────────────────────────
    //  ZK Verification
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Verify ownership using a Groth16 ZK proof (secret never revealed).
     * @dev    The ZK circuit proves: commitment == Poseidon(fileHash, secret)
     *         Public inputs:  [fileHash_felt, commitment_felt]
     *         Private inputs: [secret]  ← stays off-chain inside the proof
     *
     * @param  fileHash      Identifies the proof.
     * @param  zkProof       Groth16 proof: abi.encode(pA[2], pB[2][2], pC[2]).
     * @param  publicInputs  [fileHash_as_field_element, commitment_as_field_element].
     * @return               True if the proof is valid and matches stored commitment.
     */
    function verifyOwnership(
        bytes32        fileHash,
        bytes calldata zkProof,
        uint256[] calldata publicInputs
    ) external view returns (bool);

    // ─────────────────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────────────────

    function setZKVerifier(address verifier) external;
    function pause()   external;
    function unpause() external;
}
