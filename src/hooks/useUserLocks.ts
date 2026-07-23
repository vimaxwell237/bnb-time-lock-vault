"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { bscTestnetPublicClient } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { vaultContractAddress } from "@/contracts/vaultConfig";
import type { VaultLock } from "@/types/vault";

export function useUserLocks(address?: Address) {
  return useQuery({
    enabled: Boolean(vaultContractAddress && address),
    queryKey: ["user-locks", vaultContractAddress, address],
    queryFn: async (): Promise<VaultLock[]> => {
      const contractAddress = vaultContractAddress;

      if (!contractAddress || !address) {
        return [];
      }

      const lockIds = await bscTestnetPublicClient.readContract({
        address: contractAddress,
        abi: vaultAbi,
        functionName: "getUserLockIds",
        args: [address],
      });

      const newestFirst = [...lockIds].reverse();

      return Promise.all(
        newestFirst.map(async (lockId) => {
          const [lock, isWithdrawable] = await Promise.all([
            bscTestnetPublicClient.readContract({
              address: contractAddress,
              abi: vaultAbi,
              functionName: "getLock",
              args: [lockId],
            }),
            bscTestnetPublicClient.readContract({
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
