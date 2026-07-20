import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { siteConfig } from "@/config/site";

export const bscTestnetRpcUrl =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL?.trim() ||
  siteConfig.defaultRpcUrl;

export const bscTestnet = defineChain({
  id: siteConfig.chainId,
  name: siteConfig.networkName,
  nativeCurrency: {
    decimals: 18,
    name: "Test BNB",
    symbol: siteConfig.currencySymbol,
  },
  rpcUrls: {
    default: {
      http: [bscTestnetRpcUrl],
    },
    public: {
      http: [bscTestnetRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "BscScan Testnet",
      url: siteConfig.explorerUrl,
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  connectors: [injected({ shimDisconnect: true })],
  ssr: true,
  transports: {
    [bscTestnet.id]: http(bscTestnetRpcUrl),
  },
});
