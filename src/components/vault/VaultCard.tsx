"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Hash } from "viem";
import { Banknote, CalendarClock, CircleDollarSign, HashIcon } from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TransactionNotice } from "@/components/ui/TransactionNotice";
import { bscTestnet } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { useCountdown } from "@/hooks/useCountdown";
import { useVaultContract } from "@/hooks/useVaultContract";
import { getReadableError } from "@/lib/errors";
import { formatAddress, formatDateTime, formatTbnb } from "@/lib/format";
import type { LockStatus, VaultLock } from "@/types/vault";

type VaultCardProps = {
  lock: VaultLock;
  onTransactionConfirmed?: (hash: Hash) => void;
};

export function VaultCard({ lock, onTransactionConfirmed }: VaultCardProps) {
  const { address, chainId, isConnected } = useAccount();
  const { address: vaultAddress, isConfigured } = useVaultContract();
  const { isPending, writeContractAsync } = useWriteContract();
  const countdown = useCountdown(lock.releaseTime, lock.withdrawn);
  const [transactionHash, setTransactionHash] = useState<Hash | undefined>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const handledHashRef = useRef<Hash | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isCorrectNetwork = chainId === bscTestnet.id;
  const isOwner = address?.toLowerCase() === lock.owner.toLowerCase();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    chainId: bscTestnet.id,
    hash: transactionHash,
    query: {
      enabled: Boolean(transactionHash),
    },
  });

  const status: LockStatus = useMemo(() => {
    if (lock.withdrawn) {
      return "withdrawn";
    }

    return countdown.isMatured ? "matured" : "active";
  }, [countdown.isMatured, lock.withdrawn]);

  const canWithdraw =
    isConfigured &&
    isConnected &&
    isCorrectNetwork &&
    isOwner &&
    !lock.withdrawn &&
    status === "matured" &&
    Boolean(vaultAddress);

  useEffect(() => {
    if (
      isConfirmed &&
      receipt?.transactionHash &&
      receipt.transactionHash !== handledHashRef.current
    ) {
      handledHashRef.current = receipt.transactionHash;
      onTransactionConfirmed?.(receipt.transactionHash);
    }
  }, [isConfirmed, onTransactionConfirmed, receipt?.transactionHash]);

  function requestWithdraw() {
    setError(null);

    if (!vaultAddress) {
      setError("Contract configuration required. Add the contract address to .env.local.");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Switch your wallet to BSC Testnet before withdrawing.");
      return;
    }

    if (!isOwner) {
      setError("The connected wallet is not the owner of this lock.");
      return;
    }

    if (lock.withdrawn) {
      setError("This lock has already been withdrawn.");
      return;
    }

    if (status !== "matured") {
      setError("Funds are still locked until the release time.");
      return;
    }

    setIsConfirmOpen(true);
  }

  async function withdraw() {
    setError(null);
    setIsConfirmOpen(false);

    if (!vaultAddress) {
      setError("Contract configuration required. Add the contract address to .env.local.");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Switch your wallet to BSC Testnet before withdrawing.");
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "withdraw",
        args: [lock.id],
        chainId: bscTestnet.id,
      });

      setTransactionHash(hash);
    } catch (writeError) {
      setError(getReadableError(writeError));
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-900">
              <HashIcon className="size-4" />
              {lock.id.toString()}
            </div>
            <StatusBadge status={status} />
          </div>
          <p className="mt-3 truncate font-mono text-sm text-slate-500">
            Owner {formatAddress(lock.owner, 6)}
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={!canWithdraw || isPending || isConfirming}
          isLoading={isPending || isConfirming}
          onClick={requestWithdraw}
          variant={status === "matured" ? "primary" : "secondary"}
        >
          {isPending
            ? "Waiting for wallet approval"
            : isConfirming
              ? "Waiting for confirmation"
              : "Withdraw"}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCell
          icon={<CircleDollarSign className="size-4" />}
          label="Amount"
          value={formatTbnb(lock.amount)}
        />
        <InfoCell
          icon={<CalendarClock className="size-4" />}
          label="Deposited"
          value={formatDateTime(lock.depositedAt)}
        />
        <InfoCell
          icon={<CalendarClock className="size-4" />}
          label="Release"
          value={formatDateTime(lock.releaseTime)}
        />
        <InfoCell
          icon={<Banknote className="size-4" />}
          label="Remaining"
          value={status === "active" ? countdown.label : status === "matured" ? "Ready" : "Withdrawn"}
        />
      </div>

      {error ? (
        <TransactionNotice
          className="mt-4"
          message={error}
          title="Withdrawal failed"
          tone="error"
        />
      ) : null}

      {transactionHash ? (
        <TransactionNotice
          className="mt-4"
          hash={transactionHash}
          message={
            isConfirmed
              ? "Withdrawal confirmed. Vault data is refreshing."
              : "Withdrawal submitted. Waiting for BSC Testnet confirmation."
          }
          title={isConfirmed ? "Withdrawal confirmed" : "Transaction submitted"}
          tone={isConfirmed ? "success" : "info"}
        />
      ) : null}

      <Dialog
        labelledBy={`withdraw-confirmation-title-${lock.id.toString()}`}
        onClose={() => setIsConfirmOpen(false)}
        open={isConfirmOpen}
      >
        <div className="pr-10">
          <p className="text-sm font-semibold text-slate-500">Confirm withdrawal</p>
          <h3
            className="mt-1 text-xl font-bold text-slate-950"
            id={`withdraw-confirmation-title-${lock.id.toString()}`}
          >
            Withdraw lock #{lock.id.toString()}
          </h3>
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          <SummaryRow label="Amount" value={formatTbnb(lock.amount)} />
          <SummaryRow label="Owner" value={formatAddress(lock.owner, 6)} />
          <SummaryRow label="Release date" value={formatDateTime(lock.releaseTime)} />
          <SummaryRow label="Current status" value={status === "matured" ? "Ready to withdraw" : status} />
          <SummaryRow label="Network" value="BSC Testnet" />
          <SummaryRow label="Destination wallet" value={formatAddress(address, 6)} />
        </dl>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => setIsConfirmOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button disabled={!canWithdraw || isPending || isConfirming} isLoading={isPending} onClick={withdraw}>
            Confirm withdrawal
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-3 break-words text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
