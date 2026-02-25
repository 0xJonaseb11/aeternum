#!/usr/bin/env node
/**
 * EvidenceVault — ZK Circuit Setup + Proof Generation Script
 *
 * Steps:
 *   setup    — Compile circuit, run trusted setup, export verifier
 *   prove    — Generate a Groth16 proof for a given fileHash + secret
 *   verify   — Verify a proof locally (off-chain sanity check)
 *
 * Usage:
 *   npx ts-node scripts/zkSetup.ts setup
 *   FILE=./doc.pdf SECRET=0x... npx ts-node scripts/zkSetup.ts prove
 *
 * Prerequisites:
 *   npm install -g circom snarkjs
 *   npm install circomlibjs snarkjs ethers
 */

import { execSync }       from "child_process";
import * as fs            from "fs";
import * as path          from "path";
import * as snarkjs       from "snarkjs";
import { buildPoseidon }  from "circomlibjs";
import { ethers }         from "ethers";

const ROOT       = path.resolve(__dirname, "..");
const CIRCUIT    = path.join(ROOT, "circuits/commitment.circom");
const BUILD_DIR  = path.join(ROOT, "build/circuits");
const PTAU_FILE  = path.join(BUILD_DIR, "pot15_final.ptau");  // Powers of Tau (2^15 constraints)
const R1CS_FILE  = path.join(BUILD_DIR, "commitment.r1cs");
const ZKEY_0     = path.join(BUILD_DIR, "commitment_0.zkey");
const ZKEY_FINAL = path.join(BUILD_DIR, "commitment_final.zkey");
const WASM_FILE  = path.join(BUILD_DIR, "commitment_js/commitment.wasm");
const VKEY_FILE  = path.join(BUILD_DIR, "verification_key.json");
const VERIFIER_OUT = path.join(ROOT, "contracts/CommitmentVerifier.sol");

const BN254_P = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

// ─────────────────────────────────────────────────────────────────────────────
//  Setup
// ─────────────────────────────────────────────────────────────────────────────

async function setup() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  ZK Circuit Trusted Setup");
  console.log("═══════════════════════════════════════════════════");

  fs.mkdirSync(BUILD_DIR, { recursive: true });

  // 1. Compile the Circom circuit
  console.log("\n[1/6] Compiling commitment.circom...");
  execSync(
    `circom ${CIRCUIT} --r1cs --wasm --sym --c --output ${BUILD_DIR} -l ${ROOT}/node_modules`,
    { stdio: "inherit" }
  );
  console.log("      ✓ Circuit compiled");

  // 2. Download / use existing Powers of Tau
  // For production: use the official Hermez ceremony ptau file
  // https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_15.ptau
  if (!fs.existsSync(PTAU_FILE)) {
    console.log("\n[2/6] Downloading Powers of Tau (pot15)...");
    execSync(
      `curl -o ${PTAU_FILE} https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_15.ptau`,
      { stdio: "inherit" }
    );
  } else {
    console.log("\n[2/6] Powers of Tau already present, skipping download.");
  }

  // 3. Circuit-specific setup (phase 2)
  console.log("\n[3/6] Running Groth16 circuit-specific setup (phase 2)...");
  await snarkjs.zKey.newZKey(R1CS_FILE, PTAU_FILE, ZKEY_0);
  console.log("      ✓ Initial zkey created");

  // 4. Contribute randomness (in production: multiple independent contributions)
  console.log("\n[4/6] Contributing randomness to zkey...");
  await snarkjs.zKey.contribute(
    ZKEY_0,
    ZKEY_FINAL,
    "EvidenceVault-Contributor-1",
    // Entropy: in production collect from multiple parties via a ceremony
    ethers.hexlify(ethers.randomBytes(64))
  );
  console.log("      ✓ Contribution complete → commitment_final.zkey");

  // 5. Export verification key
  console.log("\n[5/6] Exporting verification key...");
  const vKey = await snarkjs.zKey.exportVerificationKey(ZKEY_FINAL);
  fs.writeFileSync(VKEY_FILE, JSON.stringify(vKey, null, 2));
  console.log(`      ✓ verification_key.json saved`);

  // 6. Generate Solidity verifier
  console.log("\n[6/6] Generating Solidity verifier contract...");
  const templates = { groth16: require("snarkjs/templates/verifier_groth16.sol") };
  const solidityCode = await snarkjs.zKey.exportSolidityVerifier(ZKEY_FINAL, templates);
  // Rename the contract from Groth16Verifier → CommitmentVerifier
  const renamed = solidityCode.replace(
    "contract Groth16Verifier",
    "contract CommitmentVerifier"
  );
  fs.writeFileSync(VERIFIER_OUT, renamed);
  console.log(`      ✓ CommitmentVerifier.sol written to ${VERIFIER_OUT}`);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Setup Complete. Artifacts:");
  console.log(`    WASM:   ${WASM_FILE}`);
  console.log(`    ZKey:   ${ZKEY_FINAL}`);
  console.log(`    VKey:   ${VKEY_FILE}`);
  console.log(`    Sol:    ${VERIFIER_OUT}`);
  console.log("\n  ⚠️  For production: run a multi-party ceremony with");
  console.log("      at least 3 independent contributions before deploying.");
  console.log("═══════════════════════════════════════════════════");
}

// ─────────────────────────────────────────────────────────────────────────────
//  Prove
// ─────────────────────────────────────────────────────────────────────────────

async function prove() {
  const filePath = process.env.FILE;
  const secret   = process.env.SECRET;

  if (!filePath || !secret) {
    throw new Error("Set FILE=./path/to/file SECRET=0x... env vars");
  }

  console.log("═══════════════════════════════════════════════════");
  console.log("  Generating Groth16 Proof");
  console.log("═══════════════════════════════════════════════════");

  // Hash the file
  const fileBuffer = fs.readFileSync(filePath);
  const fileHash   = ethers.keccak256(fileBuffer);
  console.log(`  fileHash : ${fileHash}`);

  // Build field elements
  const poseidon       = await buildPoseidon();
  const fileHash_felt  = BigInt(fileHash) % BN254_P;
  const secret_felt    = BigInt(secret)   % BN254_P;

  if (fileHash_felt === 0n) throw new Error("fileHash reduces to zero mod BN254 — use a different file");
  if (secret_felt   === 0n) throw new Error("secret reduces to zero mod BN254 — generate a new secret");

  // Compute commitment
  const hash           = poseidon([fileHash_felt, secret_felt]);
  const commitment_felt: bigint = poseidon.F.toObject(hash);
  const commitment     = "0x" + commitment_felt.toString(16).padStart(64, "0");
  console.log(`  commitment: ${commitment}`);

  // Circuit inputs
  const input = {
    fileHash:   fileHash_felt.toString(),
    secret:     secret_felt.toString(),    // private — stays in witness
    commitment: commitment_felt.toString(),
  };

  // Generate proof
  console.log("\n  Generating proof...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WASM_FILE,
    ZKEY_FINAL
  );
  console.log("  ✓ Proof generated");

  // Encode for on-chain submission
  const pA: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB: [[bigint, bigint],[bigint,bigint]] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const pC: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

  const zkProof = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256[2]", "uint256[2][2]", "uint256[2]"],
    [pA, pB, pC]
  );

  const bundle = {
    fileHash,
    commitment,
    zkProof,
    publicInputs: publicSignals.map((s: string) => "0x" + BigInt(s).toString(16).padStart(64, "0")),
  };

  // Save bundle
  const outFile = `proof_${Date.now()}.json`;
  fs.writeFileSync(outFile, JSON.stringify(bundle, null, 2));

  // Local verification
  const vKey = JSON.parse(fs.readFileSync(VKEY_FILE, "utf-8"));
  const valid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Local verification : ${valid ? "✓ VALID" : "✗ INVALID"}`);
  console.log(`  Bundle saved to    : ${outFile}`);
  console.log("\n  To verify on-chain:");
  console.log(`    vault.verifyOwnership(${fileHash}, bundle.zkProof, bundle.publicInputs)`);
  console.log("═══════════════════════════════════════════════════");
}

// ─────────────────────────────────────────────────────────────────────────────
//  Entrypoint
// ─────────────────────────────────────────────────────────────────────────────

const cmd = process.argv[2];
(async () => {
  if (cmd === "setup") await setup();
  else if (cmd === "prove") await prove();
  else {
    console.log("Usage: ts-node zkSetup.ts <setup|prove>");
    process.exit(1);
  }
})().catch((e) => { console.error(e); process.exit(1); });
