import { buildPoseidon } from "circomlibjs";

const BN254_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

export const generateSecret = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
};

export const computeHash = async (data: ArrayBuffer | string): Promise<string> => {
  const msgUint8 = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

export const encryptFile = async (data: ArrayBuffer, secret: string): Promise<ArrayBuffer> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyBuffer = new TextEncoder().encode(secret);

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", keyBuffer);
  const key = await window.crypto.subtle.importKey("raw", hashBuffer, { name: "AES-GCM" }, false, ["encrypt"]);

  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return combined.buffer;
};

export const decryptFile = async (combined: ArrayBuffer, secret: string): Promise<ArrayBuffer> => {
  const iv = new Uint8Array(combined.slice(0, 12));
  const encrypted = combined.slice(12);

  const keyBuffer = new TextEncoder().encode(secret);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", keyBuffer);
  const key = await window.crypto.subtle.importKey("raw", hashBuffer, { name: "AES-GCM" }, false, ["decrypt"]);

  return await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
};

export const computeCommitment = async (fileHash: string, secret: string): Promise<string> => {
  const poseidon = await buildPoseidon();

  const fileHashClean = fileHash.startsWith("0x") ? fileHash.slice(2) : fileHash;
  const secretClean = secret.startsWith("0x") ? secret.slice(2) : secret;

  let fileHashFelt = BigInt("0x" + fileHashClean) % BN254_FIELD_SIZE;
  let secretFelt = BigInt("0x" + secretClean) % BN254_FIELD_SIZE;

  if (fileHashFelt === 0n) fileHashFelt = 1n;
  if (secretFelt === 0n) secretFelt = 1n;

  const hash = poseidon([fileHashFelt, secretFelt]);
  const commitmentFelt = poseidon.F.toObject(hash) as bigint;

  return "0x" + commitmentFelt.toString(16).padStart(64, "0");
};
