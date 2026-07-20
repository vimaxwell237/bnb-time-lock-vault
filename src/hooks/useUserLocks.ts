"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";
import { bscTestnet } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { vaultContractAddress } from "@/contracts/vaultConfig";
import type { VaultLock } from "@/types/vault";

export function useUserLocks(address?: Address) {
  const publicClient = usePublicClient({ chainId: bscTestnet.id });

  return useQuery({
    enabled: Boolean(publicClient && vaultContractAddress && address),
    queryKey: ["user-locks", vaultContractAddress, address],
    queryFn: async (): Promise<VaultLock[]> => {
      const contractAddress = vaultContractAddress;

      if (!publicClient || !contractAddress || !address) {
        return [];
      }

      const lockIds = await publicClient.readContract({
        address: contractAddress,
        abi: vaultAbi,
        functionName: "getUserLockIds",
        args: [address],
      });

      const newestFirst = [...lockIds].reverse();

      return Promise.all(
        newestFirst.map(async (lockId) => {
          const [lock, isWithdrawable] = await Promise.all([
            publicClient.readContract({
              address: contractAddress,
              abi: vaultAbi,
              functionName: "getLock",
              args: [lockId],
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: vaultAbi,
              functionName: "isWithdrawable",
              args: [lockId],
            }),
          ]);

          const [
            owner,
            amount,
            depositedAt,
            releaseTime,
            withdrawn,
            remainingSeconds,
          ] = lock;

          return {
            amount,
            depositedAt,
            id: lockId,
            isWithdrawable,
            owner,
            releaseTime,
            remainingSeconds,
            withdrawn,
          };
        }),
      );
    },
    refetchInterval: 15_000,
  });
}
