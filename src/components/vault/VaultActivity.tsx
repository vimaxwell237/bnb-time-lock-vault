"use client";

import { useMemo, useState } from "react";
import { AlertCircle, History, RefreshCw, Search } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ActivityRow } from "@/components/vault/ActivityRow";
import { bscTestnet } from "@/config/wagmi";
import {
  vaultDeploymentBlock,
  vaultDeploymentBlockMessage,
} from "@/contracts/vaultConfig";
import { useVaultActivity } from "@/hooks/useVaultActivity";
import { getReadableError } from "@/lib/errors";
import type { VaultActivityType } from "@/types/activity";

type ActivityFilter = "all" | VaultActivityType;
type ActivitySort = "newest" | "oldest";

const filters: Array<{ label: string; value: ActivityFilter }> = [
  { label: "All", value: "all" },
  { label: "Deposits", value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" },
];

export function VaultActivity() {
  const { address, chainId, isConnected } = useAccount();
  const isCorrectNetwork = chainId === bscTestnet.id;
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [searchId, setSearchId] = useState("");
  const [sortOrder, setSortOrder] = useState<ActivitySort>("newest");

  const activityQuery = useVaultActivity({
    address,
    enabled: isConnected && isCorrectNetwork,
  });

  const filteredActivity = useMemo(() => {
    const normalizedSearch = searchId.trim();
    const visible = (activityQuery.data ?? []).filter((item) => {
      const matchesType = filter === "all" || item.type === filter;
      const matchesSearch =
        !normalizedSearch || item.lockId.toString().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });

    return [...visible].sort((a, b) => {
      if (a.blockNumber === b.blockNumber) {
        return sortOrder === "newest" ? b.logIndex - a.logIndex : a.logIndex - b.logIndex;
      }

      const newest = a.blockNumber > b.blockNumber ? -1 : 1;
      return sortOrder === "newest" ? newest : -newest;
    });
  }, [activityQuery.data, filter, searchId, sortOrder]);

  const counts = useMemo(() => {
    const items = activityQuery.data ?? [];

    return {
      all: items.length,
      deposit: items.filter((item) => item.type === "deposit").length,
      withdrawal: items.filter((item) => item.type === "withdrawal").length,
    };
  }, [activityQuery.data]);

  const emptyTitle = searchId.trim()
    ? "No activity matches this lock ID"
    : filter === "deposit"
      ? "No deposits yet"
      : filter === "withdrawal"
        ? "No withdrawals yet"
        : "No activity yet";

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
            <History className="size-4" />
            Activity
          </h2>
        </div>
        <Button
          disabled={!activityQuery.isEnabled}
          isLoading={activityQuery.isFetching}
          onClick={() => void activityQuery.refetch()}
          size="sm"
          variant="secondary"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {!isConnected ? (
        <ActivityMessage
          message="Connect your wallet to load deposit and withdrawal events for that address."
          title="Wallet not connected"
        />
      ) : !isCorrectNetwork ? (
        <ActivityMessage
          message="Switch your wallet to BSC Testnet to load wallet-specific history."
          title="Wrong network"
        />
      ) : vaultDeploymentBlock === undefined ? (
        <ActivityMessage message={vaultDeploymentBlockMessage} title="Deployment block required" />
      ) : activityQuery.isLoading ? (
        <div className="mt-5 flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <Spinner />
            Loading activity
          </div>
        </div>
      ) : activityQuery.isError ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900" role="alert">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Could not load activity</p>
              <p className="mt-1 text-sm leading-6">
                {getReadableError(activityQuery.error)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((option) => (
              <Button
                key={option.value}
                onClick={() => setFilter(option.value)}
                size="sm"
                variant={filter === option.value ? "primary" : "secondary"}
              >
                {option.label} ({counts[option.value]})
              </Button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-9 size-4 text-slate-400" />
              <Input
                className="pl-9"
                inputMode="numeric"
                label="Search by lock ID"
                onChange={(event) => setSearchId(event.target.value)}
                placeholder="Lock ID"
                value={searchId}
              />
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              <span>Sort</span>
              <select
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setSortOrder(event.target.value as ActivitySort)}
                value={sortOrder}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          {filteredActivity.length === 0 ? (
            <ActivityMessage message="Try another filter or lock ID." title={emptyTitle} />
          ) : (
            <div className="mt-4 space-y-3">
              {filteredActivity.map((activity) => (
                <ActivityRow
                  activity={activity}
                  key={`${activity.transactionHash}-${activity.logIndex}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function ActivityMessage({ message, title }: { message: string; title: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
