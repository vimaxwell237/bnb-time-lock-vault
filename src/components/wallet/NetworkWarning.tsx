"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/Button";
import { bscTestnet } from "@/config/wagmi";
import { getReadableError } from "@/lib/errors";

export function NetworkWarning() {
  const { chainId, isConnected } = useAccount();
  const { isPending, switchChainAsync } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);

  if (!isConnected || chainId === bscTestnet.id) {
    return null;
  }

  async function switchToBscTestnet() {
    setError(null);

    try {
      await switchChainAsync({ chainId: bscTestnet.id });
    } catch (switchError) {
      setError(getReadableError(switchError));
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Wrong network selected</p>
            <p className="mt-1 text-sm text-amber-900">
              Switch your wallet to BSC Testnet before depositing or withdrawing.
            </p>
            {error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
          </div>
        </div>
        <Button isLoading={isPending} onClick={switchToBscTestnet} variant="secondary">
          Switch network
        </Button>
      </div>
    </div>
  );
}
