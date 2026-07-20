"use client";

import { useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { NetworkWarning } from "@/components/wallet/NetworkWarning";
import { WalletSummary } from "@/components/wallet/WalletSummary";
import { TransactionNotice } from "@/components/ui/TransactionNotice";
import { DepositForm } from "@/components/vault/DepositForm";
import { VaultList } from "@/components/vault/VaultList";
import { VaultStats } from "@/components/vault/VaultStats";
import { useUserLocks } from "@/hooks/useUserLocks";
import { useVaultContract } from "@/hooks/useVaultContract";

export function VaultDashboard() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { configMessage, isConfigured } = useVaultContract();
  const locksQuery = useUserLocks(address);
  const { refetch } = locksQuery;

  const refreshVaultData = useCallback(
    () => {
      void refetch();
      void queryClient.invalidateQueries();
    },
    [queryClient, refetch],
  );

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ["user-locks"] });
  }, [address, queryClient]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">BSC Testnet</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            Time-lock vault dashboard
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Lock native tBNB by duration, track each lock, and withdraw only after maturity.
        </p>
      </div>

      <div className="space-y-4">
        {!isConfigured ? (
          <TransactionNotice
            message={`${configMessage} Deposit and withdrawal actions are disabled until .env.local contains the deployed BSC Testnet contract address.`}
            title="Contract configuration required"
            tone="warning"
          />
        ) : null}
        <NetworkWarning />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6">
          <VaultStats />
          <VaultList
            error={locksQuery.error}
            isError={locksQuery.isError}
            isLoading={locksQuery.isLoading}
            locks={locksQuery.data ?? []}
            onTransactionConfirmed={refreshVaultData}
          />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <WalletSummary />
          <DepositForm onTransactionConfirmed={refreshVaultData} />
        </aside>
      </div>
    </div>
  );
}
