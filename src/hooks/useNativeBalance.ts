"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { bscTestnet, bscTestnetPublicClient } from "@/config/wagmi";

export function useNativeBalance(address?: Address, enabled = true) {
  return useQuery({
    enabled: Boolean(enabled && address),
    queryKey: ["balance", bscTestnet.id, address],
    queryFn: async () => {
      if (!address) {
        return undefined;
      }

      return bscTestnetPublicClient.getBalance({ address });
    },
    refetchInterval: 20_000,
  });
}
