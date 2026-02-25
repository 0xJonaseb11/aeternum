// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
* @notice Mock ZK verifier for unit tests
* Returns a fixed boolean set at deploy time
*/

contract MockVerifier {
    bool private immutable _pass;

    constructor(bool pass_) {
        _pass = pass_;
    }

    function verifyProof(
        bytes calldata,
        uint256[] calldata
    ) external view returns (bool) {
        return _pass;
    }

}