// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IEvidenceVault } from "../interface/IEvidenceVault.sol";

/**
 * @author @0xJonaseb11
 * @title EvidenceVaultStorage
 * @notice Isolated, append-only storage for EvidenceVault (upgrade-safe).
 * @dev UPGRADE: Do not remove, reorder, or change types. Append new state above __gap and decrease __gap by 1 per slot. Current __gap: 48.
 */
abstract contract EvidenceVaultStorage {
    mapping(bytes32 => IEvidenceVault.Proof) internal _proofs;
    mapping(bytes32 => mapping(address => bool)) internal _accessGrants;
    address internal _zkVerifier;
    mapping(address => uint256) internal _ownerProofCount;

    uint256 internal constant MAX_ARWEAVE_ID_LEN = 43;
    uint256 internal constant MAX_IPFS_CID_LEN = 128;
    uint256 internal constant BN254_FIELD_SIZE =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    uint256[48] private __gap;
}
