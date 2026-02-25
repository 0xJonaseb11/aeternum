/**
 * EvidenceVault Client SDK
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all off-chain operations:
 *   • File hashing
 *   • Poseidon commitment generation
 *   • Groth16 ZK proof generation (secret never leaves this machine)
 *   • Proof encoding for on-chain submission
 *   • Contract interaction helpers
 *
 * Dependencies:
 *   npm install ethers snarkjs circomlibjs
 *   npm install -D @types/node
 */

import { ethers }       from "ethers";
import * as snarkjs     from "snarkjs";
import { buildPoseidon } from "circomlibjs";
import * as fs          from "fs";
import * as crypto      from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProofInput {
  fileHash:   string;   // bytes32 hex
  secret:     string;   // bytes32 hex — KEEP PRIVATE
  commitment: string;   // bytes32 hex — store on-chain
}

export interface ZKProofBundle {
  zkProof:      string;       // ABI-encoded Groth16 proof (pA, pB, pC)
  publicInputs: bigint[];     // [fileHash_felt, commitment_felt]
  commitment:   string;       // bytes32 hex commitment
}

export interface CreateProofTxArgs {
  fileHash:    string;  // bytes32
  commitment:  string;  // bytes32
  arweaveTxId: string;  // 43-char Arweave TxID
  ipfsCid:     string;  // IPFS CID or "" to omit
}

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

// BN254 (alt_bn128) scalar field size — same prime used inside Circom circuits
const BN254_FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

// ─────────────────────────────────────────────────────────────────────────────
//  1. File Hashing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hash a file buffer with keccak256 and return a bytes32 hex string.
 * This is the `fileHash` stored on-chain and used as a public circuit input.
 */
export function hashFile(fileBuffer: Buffer): string {
  const hash = ethers.keccak256(fileBuffer);
  return hash; // 0x-prefixed bytes32
}

/**
 * Read a file from disk and return its keccak256 hash.
 */
export function hashFileFromPath(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return hashFile(buffer);
}

// ─────────────────────────────────────────────────────────────────────────────
//  2. Secret Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random 32-byte secret.
 *
 * ⚠️  CRITICAL: Store this secret in a password manager or encrypted vault.
 *     Loss of secret = loss of ZK proof generation capability.
 *     The secret is NEVER stored on-chain or transmitted in transactions.
 */
export function generateSecret(): string {
  const bytes = crypto.randomBytes(32);
  return "0x" + bytes.toString("hex");
}

// ─────────────────────────────────────────────────────────────────────────────
//  3. Poseidon Commitment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the Poseidon commitment:
 *   commitment = Poseidon([fileHash_felt, secret_felt])
 *
 * Both inputs are reduced modulo BN254_FIELD_SIZE before hashing
 * to ensure they are valid field elements (matching the Circom circuit).
 *
 * Returns a bytes32 hex string matching what the circuit outputs as `commitment`.
 */
export async function computeCommitment(
  fileHash: string,
  secret:   string
): Promise<string> {
  const poseidon = await buildPoseidon();

  // Reduce inputs to BN254 field elements
  const fileHash_felt = BigInt(fileHash) % BN254_FIELD_SIZE;
  const secret_felt   = BigInt(secret)   % BN254_FIELD_SIZE;

  if (fileHash_felt === 0n) throw new Error("fileHash_felt is zero after reduction");
  if (secret_felt   === 0n) throw new Error("secret_felt is zero after reduction");

  // Poseidon returns a BigInt field element
  const hash = poseidon([fileHash_felt, secret_felt]);
  const commitment_felt: bigint = poseidon.F.toObject(hash);

  // Pad to 32 bytes and return as 0x-prefixed hex
  return "0x" + commitment_felt.toString(16).padStart(64, "0");
}

/**
 * Build the full ProofInput object (fileHash + secret + commitment).
 * Call this BEFORE uploading to Arweave/IPFS — you need the commitment for createProof().
 */
export async function buildProofInput(
  fileBuffer: Buffer,
  secret?: string
): Promise<ProofInput> {
  const fileHash  = hashFile(fileBuffer);
  const _secret   = secret ?? generateSecret();
  const commitment = await computeCommitment(fileHash, _secret);

  return { fileHash, secret: _secret, commitment };
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. ZK Proof Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a Groth16 ZK proof that proves:
 *   commitment = Poseidon(fileHash, secret)
 *
 * WITHOUT revealing `secret`. The secret is embedded as a private witness
 * inside the proof and never appears in publicInputs or calldata.
 *
 * @param wasmPath  Path to commitment_js/commitment.wasm (compiled circuit)
 * @param zkeyPath  Path to commitment_final.zkey (after trusted setup)
 * @param input     ProofInput from buildProofInput()
 */
export async function generateZKProof(
  wasmPath: string,
  zkeyPath: string,
  input:    ProofInput
): Promise<ZKProofBundle> {
  const poseidon = await buildPoseidon();

  // Reduce to field elements (must match circuit)
  const fileHash_felt = BigInt(input.fileHash) % BN254_FIELD_SIZE;
  const secret_felt   = BigInt(input.secret)   % BN254_FIELD_SIZE;

  // Recompute commitment for verification
  const hash = poseidon([fileHash_felt, secret_felt]);
  const commitment_felt: bigint = poseidon.F.toObject(hash);

  // Circuit input — private witness included here, never goes on-chain
  const circuitInput = {
    fileHash:   fileHash_felt.toString(),    // public
    secret:     secret_felt.toString(),      // PRIVATE — stays in witness
    commitment: commitment_felt.toString(),  // public
  };

  console.log("⏳ Generating Groth16 proof (this takes ~2-10 seconds)...");

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInput,
    wasmPath,
    zkeyPath
  );

  // Encode proof for on-chain submission
  // SnarkJS Groth16 proof structure: { pi_a, pi_b, pi_c }
  //   pi_a = [x, y]         (G1 point, 2 × uint256)
  //   pi_b = [[x1,x2],[y1,y2]]  (G2 point, 4 × uint256)
  //   pi_c = [x, y]         (G1 point, 2 × uint256)
  const pA: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],  // Note: SnarkJS uses reversed x-coords for G2
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const pC: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

  // ABI-encode as (uint256[2], uint256[2][2], uint256[2]) = 8 × uint256 = 256 bytes
  const zkProof = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256[2]", "uint256[2][2]", "uint256[2]"],
    [pA, pB, pC]
  );

  // Public inputs for on-chain verification
  const publicInputs: bigint[] = publicSignals.map((s: string) => BigInt(s));

  return {
    zkProof,
    publicInputs,
    commitment: "0x" + commitment_felt.toString(16).padStart(64, "0"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. Contract Interaction Helpers
// ─────────────────────────────────────────────────────────────────────────────

const EVIDENCE_VAULT_ABI = [
  "function createProof(bytes32 fileHash, bytes32 commitment, string calldata arweaveTxId, string calldata ipfsCid) external",
  "function addBackup(bytes32 fileHash, string calldata ipfsCid) external",
  "function revokeProof(bytes32 fileHash) external",
  "function grantAccess(bytes32 fileHash, address grantee) external",
  "function revokeAccess(bytes32 fileHash, address grantee) external",
  "function proofExists(bytes32 fileHash) external view returns (bool)",
  "function getProof(bytes32 fileHash) external view returns (tuple(address owner, bool revoked, uint64 timestamp, uint64 blockNumber, bytes32 fileHash, bytes32 commitment, string arweaveTxId, string ipfsCid))",
  "function verifyOwnership(bytes32 fileHash, bytes calldata zkProof, uint256[] calldata publicInputs) external view returns (bool)",
  "function hasAccess(bytes32 fileHash, address grantee) external view returns (bool)",
  "function ownerProofCount(address owner) external view returns (uint256)",
];

export class EvidenceVaultClient {
  private contract: ethers.Contract;

  constructor(
    proxyAddress: string,
    signerOrProvider: ethers.Signer | ethers.Provider
  ) {
    this.contract = new ethers.Contract(proxyAddress, EVIDENCE_VAULT_ABI, signerOrProvider);
  }

  // ── Write ────────────────────────────────────────────────────────────────

  /**
   * Register a new evidence proof on-chain.
   * Call AFTER uploading the encrypted file to Arweave.
   */
  async createProof(args: CreateProofTxArgs): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract.createProof(
      args.fileHash,
      args.commitment,
      args.arweaveTxId,
      args.ipfsCid
    );
    return tx.wait();
  }

  async addBackup(fileHash: string, ipfsCid: string): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract.addBackup(fileHash, ipfsCid);
    return tx.wait();
  }

  async revokeProof(fileHash: string): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract.revokeProof(fileHash);
    return tx.wait();
  }

  async grantAccess(fileHash: string, grantee: string): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract.grantAccess(fileHash, grantee);
    return tx.wait();
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  async proofExists(fileHash: string): Promise<boolean> {
    return this.contract.proofExists(fileHash);
  }

  async getProof(fileHash: string): Promise<any> {
    return this.contract.getProof(fileHash);
  }

  async hasAccess(fileHash: string, address: string): Promise<boolean> {
    return this.contract.hasAccess(fileHash, address);
  }

  // ── ZK Verification ──────────────────────────────────────────────────────

  /**
   * Verify ownership of a proof via a real Groth16 ZK proof.
   * The `secret` never appears on-chain — only the proof bundle is submitted.
   *
   * @param fileHash    bytes32 file hash
   * @param bundle      ZKProofBundle from generateZKProof()
   */
  async verifyOwnership(
    fileHash: string,
    bundle:   ZKProofBundle
  ): Promise<boolean> {
    return this.contract.verifyOwnership(
      fileHash,
      bundle.zkProof,
      bundle.publicInputs
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  6. End-to-End Example
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete workflow example:
 *
 *   const fileBuffer = fs.readFileSync("./my-document.pdf");
 *
 *   // Step 1: Build commitment (before uploading)
 *   const proofInput = await buildProofInput(fileBuffer);
 *   console.log("commitment:", proofInput.commitment);
 *   // ⚠️  Save proofInput.secret securely NOW — it cannot be recovered!
 *
 *   // Step 2: Encrypt + upload to Arweave
 *   const arweaveTxId = await uploadToArweave(encryptFile(fileBuffer));
 *
 *   // Step 3: Register on-chain
 *   const client = new EvidenceVaultClient(PROXY_ADDRESS, signer);
 *   await client.createProof({
 *     fileHash:    proofInput.fileHash,
 *     commitment:  proofInput.commitment,
 *     arweaveTxId,
 *     ipfsCid: "",
 *   });
 *
 *   // Step 4: Later — prove ownership WITHOUT revealing secret
 *   const bundle = await generateZKProof(WASM_PATH, ZKEY_PATH, proofInput);
 *   const isOwner = await client.verifyOwnership(proofInput.fileHash, bundle);
 *   console.log("Verified:", isOwner); // true — secret never left this machine
 */
