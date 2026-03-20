import { ethers } from "ethers";
import * as snarkjs from "snarkjs";
import { buildPoseidon } from "circomlibjs";
import * as fs from "fs";
import * as crypto from "crypto";

export interface ProofInput {
  fileHash: string;
  secret: string;
  commitment: string;
}

export interface ZKProofBundle {
  zkProof: string;
  publicInputs: bigint[];
  commitment: string;
}

export interface CreateProofTxArgs {
  fileHash: string;
  commitment: string;
  arweaveTxId: string;
  ipfsCid: string;
}

const BN254_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

export function hashFile(fileBuffer: Buffer): string {
  const hash = ethers.keccak256(fileBuffer);
  return hash;
}

export function hashFileFromPath(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return hashFile(buffer);
}

export function generateSecret(): string {
  const bytes = crypto.randomBytes(32);
  return "0x" + bytes.toString("hex");
}

export async function computeCommitment(fileHash: string, secret: string): Promise<string> {
  const poseidon = await buildPoseidon();

  const fileHash_felt = BigInt(fileHash) % BN254_FIELD_SIZE;
  const secret_felt = BigInt(secret) % BN254_FIELD_SIZE;

  if (fileHash_felt === 0n) throw new Error("fileHash_felt is zero after reduction");
  if (secret_felt === 0n) throw new Error("secret_felt is zero after reduction");

  const hash = poseidon([fileHash_felt, secret_felt]);
  const commitment_felt: bigint = poseidon.F.toObject(hash);

  return "0x" + commitment_felt.toString(16).padStart(64, "0");
}

export async function buildProofInput(fileBuffer: Buffer, secret?: string): Promise<ProofInput> {
  const fileHash = hashFile(fileBuffer);
  const _secret = secret ?? generateSecret();
  const commitment = await computeCommitment(fileHash, _secret);

  return { fileHash, secret: _secret, commitment };
}

export async function generateZKProof(wasmPath: string, zkeyPath: string, input: ProofInput): Promise<ZKProofBundle> {
  const poseidon = await buildPoseidon();

  const fileHash_felt = BigInt(input.fileHash) % BN254_FIELD_SIZE;
  const secret_felt = BigInt(input.secret) % BN254_FIELD_SIZE;

  const hash = poseidon([fileHash_felt, secret_felt]);
  const commitment_felt: bigint = poseidon.F.toObject(hash);

  const circuitInput = {
    fileHash: fileHash_felt.toString(),
    secret: secret_felt.toString(),
    commitment: commitment_felt.toString(),
  };

  console.log("⏳ Generating Groth16 proof (this takes ~2-10 seconds)...");

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath);

  const pA: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const pC: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

  const zkProof = ethers.AbiCoder.defaultAbiCoder().encode(["uint256[2]", "uint256[2][2]", "uint256[2]"], [pA, pB, pC]);

  const publicInputs: bigint[] = publicSignals.map((s: string) => BigInt(s));

  return {
    zkProof,
    publicInputs,
    commitment: "0x" + commitment_felt.toString(16).padStart(64, "0"),
  };
}

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

  constructor(proxyAddress: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    this.contract = new ethers.Contract(proxyAddress, EVIDENCE_VAULT_ABI, signerOrProvider);
  }

  async createProof(args: CreateProofTxArgs): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract.createProof(args.fileHash, args.commitment, args.arweaveTxId, args.ipfsCid);
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

  async proofExists(fileHash: string): Promise<boolean> {
    return this.contract.proofExists(fileHash);
  }

  async getProof(fileHash: string): Promise<any> {
    return this.contract.getProof(fileHash);
  }

  async hasAccess(fileHash: string, address: string): Promise<boolean> {
    return this.contract.hasAccess(fileHash, address);
  }

  async verifyOwnership(fileHash: string, bundle: ZKProofBundle): Promise<boolean> {
    return this.contract.verifyOwnership(fileHash, bundle.zkProof, bundle.publicInputs);
  }
}
