"use client";

import { Copy, RefreshCw, WalletCards } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bscTestnet } from "@/config/wagmi";
import { formatAddress, formatTbnb } from "@/lib/format";

export function WalletSummary() {
  const { address, chainId, isConnected } = useAccount();
  const isCorrectNetwork = chainId === bscTestnet.id;
  const { data: balance, isLoading, refetch } = useBalance({
    address,
    chainId: bscTestnet.id,
    query: {
      enabled: Boolean(address && isCorrectNetwork),
    },
  });

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
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
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
            {isLoading ? "Loading..." : formatTbnb(balance?.value)}
          </p>
          {!isCorrectNetwork && isConnected ? (
            <p className="mt-2 text-sm text-amber-700">BSC Testnet is required.</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
