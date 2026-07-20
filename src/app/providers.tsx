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
    defaultNetwork: bscTestnet,
    features: {
      allWallets: true,
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
