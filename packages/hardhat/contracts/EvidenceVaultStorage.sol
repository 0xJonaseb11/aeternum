// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IEvidenceVault} from "./IEvidenceVault.sol";

/**
 * @title   EvidenceVaultStorage
 * @notice  Isolated, append-only storage layout for EvidenceVault.
 *
 * @dev     UPGRADE RULES — must be followed strictly:
 *            1. NEVER remove a variable.
 *            2. NEVER reorder variables.
 *            3. NEVER change a variable's type.
 *            4. ONLY append new variables ABOVE the __gap array.
 *            5. For every new variable added, DECREASE __gap length by 1.
 *
 *          Current gap: 48 slots reserved for future upgrades.
 */
abstract contract EvidenceVaultStorage {

    // ── Core proof storage ────────────────────────────────────────────────────

    /// @dev fileHash → Proof
    mapping(bytes32 => IEvidenceVault.Proof) internal _proofs;

    // ── Access control ────────────────────────────────────────────────────────

    /// @dev fileHash → grantee → hasAccess
    mapping(bytes32 => mapping(address => bool)) internal _accessGrants;

    // ── ZK verifier ───────────────────────────────────────────────────────────

    /// @dev Address of the IZKVerifier implementation (Groth16VerifierWrapper).
    address internal _zkVerifier;

    // ── Per-owner statistics (for off-chain indexing) ─────────────────────────

    mapping(address => uint256) internal _ownerProofCount;

    // ── Constants (not stored in state, compiled in) ──────────────────────────

    uint256 internal constant MAX_ARWEAVE_ID_LEN = 43;   // Arweave TxID is always 43 chars (Base64url)
    uint256 internal constant MAX_IPFS_CID_LEN   = 128;  // CIDv0=46, CIDv1≤62, padded for safety
    uint256 internal constant BN254_FIELD_SIZE    =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    // ── Upgrade gap ───────────────────────────────────────────────────────────

    /* 48 slots: decrease by 1 for each new state variable appended above. */
    uint256[48] private __gap;
}
