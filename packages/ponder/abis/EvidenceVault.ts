/**
 * Minimal ABI for EvidenceVault: ProofCreated, ProofRevoked, getProof.
 * Used by the Ponder indexer.
 */
export const EvidenceVaultAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "bytes32", name: "fileHash", type: "bytes32" },
      { indexed: false, internalType: "uint64", name: "timestamp", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "blockNumber", type: "uint64" },
    ],
    name: "ProofCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "bytes32", name: "fileHash", type: "bytes32" },
    ],
    name: "ProofRevoked",
    type: "event",
  },
  {
    inputs: [{ internalType: "bytes32", name: "fileHash", type: "bytes32" }],
    name: "getProof",
    outputs: [
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bool", name: "revoked", type: "bool" },
          { internalType: "uint64", name: "timestamp", type: "uint64" },
          { internalType: "uint64", name: "blockNumber", type: "uint64" },
          { internalType: "bytes32", name: "fileHash", type: "bytes32" },
          { internalType: "bytes32", name: "commitment", type: "bytes32" },
          { internalType: "string", name: "arweaveTxId", type: "string" },
          { internalType: "string", name: "ipfsCid", type: "string" },
        ],
        internalType: "struct IEvidenceVault.Proof",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
