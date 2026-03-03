import { buildPoseidon } from "circomlibjs";

const BN254_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

const WASM_URL = "/zk/commitment.wasm";
const ZKEY_URL = "/zk/commitment_final.zkey";

export interface ZKProofBundle {
  zkProof: `0x${string}`;
  publicInputs: [bigint, bigint];
}

function toFieldHex(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const value = BigInt("0x" + clean) % BN254_FIELD_SIZE;
  if (value === 0n) throw new Error("Field element cannot be zero");
  return value.toString();
}

async function getCommitmentFelt(
  fileHash: string,
  secret: string,
): Promise<{ commitmentHex: string; commitmentFelt: string }> {
  const poseidon = await buildPoseidon();
  const fileHashFelt = toFieldHex(fileHash);
  const secretFelt = toFieldHex(secret);
  const hash = poseidon([BigInt(fileHashFelt), BigInt(secretFelt)]);
  const commitmentFelt = (poseidon.F.toObject(hash) as bigint).toString();
  const commitmentHex = "0x" + BigInt(commitmentFelt).toString(16).padStart(64, "0");
  return { commitmentHex, commitmentFelt };
}

export async function generateZKProofBundle(fileHash: string, secret: string): Promise<ZKProofBundle> {
  const { commitmentFelt } = await getCommitmentFelt(fileHash, secret);
  const fileHashFelt = toFieldHex(fileHash);
  const secretFelt = toFieldHex(secret);

  const input = {
    fileHash: fileHashFelt,
    secret: secretFelt,
    commitment: commitmentFelt,
  };

  const wasmPath = typeof window !== "undefined" ? `${window.location.origin}${WASM_URL}` : WASM_URL;
  const zkeyPath = typeof window !== "undefined" ? `${window.location.origin}${ZKEY_URL}` : ZKEY_URL;

  const snarkjs = await import("snarkjs");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

  const pA: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const pC: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

  const { encodeAbiParameters, parseAbiParameters } = await import("viem");
  const zkProof = encodeAbiParameters(parseAbiParameters("uint256[2], uint256[2][2], uint256[2]"), [
    pA,
    pB,
    pC,
  ]) as `0x${string}`;

  const publicInputs: [bigint, bigint] = [BigInt(publicSignals[0]), BigInt(publicSignals[1])];

  return { zkProof, publicInputs };
}

export async function isZKArtifactsAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const r = await fetch(WASM_URL, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}
