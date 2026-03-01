import { createConfig } from "ponder";
import { EvidenceVaultAbi } from "./abis/EvidenceVault";

// Base Sepolia chain id 84532; EvidenceVault deployed at 0x2a24E627ed64b9aD45C721901F49cBf6fCfC24A0
const EVIDENCE_VAULT_START_BLOCK = 38_182_546;

export default createConfig({
  chains: {
    baseSepolia: {
      id: 84_532,
      rpc: process.env.PONDER_RPC_URL_84532 ?? "https://sepolia.base.org",
    },
  },
  contracts: {
    EvidenceVault: {
      abi: EvidenceVaultAbi,
      chain: "baseSepolia",
      address: "0x2a24E627ed64b9aD45C721901F49cBf6fCfC24A0",
      startBlock: EVIDENCE_VAULT_START_BLOCK,
    },
  },
});
