import * as chains from "viem/chains";

export type BaseConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  deployedAddresses?: {
    EvidenceVault: string;
    CommitmentVerifier: string;
    Groth16VerifierWrapper: string;
  };
};

export type ScaffoldConfig = BaseConfig;

export const DEFAULT_ALCHEMY_API_KEY = "cR4WnXePioePZ5fFrnSiR";

const scaffoldConfig = {
  // Base Sepolia only (no local Hardhat) so the app never tries to use 127.0.0.1:8545
  targetNetworks: [chains.baseSepolia],
  pollingInterval: 3000,
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  rpcOverrides: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL
    ? { [chains.baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL }
    : undefined,
  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  onlyLocalBurnerWallet: true,
  // Base Sepolia deployed addresses (for reference / docs)
  deployedAddresses: {
    EvidenceVault: "0x2a24E627ed64b9aD45C721901F49cBf6fCfC24A0",
    CommitmentVerifier: "0x9Ccaa9da1cF937bb20Ce715ACc833AcD707CC2A0",
    Groth16VerifierWrapper: "0xa7a48f7d501e66Aa541bdfe7456652bFb9c460c4",
  },
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
