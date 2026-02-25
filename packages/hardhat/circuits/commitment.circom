pragma circom 2.1.6;

/*
 * EvidenceVault — Commitment Preimage Circuit
 * ─────────────────────────────────────────────────────────────────────────────
 * Proves knowledge of `secret` such that:
 *
 *   commitment = Poseidon2(fileHash, secret)
 *
 * WITHOUT revealing `secret` on-chain.
 *
 * Public inputs  : fileHash, commitment
 * Private inputs : secret
 *
 * Why Poseidon instead of keccak256?
 *   keccak256 inside a SNARK circuit costs ~150,000 R1CS constraints.
 *   Poseidon is ZK-native and costs ~220 constraints for 2 inputs.
 *   The on-chain verifier accepts the Poseidon output as the commitment.
 *
 * Compilation:
 *   circom commitment.circom --r1cs --wasm --sym --c \
 *     --output ./build -l ./node_modules
 *
 * Dependencies:
 *   npm install circomlib          (Poseidon, Num2Bits, etc.)
 */

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/comparators.circom";

/*
 * CommitmentProof
 * ───────────────
 * Proves: commitment == Poseidon([fileHash, secret])
 * Ensures fileHash and secret are non-zero (basic sanity).
 */
template CommitmentProof() {
    // ── Public inputs (known to the verifier / on-chain) ────────────────────
    signal input fileHash;      // keccak256 of the file, reduced mod p
    signal input commitment;    // Poseidon(fileHash, secret) stored on-chain

    // ── Private inputs (known only to the prover) ────────────────────────────
    signal input secret;        // random 32-byte value chosen at proof creation

    // ── Constraints ──────────────────────────────────────────────────────────

    // 1. Ensure fileHash is non-zero
    signal fileHashIsZero;
    component fhZero = IsZero();
    fhZero.in <== fileHash;
    fileHashIsZero <== fhZero.out;
    fileHashIsZero === 0;   // fileHash must NOT be zero

    // 2. Ensure secret is non-zero
    signal secretIsZero;
    component sZero = IsZero();
    sZero.in <== secret;
    secretIsZero <== sZero.out;
    secretIsZero === 0;     // secret must NOT be zero

    // 3. Compute Poseidon(fileHash, secret)
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== fileHash;
    poseidon.inputs[1] <== secret;

    // 4. Assert computed commitment matches the public commitment
    poseidon.out === commitment;
}

component main {public [fileHash, commitment]} = CommitmentProof();
