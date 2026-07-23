"use client";

import { useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { reownProjectId } from "@/config/wagmi";
import { getReadableError } from "@/lib/errors";
import { formatAddress } from "@/lib/format";

type ConfiguredWalletButtonProps = {
  address?: `0x${string}`;
  isConnected: boolean;
};

function ConfiguredWalletButton({
  address,
  isConnected,
}: ConfiguredWalletButtonProps) {
  const { open } = useAppKit();
  const [error, setError] = useState<string | null>(null);

  async function openWalletView() {
    setError(null);

    try {
      await open({ view: isConnected ? "Account" : "Connect" });
    } catch (openError) {
      setError(getReadableError(openError));
    }
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <Button
        aria-label={isConnected ? "Open wallet account" : "Connect wallet"}
        onClick={() => void openWalletView()}
        title={error ?? undefined}
        className="w-full sm:w-auto"
        variant={isConnected ? "secondary" : "primary"}
      >
        <Wallet className="size-4" />
        {isConnected ? formatAddress(address) : "Connect wallet"}
      </Button>
      {error ? (
        <span className="max-w-full text-xs font-semibold text-red-700 sm:max-w-48" role="status">
          Wallet connection failed
        </span>
      ) : null}
    </div>
  );
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();

  if (!reownProjectId) {
    return (
      <Button
        disabled
        title="Add NEXT_PUBLIC_REOWN_PROJECT_ID to .env.local to enable wallet connections."
    >
      <Wallet className="size-4" />
      Connect wallet
    </Button>
  );
  }

  return <ConfiguredWalletButton address={address} isConnected={isConnected} />;
}
