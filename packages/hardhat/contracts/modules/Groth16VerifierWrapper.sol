// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IZKVerifier } from "../interface/IZKVerifier.sol";

/**
 * @author @0xJonaseb11
 * @title Groth16VerifierWrapper
 * @notice Adapts SnarkJS-generated Groth16 verifier (CommitmentVerifier) to IZKVerifier for EvidenceVault.
 * @dev    Deploy CommitmentVerifier then this with its address; register via vault.setZKVerifier(wrapper).
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
    error InvalidProofEncoding();
    error WrongPublicInputCount();

    ISnarkJSVerifier public immutable snarkVerifier;

    constructor(address _snarkVerifier) {
        require(_snarkVerifier != address(0), "zero address");
        snarkVerifier = ISnarkJSVerifier(_snarkVerifier);
    }

    /**
     * @inheritdoc IZKVerifier
    */
    function verifyProof(
        bytes calldata proofData,
        uint256[] calldata publicInputs
    ) external view override returns (bool valid) {
        if (publicInputs.length != 2) revert WrongPublicInputCount();

        uint256[2] memory pA;
        uint256[2][2] memory pB;
        uint256[2] memory pC;

        if (proofData.length != 32 * 8) revert InvalidProofEncoding();
        (pA, pB, pC) = abi.decode(proofData, (uint256[2], uint256[2][2], uint256[2]));

        uint256[2] memory pubSignals;
        pubSignals[0] = publicInputs[0];
        pubSignals[1] = publicInputs[1];

        valid = snarkVerifier.verifyProof(pA, pB, pC, pubSignals);
    }
}
