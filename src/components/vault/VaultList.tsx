"use client";

import { useMemo, useState } from "react";
import type { Hash } from "viem";
import { AlertCircle, Search } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyVaultState } from "@/components/vault/EmptyVaultState";
import { VaultCard } from "@/components/vault/VaultCard";
import type { LockStatus, VaultLock } from "@/types/vault";

type VaultListProps = {
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  locks: VaultLock[];
  onTransactionConfirmed?: (hash: Hash) => void;
};

type LockFilter = "all" | LockStatus;
type LockSort =
  | "newest"
  | "oldest"
  | "release-soonest"
  | "release-latest"
  | "highest"
  | "lowest";

const filterOptions: Array<{ label: string; value: LockFilter }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Ready", value: "matured" },
  { label: "Withdrawn", value: "withdrawn" },
];

export function VaultList({
  error,
  isError,
  isLoading,
  locks,
  onTransactionConfirmed,
}: VaultListProps) {
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<LockFilter>("all");
  const [searchId, setSearchId] = useState("");
  const [sortOrder, setSortOrder] = useState<LockSort>("newest");

  const lockStatuses = useMemo(
    () =>
      locks.map((lock) => ({
        lock,
        status: getLockStatus(lock),
      })),
    [locks],
  );

  const counts = useMemo(
    () => ({
      active: lockStatuses.filter((item) => item.status === "active").length,
      all: lockStatuses.length,
      matured: lockStatuses.filter((item) => item.status === "matured").length,
      withdrawn: lockStatuses.filter((item) => item.status === "withdrawn").length,
    }),
    [lockStatuses],
  );

  const visibleLocks = useMemo(() => {
    const normalizedSearch = searchId.trim();

    const matches = lockStatuses.filter(({ lock, status }) => {
      const matchesStatus = filter === "all" || status === filter;
      const matchesSearch =
        !normalizedSearch || lock.id.toString().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    return [...matches]
      .sort((a, b) => sortLocks(a.lock, b.lock, sortOrder))
      .map(({ lock }) => lock);
  }, [filter, lockStatuses, searchId, sortOrder]);

  const emptyTitle = searchId.trim()
    ? "No lock matches this ID"
    : filter === "active"
      ? "No active locks"
      : filter === "matured"
        ? "No matured locks are ready"
        : filter === "withdrawn"
          ? "No withdrawn locks"
          : "No locks found";

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Locks</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Your vault positions</h2>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900">
          {locks.length} total
        </div>
      </div>

      {!isConnected ? (
        <EmptyVaultState
          message="Connect your wallet to load the lock IDs owned by the selected address."
          title="Wallet not connected"
        />
      ) : isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <Spinner />
            Loading locks
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Could not load vault locks</p>
              <p className="mt-1 text-sm leading-6">{error?.message ?? "Unknown read error."}</p>
            </div>
          </div>
        </div>
      ) : locks.length === 0 ? (
        <EmptyVaultState
          message="No lock IDs were returned by the deployed contract for this wallet."
          title="No locks found"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {filterOptions.map((option) => (
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

          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
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
              <span>Sort positions</span>
              <select
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setSortOrder(event.target.value as LockSort)}
                value={sortOrder}
              >
                <option value="newest">Newest deposit</option>
                <option value="oldest">Oldest deposit</option>
                <option value="release-soonest">Release soonest</option>
                <option value="release-latest">Release latest</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </label>
          </div>

          {visibleLocks.length === 0 ? (
            <EmptyVaultState message="Try another status, sort, or lock ID." title={emptyTitle} />
          ) : (
            <div className="space-y-4">
              {visibleLocks.map((lock) => (
                <VaultCard
                  key={lock.id.toString()}
                  lock={lock}
                  onTransactionConfirmed={onTransactionConfirmed}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function getLockStatus(lock: VaultLock): LockStatus {
  if (lock.withdrawn) {
    return "withdrawn";
  }

  return lock.isWithdrawable || lock.releaseTime <= BigInt(Math.floor(Date.now() / 1000))
    ? "matured"
    : "active";
}

function sortLocks(a: VaultLock, b: VaultLock, sortOrder: LockSort) {
  switch (sortOrder) {
    case "oldest":
      return compareBigInt(a.depositedAt, b.depositedAt);
    case "release-soonest":
      return compareBigInt(a.releaseTime, b.releaseTime);
    case "release-latest":
      return compareBigInt(b.releaseTime, a.releaseTime);
    case "highest":
      return compareBigInt(b.amount, a.amount);
    case "lowest":
      return compareBigInt(a.amount, b.amount);
    case "newest":
    default:
      return compareBigInt(b.depositedAt, a.depositedAt);
  }
}

function compareBigInt(a: bigint, b: bigint) {
  if (a === b) {
    return 0;
  }

  return a > b ? 1 : -1;
}
