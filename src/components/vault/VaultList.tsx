"use client";

import type { Hash } from "viem";
import { AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyVaultState } from "@/components/vault/EmptyVaultState";
import { VaultCard } from "@/components/vault/VaultCard";
import type { VaultLock } from "@/types/vault";

type VaultListProps = {
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  locks: VaultLock[];
  onTransactionConfirmed?: (hash: Hash) => void;
};

export function VaultList({
  error,
  isError,
  isLoading,
  locks,
  onTransactionConfirmed,
}: VaultListProps) {
  const { isConnected } = useAccount();

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
          message="Connect MetaMask to load the lock IDs owned by the selected wallet."
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
        <div className="space-y-4">
          {locks.map((lock) => (
            <VaultCard
              key={lock.id.toString()}
              lock={lock}
              onTransactionConfirmed={onTransactionConfirmed}
            />
          ))}
        </div>
      )}
    </section>
  );
}
