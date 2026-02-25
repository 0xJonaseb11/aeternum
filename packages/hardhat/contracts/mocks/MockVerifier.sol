// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
* @notice Mock ZK verifier for tests; returns a fixed boolean set at deploy.
*/
contract MockVerifier {
    bool private immutable _pass;

    constructor(bool pass_) {
        _pass = pass_;
    }

    function verifyProof(bytes calldata, uint256[] calldata) external view returns (bool) {
        return _pass;
    }
}
