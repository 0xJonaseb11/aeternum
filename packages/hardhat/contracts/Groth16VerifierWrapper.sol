// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IZKVerifier } from "./interface/IZKVerifier.sol";

/**
 * @title   Groth16VerifierWrapper
 * @notice  Wraps the auto-generated SnarkJS Groth16 verifier (CommitmentVerifier)
 *          and exposes the standard IZKVerifier interface consumed by EvidenceVault.
 *
 * @dev     Deployment flow:
 *            1. Compile circuit:    circom commitment.circom --r1cs --wasm --sym
 *            2. Trusted setup:      snarkjs groth16 setup / contribute / beacon
 *            3. Export verifier:    snarkjs zkey export solidityverifier
 *               → produces CommitmentVerifier.sol  (do NOT modify it)
 *            4. Deploy both contracts:
 *               CommitmentVerifier verifier = new CommitmentVerifier();
 *               Groth16VerifierWrapper wrapper = new Groth16VerifierWrapper(address(verifier));
 *            5. Register:           vault.setZKVerifier(address(wrapper));
 *
 *          Proof encoding (client-side, TypeScript):
 *            const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);
 *            const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
 *            // calldata is the hex-encoded tuple: (pA, pB, pC, pubSignals)
 *            // Client SDK splits and re-encodes as (proofData, publicInputs).
 */

/**
 * @dev This is the interface of the raw SnarkJS-generated verifier.
 *      The actual CommitmentVerifier.sol is generated — never hand-written.
 */
interface ISnarkJSVerifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) external view returns (bool);
}

contract Groth16VerifierWrapper is IZKVerifier {
    // ── Errors ───────────────────────────────────────────────────────────────

    error InvalidProofEncoding();
    error WrongPublicInputCount();

    // ── State ────────────────────────────────────────────────────────────────

    ISnarkJSVerifier public immutable snarkVerifier;

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(address _snarkVerifier) {
        require(_snarkVerifier != address(0), "zero address");
        snarkVerifier = ISnarkJSVerifier(_snarkVerifier);
    }

    // ── IZKVerifier ──────────────────────────────────────────────────────────

    /**
     * @inheritdoc IZKVerifier
     * @dev proofData   = abi.encode(uint256[2] pA, uint256[2][2] pB, uint256[2] pC)
     *      publicInputs must have exactly 2 elements: [fileHash_felt, commitment_felt]
     */
    function verifyProof(
        bytes calldata proofData,
        uint256[] calldata publicInputs
    ) external view override returns (bool valid) {
        if (publicInputs.length != 2) revert WrongPublicInputCount();

        // Decode the proof components
        uint256[2] memory pA;
        uint256[2][2] memory pB;
        uint256[2] memory pC;

        /*
         * abi.decode requires memory, so we copy from calldata.
         *   pA = [0:64]    (2 × uint256)
         *   pB = [64:192]  (4 × uint256 in column-major order)
         *   pC = [192:256] (2 × uint256)
         */
        if (proofData.length != 32 * 8) revert InvalidProofEncoding();
        (pA, pB, pC) = abi.decode(proofData, (uint256[2], uint256[2][2], uint256[2]));

        uint256[2] memory pubSignals;
        pubSignals[0] = publicInputs[0]; // fileHash   as BN254 field element
        pubSignals[1] = publicInputs[1]; // commitment as BN254 field element

        valid = snarkVerifier.verifyProof(pA, pB, pC, pubSignals);
    }
}
