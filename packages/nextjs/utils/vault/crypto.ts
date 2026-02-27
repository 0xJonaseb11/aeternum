/**
 * Utility functions for client-side encryption, decryption and hashing.
 * Uses Web Crypto API for high performance and security.
 */

/**
 * Generates a random 32-byte secret key for AES-256-GCM.
 */
export const generateSecret = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
};

/**
 * Computes SHA-256 hash of a file or buffer.
 */
export const computeHash = async (data: ArrayBuffer | string): Promise<string> => {
  const msgUint8 = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Encrypts data using AES-256-GCM with the provided secret.
 * Returns a combined ArrayBuffer containing IV and ciphertext.
 */
export const encryptFile = async (data: ArrayBuffer, secret: string): Promise<ArrayBuffer> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyBuffer = new TextEncoder().encode(secret);

  // Hash secret to ensure it's 32 bytes if provided as a string
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", keyBuffer);
  const key = await window.crypto.subtle.importKey("raw", hashBuffer, { name: "AES-GCM" }, false, ["encrypt"]);

  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  // Combine IV and encrypted data: IV (12 bytes) + Ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return combined.buffer;
};

/**
 * Decrypts data using AES-256-GCM with the provided secret.
 */
export const decryptFile = async (combined: ArrayBuffer, secret: string): Promise<ArrayBuffer> => {
  const iv = new Uint8Array(combined.slice(0, 12));
  const encrypted = combined.slice(12);

  const keyBuffer = new TextEncoder().encode(secret);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", keyBuffer);
  const key = await window.crypto.subtle.importKey("raw", hashBuffer, { name: "AES-GCM" }, false, ["decrypt"]);

  return await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
};

/**
 * BN254 field size used on-chain (EvidenceVaultStorage.BN254_FIELD_SIZE).
 * We reduce the commitment into this field so `uint256(commitment) < BN254_FIELD_SIZE` always holds.
 */
const BN254_FIELD_SIZE =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

/**
 * Computes a field-safe commitment for ZK proofs:
 *   h = SHA-256(fileHash || secret)
 *   commitment = h mod BN254_FIELD_SIZE (as bytes32)
 */
export const computeCommitment = async (fileHash: string, secret: string): Promise<string> => {
  // Ensure fileHash is stripped of 0x if present
  const cleanHash = fileHash.startsWith("0x") ? fileHash.slice(2) : fileHash;
  const data = cleanHash + secret;
  const hashHex = await computeHash(data); // 0x-prefixed 32-byte hex

  let value = BigInt(hashHex) % BN254_FIELD_SIZE;
  if (value === 0n) {
    // Avoid zero, which the contract rejects as InvalidInput()
    value = 1n;
  }

  const hex = value.toString(16).padStart(64, "0");
  return `0x${hex}`;
};
