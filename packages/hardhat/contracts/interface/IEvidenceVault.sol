// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @author @0xJonaseb11
 * @title IEvidenceVault
 * @notice Public API of the evidence vault; implemented by EvidenceVault.sol.
 */
interface IEvidenceVault {
    event ProofCreated(address indexed owner, bytes32 indexed fileHash, uint64 timestamp, uint64 blockNumber);
    event ProofRevoked(address indexed owner, bytes32 indexed fileHash);
    event BackupAdded(bytes32 indexed fileHash, string ipfsCid);
    event AccessGranted(bytes32 indexed fileHash, address indexed grantee);
    event AccessRevoked(bytes32 indexed fileHash, address indexed grantee);
    event ZKVerifierUpdated(address indexed newVerifier);

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

    /// @dev Storage layout: slot 0 owner+revoked; 1 timestamp+blockNumber; 2 fileHash; 3 commitment; 4 arweaveTxId; 5 ipfsCid.
    struct Proof {
        address owner;
        bool revoked;
        uint64 timestamp;
        uint64 blockNumber;
        bytes32 fileHash;
        bytes32 commitment;
        string arweaveTxId;
        string ipfsCid;
    }

    function createProof(
        bytes32 fileHash,
        bytes32 commitment,
        string calldata arweaveTxId,
        string calldata ipfsCid
    ) external;

    function addBackup(bytes32 fileHash, string calldata ipfsCid) external;
    function revokeProof(bytes32 fileHash) external;
    function grantAccess(bytes32 fileHash, address grantee) external;
    function revokeAccess(bytes32 fileHash, address grantee) external;

    function proofExists(bytes32 fileHash) external view returns (bool);
    function getProof(bytes32 fileHash) external view returns (Proof memory);
    function hasAccess(bytes32 fileHash, address grantee) external view returns (bool);

    /**
    * @param publicInputs [fileHash as BN254 field, commitment as BN254 field].
    */ 
    function verifyOwnership(
        bytes32 fileHash,
        bytes calldata zkProof,
        uint256[] calldata publicInputs
    ) external view returns (bool);

    function setZKVerifier(address verifier) external;
    function pause() external;
    function unpause() external;
}
