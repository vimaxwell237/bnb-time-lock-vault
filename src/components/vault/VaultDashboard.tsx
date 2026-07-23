"use client";

import { useCallback, useEffect } from "react";
import { LockKeyhole } from "lucide-react";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { NetworkWarning } from "@/components/wallet/NetworkWarning";
import { WalletSummary } from "@/components/wallet/WalletSummary";
import { TransactionNotice } from "@/components/ui/TransactionNotice";
import { DepositForm } from "@/components/vault/DepositForm";
import { VaultActivity } from "@/components/vault/VaultActivity";
import { VaultList } from "@/components/vault/VaultList";
import { VaultStats } from "@/components/vault/VaultStats";
import { reownProjectId } from "@/config/wagmi";
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
      void queryClient.invalidateQueries({ queryKey: ["user-locks"] });
      void queryClient.invalidateQueries({ queryKey: ["vault-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["vault-activity"] });
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes("balance"),
      });
    },
    [queryClient, refetch],
  );

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ["user-locks"] });
  }, [address, queryClient]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="vault-hero vault-enter mb-6 flex items-center justify-between gap-6 px-5 py-6 sm:px-7">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-emerald-700">
            <span className="vault-status-dot" />
            BSC Testnet
            <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-slate-600">
              Chain 97
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            Time-lock vault
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Lock native tBNB, follow every position, and withdraw when it matures.
          </p>
        </div>
        <div className="vault-hero-mark relative z-10 hidden size-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white/80 text-emerald-700 shadow-sm sm:flex">
          <LockKeyhole className="size-8" strokeWidth={1.6} />
        </div>
      </div>

      <div className="space-y-4">
        {!reownProjectId ? (
          <TransactionNotice
            message="Add NEXT_PUBLIC_REOWN_PROJECT_ID to .env.local, then restart the development server or redeploy Vercel to enable wallet connections."
            title="Wallet connection configuration required"
            tone="warning"
          />
        ) : null}
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
        <section className="space-y-6 vault-enter vault-enter-delay-1">
          <VaultStats />
          <VaultList
            error={locksQuery.error}
            isError={locksQuery.isError}
            isLoading={locksQuery.isLoading}
            locks={locksQuery.data ?? []}
            onTransactionConfirmed={refreshVaultData}
          />
          <VaultActivity />
        </section>

        <aside className="space-y-6 vault-enter vault-enter-delay-2 lg:sticky lg:top-6 lg:self-start">
          <WalletSummary />
          <DepositForm onTransactionConfirmed={refreshVaultData} />
        </aside>
      </div>
    </div>
  );
}
