import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

type ChainAttributes = {
  color: string | [string, string];

  nativeCurrencyTokenAddress?: string;
};

export type ChainWithAttributes = chains.Chain & Partial<ChainAttributes>;
export type AllowedChainIds = (typeof scaffoldConfig.targetNetworks)[number]["id"];

export const RPC_CHAIN_NAMES: Record<number, string> = {
  [chains.mainnet.id]: "eth-mainnet",
  [chains.goerli.id]: "eth-goerli",
  [chains.sepolia.id]: "eth-sepolia",
  [chains.optimism.id]: "opt-mainnet",
  [chains.optimismGoerli.id]: "opt-goerli",
  [chains.optimismSepolia.id]: "opt-sepolia",
  [chains.arbitrum.id]: "arb-mainnet",
  [chains.arbitrumGoerli.id]: "arb-goerli",
  [chains.arbitrumSepolia.id]: "arb-sepolia",
  [chains.polygon.id]: "polygon-mainnet",
  [chains.polygonMumbai.id]: "polygon-mumbai",
  [chains.polygonAmoy.id]: "polygon-amoy",
  [chains.astar.id]: "astar-mainnet",
  [chains.polygonZkEvm.id]: "polygonzkevm-mainnet",
  [chains.polygonZkEvmTestnet.id]: "polygonzkevm-testnet",
  [chains.base.id]: "base-mainnet",
  [chains.baseGoerli.id]: "base-goerli",
  [chains.baseSepolia.id]: "base-sepolia",
  [chains.celo.id]: "celo-mainnet",
  [chains.celoSepolia.id]: "celo-sepolia",
};

export const getAlchemyHttpUrl = (chainId: number) => {
  return scaffoldConfig.alchemyApiKey && RPC_CHAIN_NAMES[chainId]
    ? `https://${RPC_CHAIN_NAMES[chainId]}.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`
    : undefined;
};

export const NETWORKS_EXTRA_DATA: Record<string, ChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#e91e63",
  },
  [chains.mainnet.id]: {
    color: "#e91e63",
  },
  [chains.sepolia.id]: {
    color: ["#c2185b", "#e91e63"],
  },
  [chains.gnosis.id]: {
    color: "#1a3a3d",
  },
  [chains.polygon.id]: {
    color: "#e91e63",
  },
  [chains.polygonMumbai.id]: {
    color: "#e91e63",
  },
  [chains.optimismSepolia.id]: {
    color: "#e91e63",
  },
  [chains.optimism.id]: {
    color: "#e91e63",
  },
  [chains.arbitrumSepolia.id]: {
    color: "#1a3a3d",
  },
  [chains.arbitrum.id]: {
    color: "#1a3a3d",
  },
  [chains.fantom.id]: {
    color: "#c2185b",
  },
  [chains.fantomTestnet.id]: {
    color: "#c2185b",
  },
  [chains.scrollSepolia.id]: {
    color: "#e91e63",
  },
  [chains.celo.id]: {
    color: "#e91e63",
  },
  [chains.celoSepolia.id]: {
    color: "#1a3a3d",
  },
  [chains.baseSepolia.id]: {
    color: "#e91e63",
  },
};

export function getBlockExplorerTxLink(chainId: number, txnHash: string) {
  const chainNames = Object.keys(chains);

  const targetChainArr = chainNames.filter(chainName => {
    const wagmiChain = chains[chainName as keyof typeof chains];
    return wagmiChain.id === chainId;
  });

  if (targetChainArr.length === 0) {
    return "";
  }

  const targetChain = targetChainArr[0] as keyof typeof chains;
  const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url;

  if (!blockExplorerTxURL) {
    return "";
  }

  return `${blockExplorerTxURL}/tx/${txnHash}`;
}

export function getBlockExplorerAddressLink(network: chains.Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (network.id === chains.hardhat.id) {
    return `/blockexplorer/address/${address}`;
  }

  if (!blockExplorerBaseURL) {
    return `https://etherscan.io/address/${address}`;
  }

  return `${blockExplorerBaseURL}/address/${address}`;
}

export function getTargetNetworks(): ChainWithAttributes[] {
  return scaffoldConfig.targetNetworks.map(targetNetwork => ({
    ...targetNetwork,
    ...NETWORKS_EXTRA_DATA[targetNetwork.id],
  }));
}
