"use client";

import { useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { Copy, ExternalLink, RefreshCw, Settings, WalletCards } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bscTestnet } from "@/config/wagmi";
import { getReadableError } from "@/lib/errors";
import { formatAddress, formatTbnb, getExplorerAddressUrl } from "@/lib/format";
import { useNativeBalance } from "@/hooks/useNativeBalance";

export function WalletSummary() {
  const { address, chainId, isConnected } = useAccount();
  const { open } = useAppKit();
  const [error, setError] = useState<string | null>(null);
  const isCorrectNetwork = chainId === bscTestnet.id;
  const { data: balance, isLoading, refetch } = useNativeBalance(
    address,
    isCorrectNetwork,
  );

  async function openAccount() {
    setError(null);

    try {
      await open({ view: "Account" });
    } catch (openError) {
      setError(getReadableError(openError));
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Wallet</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Account</h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <WalletCards className="size-5" />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Address</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="truncate font-mono text-sm text-slate-950">
              {isConnected ? formatAddress(address, 6) : "Not connected"}
            </p>
            {address ? (
              <button
                aria-label="Copy wallet address"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                onClick={() => void navigator.clipboard.writeText(address)}
                type="button"
              >
                <Copy className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Balance</p>
            <Button
              disabled={!address || !isCorrectNetwork}
              onClick={() => void refetch()}
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {isLoading ? "Loading..." : formatTbnb(balance)}
          </p>
          {!isCorrectNetwork && isConnected ? (
            <p className="mt-2 text-sm text-amber-700">BSC Testnet is required.</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {address ? (
            <a
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              href={getExplorerAddressUrl(address)}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-3.5" />
              Open address
            </a>
          ) : null}
          {isConnected ? (
            <Button onClick={() => void openAccount()} size="sm" variant="secondary">
              <Settings className="size-3.5" />
              Manage wallet
            </Button>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
