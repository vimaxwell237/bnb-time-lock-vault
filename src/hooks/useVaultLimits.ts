"use client";

import { useQuery } from "@tanstack/react-query";
import { bscTestnet, bscTestnetPublicClient } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { vaultContractAddress } from "@/contracts/vaultConfig";

export function useVaultLimits() {
  return useQuery({
    enabled: Boolean(vaultContractAddress),
    queryKey: ["vault-limits", bscTestnet.id, vaultContractAddress],
    queryFn: async () => {
      if (!vaultContractAddress) {
        throw new Error("Contract configuration required.");
      }

      const [minLockDuration, maxLockDuration] = await Promise.all([
        bscTestnetPublicClient.readContract({
          address: vaultContractAddress,
          abi: vaultAbi,
          functionName: "MIN_LOCK_DURATION",
        }),
        bscTestnetPublicClient.readContract({
          address: vaultContractAddress,
          abi: vaultAbi,
          functionName: "MAX_LOCK_DURATION",
        }),
      ]);

      return { maxLockDuration, minLockDuration };
    },
    staleTime: 60_000,
  });
}
