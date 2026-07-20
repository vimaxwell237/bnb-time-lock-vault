"use client";

import { useMemo, useSyncExternalStore } from "react";
import { LogOut, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { formatAddress } from "@/lib/format";

type EthereumWindow = Window & {
  ethereum?: {
    isMetaMask?: boolean;
  };
};

const subscribeToProvider = () => () => undefined;
const getServerProviderSnapshot = () => false;
const getClientProviderSnapshot = () =>
  typeof window !== "undefined" && Boolean((window as EthereumWindow).ethereum?.isMetaMask);

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const hasInjectedWallet = useSyncExternalStore(
    subscribeToProvider,
    getClientProviderSnapshot,
    getServerProviderSnapshot,
  );

  const injectedConnector = useMemo(
    () => connectors.find((connector) => connector.id === "injected") ?? connectors[0],
    [connectors],
  );

  if (isConnected) {
    return (
      <Button onClick={() => disconnect()} variant="secondary">
        <LogOut className="size-4" />
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      disabled={!hasInjectedWallet || !injectedConnector}
      isLoading={isPending}
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
    >
      <Wallet className="size-4" />
      {hasInjectedWallet ? "Connect MetaMask" : "Install MetaMask"}
    </Button>
  );
}
