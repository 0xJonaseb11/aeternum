#!/usr/bin/env node

import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as snarkjs from "snarkjs";
import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";

const ROOT = path.resolve(__dirname, "..");
const CIRCUIT = path.join(ROOT, "circuits/commitment.circom");
const BUILD_DIR = path.join(ROOT, "build/circuits");
const PTAU_FILE = path.join(BUILD_DIR, "pot15_final.ptau");
const R1CS_FILE = path.join(BUILD_DIR, "commitment.r1cs");
const ZKEY_0 = path.join(BUILD_DIR, "commitment_0.zkey");
const ZKEY_FINAL = path.join(BUILD_DIR, "commitment_final.zkey");
const WASM_FILE = path.join(BUILD_DIR, "commitment_js/commitment.wasm");
const VKEY_FILE = path.join(BUILD_DIR, "verification_key.json");
const VERIFIER_OUT = path.join(ROOT, "contracts/CommitmentVerifier.sol");

const BN254_P = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

async function setup() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  ZK Circuit Trusted Setup");
  console.log("═══════════════════════════════════════════════════");

  fs.mkdirSync(BUILD_DIR, { recursive: true });

  console.log("\n[1/6] Compiling commitment.circom...");
  execFileSync("circom", [CIRCUIT, "--r1cs", "--wasm", "--sym", "--c", "--output", BUILD_DIR, "-l", ROOT], {
    stdio: "inherit",
  });
  console.log("      ✓ Circuit compiled");

  if (!fs.existsSync(PTAU_FILE)) {
    console.log("\n[2/6] Downloading Powers of Tau (pot15)...");
    execFileSync(
      "curl",
      ["-o", PTAU_FILE, "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_15.ptau"],
      {
        stdio: "inherit",
      },
    );
  } else {
    console.log("\n[2/6] Powers of Tau already present, skipping download.");
  }

  console.log("\n[3/6] Running Groth16 circuit-specific setup (phase 2)...");
  await snarkjs.zKey.newZKey(R1CS_FILE, PTAU_FILE, ZKEY_0);
  console.log("      ✓ Initial zkey created");

  console.log("\n[4/6] Contributing randomness to zkey...");
  await snarkjs.zKey.contribute(
    ZKEY_0,
    ZKEY_FINAL,
    "EvidenceVault-Contributor-1",

    ethers.hexlify(ethers.randomBytes(64)),
  );
  console.log("      ✓ Contribution complete → commitment_final.zkey");

  console.log("\n[5/6] Exporting verification key...");
  const vKey = await snarkjs.zKey.exportVerificationKey(ZKEY_FINAL);
  fs.writeFileSync(VKEY_FILE, JSON.stringify(vKey, null, 2));
  console.log(`✓ verification_key.json saved`);

  console.log("\n[6/6] Generating Solidity verifier contract...");
  const verifierTmp = path.join(BUILD_DIR, "verifier.sol");
  execFileSync("npx", ["snarkjs", "zkey", "export", "solidityverifier", ZKEY_FINAL, verifierTmp], {
    stdio: "inherit",
    cwd: ROOT,
  });
  const solidityCode = fs.readFileSync(verifierTmp, "utf8");
  fs.unlinkSync(verifierTmp);

  const renamed = solidityCode.replace("contract Groth16Verifier", "contract CommitmentVerifier");
  fs.writeFileSync(VERIFIER_OUT, renamed);
  console.log(`✓ CommitmentVerifier.sol written to ${VERIFIER_OUT}`);

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

async function prove() {
  const filePath = process.env.FILE;
  const secret = process.env.SECRET;

  if (!filePath || !secret) {
    throw new Error("Set FILE=./path/to/file SECRET=0x... env vars");
  }

  console.log("═══════════════════════════════════════════════════");
  console.log("  Generating Groth16 Proof");
  console.log("═══════════════════════════════════════════════════");

  const fileBuffer = fs.readFileSync(filePath);
  const fileHash = ethers.keccak256(fileBuffer);
  console.log(`  fileHash : ${fileHash}`);

  const poseidon = await buildPoseidon();
  const fileHash_felt = BigInt(fileHash) % BN254_P;
  const secret_felt = BigInt(secret) % BN254_P;

  if (fileHash_felt === 0n) throw new Error("fileHash reduces to zero mod BN254 — use a different file");
  if (secret_felt === 0n) throw new Error("secret reduces to zero mod BN254 — generate a new secret");

  const hash = poseidon([fileHash_felt, secret_felt]);
  const commitment_felt: bigint = poseidon.F.toObject(hash);
  const commitment = "0x" + commitment_felt.toString(16).padStart(64, "0");
  console.log(`  commitment: ${commitment}`);

  const input = {
    fileHash: fileHash_felt.toString(),
    secret: secret_felt.toString(),
    commitment: commitment_felt.toString(),
  };

  console.log("\n  Generating proof...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM_FILE, ZKEY_FINAL);
  console.log("  ✓ Proof generated");

  const pA: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const pC: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

  const zkProof = ethers.AbiCoder.defaultAbiCoder().encode(["uint256[2]", "uint256[2][2]", "uint256[2]"], [pA, pB, pC]);

  const bundle = {
    fileHash,
    commitment,
    zkProof,
    publicInputs: publicSignals.map((s: string) => "0x" + BigInt(s).toString(16).padStart(64, "0")),
  };

  const outFile = `proof_${Date.now()}.json`;
  fs.writeFileSync(outFile, JSON.stringify(bundle, null, 2));

  const vKey = JSON.parse(fs.readFileSync(VKEY_FILE, "utf-8"));
  const valid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Local verification : ${valid ? "✓ VALID" : "✗ INVALID"}`);
  console.log(`  Bundle saved to    : ${outFile}`);
  console.log("\n  To verify on-chain:");
  console.log(`    vault.verifyOwnership(${fileHash}, bundle.zkProof, bundle.publicInputs)`);
  console.log("═══════════════════════════════════════════════════");
}

const cmd = process.argv[2];
(async () => {
  if (cmd === "setup") await setup();
  else if (cmd === "prove") await prove();
  else {
    console.log("Usage: ts-node zkSetup.ts <setup|prove>");
    process.exit(1);
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});
