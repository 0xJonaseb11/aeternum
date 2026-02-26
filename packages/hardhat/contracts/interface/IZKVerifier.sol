// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @author @0xJonaseb11
 * @title IZKVerifier
 * @notice Verifier interface for Groth16/PLONK (e.g. SnarkJS-generated). proofData = abi.encode(pA, pB, pC).
 */
interface IZKVerifier {
    /**
     * @param publicInputs For CommitmentProof: [0] fileHash (BN254), [1] commitment (BN254).
     */
    function verifyProof(bytes calldata proofData, uint256[] calldata publicInputs) external view returns (bool valid);
}
