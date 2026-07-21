"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { bscTestnet } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { vaultContractAddress } from "@/contracts/vaultConfig";

export function useVaultLimits() {
  const publicClient = usePublicClient({ chainId: bscTestnet.id });

  return useQuery({
    enabled: Boolean(publicClient && vaultContractAddress),
    queryKey: ["vault-limits", bscTestnet.id, vaultContractAddress],
    queryFn: async () => {
      if (!publicClient || !vaultContractAddress) {
        throw new Error("Contract configuration required.");
      }

      const [minLockDuration, maxLockDuration] = await Promise.all([
        publicClient.readContract({
          address: vaultContractAddress,
          abi: vaultAbi,
          functionName: "MIN_LOCK_DURATION",
        }),
        publicClient.readContract({
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
