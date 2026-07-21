import { defineChain } from "viem";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
} from "wagmi";
import { siteConfig } from "@/config/site";

export const bscTestnetRpcUrl =
  getSafeBscTestnetRpcUrl(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL);

function getSafeBscTestnetRpcUrl(value?: string) {
  const trimmed = value?.trim();

  if (
    !trimmed ||
    trimmed.includes("NEXT_PUBLIC_") ||
    trimmed.includes("rpc.walletconnect.org")
  ) {
    return siteConfig.defaultRpcUrl;
  }

  try {
    const parsed = new URL(trimmed);

    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? trimmed
      : siteConfig.defaultRpcUrl;
  } catch {
    return siteConfig.defaultRpcUrl;
  }
}

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

export const reownProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() || "";

export const appKitMetadata = {
  name: siteConfig.name,
  description: "Lock native tBNB by duration and withdraw after maturity.",
  url:
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://bnb-time-lock-vault.vercel.app",
  icons: [],
};

const storage = createStorage({ storage: cookieStorage });
const transportConfig = {
  [bscTestnet.id]: http(bscTestnetRpcUrl),
};

export const wagmiAdapter = reownProjectId
  ? new WagmiAdapter({
      networks: [bscTestnet],
      projectId: reownProjectId,
      ssr: true,
      storage,
      transports: transportConfig,
    })
  : undefined;

export const wagmiConfig =
  wagmiAdapter?.wagmiConfig ??
  createConfig({
    chains: [bscTestnet],
    connectors: [],
    ssr: true,
    storage,
    transports: transportConfig,
  });
