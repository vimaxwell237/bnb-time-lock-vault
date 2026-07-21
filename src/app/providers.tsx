"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import {
  appKitMetadata,
  bscTestnet,
  reownProjectId,
  wagmiAdapter,
  wagmiConfig,
} from "@/config/wagmi";

if (reownProjectId && wagmiAdapter) {
  createAppKit({
    adapters: [wagmiAdapter],
    allWallets: "SHOW",
    defaultNetwork: bscTestnet,
    featuredWalletIds: [
      "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
      "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    ],
    features: {
      analytics: false,
      connectMethodsOrder: ["wallet"],
      email: false,
      socials: false,
    },
    metadata: appKitMetadata,
    networks: [bscTestnet],
    projectId: reownProjectId,
  });
}

type ProvidersProps = {
  children: ReactNode;
  cookie?: string | null;
};

export function Providers({ children, cookie }: ProvidersProps) {
  const initialState = cookieToInitialState(wagmiConfig, cookie);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
            staleTime: 4_000,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
