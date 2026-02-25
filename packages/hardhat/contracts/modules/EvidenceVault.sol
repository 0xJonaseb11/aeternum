// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IEvidenceVault } from "../interface/IEvidenceVault.sol";
import { IZKVerifier } from "../interface/IZKVerifier.sol";
import { EvidenceVaultStorage } from "./EvidenceVaultStorage.sol";

/**
 * @author @0xJonaseb11
 * @title EvidenceVault
 * @notice Stores cryptographic proofs of encrypted files (metadata on-chain; content on Arweave/IPFS).
 * @dev ZK flow: client computes commitment = Poseidon(fileHash, secret) and proves knowledge of secret
 *      off-chain; on-chain we store commitment and verify via IZKVerifier. Secret never on-chain.
 *      UUPS upgradeable, Ownable, Pausable, ReentrancyGuard; storage in EvidenceVaultStorage; CEI throughout.
 * @custom:security-contact security@aeternum.io
 */
contract EvidenceVault is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuard,
    PausableUpgradeable,
    UUPSUpgradeable,
    EvidenceVaultStorage,
    IEvidenceVault
{
    constructor() {
        _disableInitializers();
    }

    /**
    * @notice One-time proxy init. Use a multisig for initialOwner in production.
    */ 
    function initialize(address initialOwner) external initializer {
        if (initialOwner == address(0)) revert InvalidInput();

        __Ownable_init(initialOwner);
        assembly {
            sstore(0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00, 1)
        }
        __Pausable_init();
    }

    /**
    * @inheritdoc IEvidenceVault
    * @dev Arweave TxID must be 43 chars; commitment < BN254_FIELD_SIZE; calldata strings; single SLOAD via storage ptr.
    */  
    function createProof(
        bytes32 fileHash,
        bytes32 commitment,
        string calldata arweaveTxId,
        string calldata ipfsCid
    ) external override nonReentrant whenNotPaused {
        if (fileHash == bytes32(0)) revert InvalidInput();
        if (commitment == bytes32(0)) revert InvalidInput();
        if (uint256(commitment) >= BN254_FIELD_SIZE) revert InvalidInput();

        uint256 arLen = bytes(arweaveTxId).length;
        if (arLen != MAX_ARWEAVE_ID_LEN) revert StorageIdTooLong();

        uint256 ipfsLen = bytes(ipfsCid).length;
        if (ipfsLen > MAX_IPFS_CID_LEN) revert StorageIdTooLong();

        if (_proofs[fileHash].owner != address(0)) revert ProofAlreadyExists();

        Proof storage p = _proofs[fileHash];

        p.owner = msg.sender;
        p.revoked = false;
        p.timestamp = uint64(block.timestamp);
        p.blockNumber = uint64(block.number);
        p.fileHash = fileHash;
        p.commitment = commitment;
        p.arweaveTxId = arweaveTxId;
        if (ipfsLen > 0) {
            p.ipfsCid = ipfsCid;
        }

        unchecked {
            _ownerProofCount[msg.sender]++;
        }

        emit ProofCreated(msg.sender, fileHash, uint64(block.timestamp), uint64(block.number));
    }

    /**
    * @inheritdoc IEvidenceVault 
    */
    function addBackup(bytes32 fileHash, string calldata ipfsCid) external override nonReentrant whenNotPaused {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (p.revoked) revert ProofIsRevoked();
        if (bytes(p.ipfsCid).length > 0) revert BackupAlreadySet();

        uint256 ipfsLen = bytes(ipfsCid).length;
        if (ipfsLen == 0 || ipfsLen > MAX_IPFS_CID_LEN) revert StorageIdTooLong();

        p.ipfsCid = ipfsCid;
        emit BackupAdded(fileHash, ipfsCid);
    }

    /** 
    * @inheritdoc IEvidenceVault
    * @dev Soft revocation: data retained for audit; flag permanent.
    */ 
    function revokeProof(bytes32 fileHash) external override nonReentrant whenNotPaused {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (p.revoked) revert ProofIsRevoked();

        p.revoked = true;
        emit ProofRevoked(msg.sender, fileHash);
    }

    /**
    * @inheritdoc IEvidenceVault 
    */
    function grantAccess(bytes32 fileHash, address grantee) external override nonReentrant {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (grantee == address(0)) revert InvalidInput();

        _accessGrants[fileHash][grantee] = true;
        emit AccessGranted(fileHash, grantee);
    }

    /**
    * @inheritdoc IEvidenceVault
    */
    function revokeAccess(bytes32 fileHash, address grantee) external override nonReentrant {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.owner != msg.sender) revert NotProofOwner();
        if (grantee == address(0)) revert InvalidInput();

        _accessGrants[fileHash][grantee] = false;
        emit AccessRevoked(fileHash, grantee);
    }

    /**
    * @inheritdoc IEvidenceVault
    */ 
    function proofExists(bytes32 fileHash) external view override returns (bool) {
        Proof storage p = _proofs[fileHash];
        return p.owner != address(0) && !p.revoked;
    }

    /**
    * @inheritdoc IEvidenceVault
    * @dev Caller must be owner or grantee; returns memory copy (no reentrancy).
    */ 
    function getProof(bytes32 fileHash) external view override returns (Proof memory) {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();

        bool isOwner = p.owner == msg.sender;
        bool isGrantee = _accessGrants[fileHash][msg.sender];
        if (!isOwner && !isGrantee) revert AccessDenied();

        return p;
    }

    /**
    * @inheritdoc IEvidenceVault
    */
    function hasAccess(bytes32 fileHash, address grantee) external view override returns (bool) {
        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        return p.owner == grantee || _accessGrants[fileHash][grantee];
    }

    /**
    * @inheritdoc IEvidenceVault
    * @dev Secret is private witness in zkProof. Public inputs: [fileHash_felt, commitment_felt]; publicInputs[1] must match stored commitment.
    */
    function verifyOwnership(
        bytes32 fileHash,
        bytes calldata zkProof,
        uint256[] calldata publicInputs
    ) external view override returns (bool) {
        if (_zkVerifier == address(0)) revert ZKVerifierNotSet();

        Proof storage p = _proofs[fileHash];
        if (p.owner == address(0)) revert ProofNotFound();
        if (p.revoked) revert ProofIsRevoked();
        if (publicInputs.length != 2) revert InvalidInput();
        if (publicInputs[0] != uint256(fileHash)) revert InvalidInput();
        if (publicInputs[1] != uint256(p.commitment)) revert InvalidInput();

        bool valid = IZKVerifier(_zkVerifier).verifyProof(zkProof, publicInputs);
        if (!valid) revert ZKProofInvalid();

        return true;
    }

    /**
    * @inheritdoc IEvidenceVault
    */
    function setZKVerifier(address verifier) external override onlyOwner {
        _zkVerifier = verifier;
        emit ZKVerifierUpdated(verifier);
    }

    /**
    * @inheritdoc IEvidenceVault
    */ 
    function pause() external override onlyOwner {
        _pause();
    }

    /**
    * @inheritdoc IEvidenceVault
    */
    function unpause() external override onlyOwner {
        _unpause();
    }

    /**
    * @notice Total proofs created by owner (includes revoked).
    */
    function ownerProofCount(address owner) external view returns (uint256) {
        return _ownerProofCount[owner];
    }

    /** 
    * @notice Current ZK verifier; zero means disabled.
    */
    function zkVerifier() external view returns (address) {
        return _zkVerifier;
    }

    /** 
    * @dev Upgrade authorised only by owner (use multisig + timelock in production).
    */
    function _authorizeUpgrade(address /*newImplementation*/) internal override onlyOwner {}
}
