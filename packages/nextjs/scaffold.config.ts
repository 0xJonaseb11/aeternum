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
    zkVerifier: string;
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
    EvidenceVault: "0x5e9C84A4A38fe109F4aB4032c05882C6a49Cc654",
    CommitmentVerifier: "0x2D322C9a3263191C979c3584173396456701464e",
    Groth16VerifierWrapper: "0x6b70354Fa89F08B56382d5b730EEb2835F19d815",
    zkVerifier: "0x6b70354Fa89F08B56382d5b730EEb2835F19d815",
  },
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
