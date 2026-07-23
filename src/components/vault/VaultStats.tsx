"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, Clock, Coins, Landmark } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { bscTestnetPublicClient } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { vaultContractAddress } from "@/contracts/vaultConfig";
import { formatDurationFromMinutes, formatTbnb } from "@/lib/format";
import type { VaultStatsSnapshot } from "@/types/vault";

export function VaultStats() {
  const { data, isLoading } = useQuery({
    enabled: Boolean(vaultContractAddress),
    queryKey: ["vault-stats", vaultContractAddress],
    queryFn: async (): Promise<VaultStatsSnapshot> => {
      if (!vaultContractAddress) {
        throw new Error("Contract configuration required.");
      }

      const [
        contractBalance,
        totalLocked,
        nextLockId,
        minLockDuration,
        maxLockDuration,
      ] = await Promise.all([
        bscTestnetPublicClient.readContract({
          address: vaultContractAddress,
          abi: vaultAbi,
          functionName: "contractBalance",
        }),
        bscTestnetPublicClient.readContract({
          address: vaultContractAddress,
          abi: vaultAbi,
          functionName: "totalLocked",
        }),
        bscTestnetPublicClient.readContract({
          address: vaultContractAddress,
          abi: vaultAbi,
          functionName: "nextLockId",
        }),
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

      return {
        contractBalance,
        maxLockDuration,
        minLockDuration,
        nextLockId,
        totalLocked,
      };
    },
    refetchInterval: 20_000,
  });

  const stats = [
    {
      icon: Coins,
      label: "Total locked",
      value: formatTbnb(data?.totalLocked),
    },
    {
      icon: Landmark,
      label: "Contract balance",
      value: formatTbnb(data?.contractBalance),
    },
    {
      icon: Boxes,
      label: "Next lock ID",
      value: data?.nextLockId?.toString() ?? "--",
    },
    {
      icon: Clock,
      label: "Duration range",
      value:
        data?.minLockDuration !== undefined && data?.maxLockDuration !== undefined
          ? `${formatDurationFromMinutes(data.minLockDuration)} - ${formatDurationFromMinutes(
              data.maxLockDuration,
            )}`
          : "--",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card
            className="vault-enter min-h-36 p-5"
            key={stat.label}
            style={{ animationDelay: `${120 + index * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className="mt-3 break-words text-2xl font-bold text-slate-950">
                  {isLoading ? <Spinner /> : stat.value}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Icon className="size-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
