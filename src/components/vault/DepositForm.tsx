"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Hash } from "viem";
import { formatEther, parseEther } from "viem";
import { CalendarClock, LockKeyhole } from "lucide-react";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { TransactionNotice } from "@/components/ui/TransactionNotice";
import { bscTestnet } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { getReadableError } from "@/lib/errors";
import {
  formatDateTimeFromDate,
  formatDurationFromMinutes,
} from "@/lib/format";
import { validateDepositInput } from "@/lib/validation";
import { useVaultContract } from "@/hooks/useVaultContract";
import { useVaultLimits } from "@/hooks/useVaultLimits";

type DepositFormProps = {
  onTransactionConfirmed?: (hash: Hash) => void;
};

const durationPresets = [
  { label: "1 hour", value: "60" },
  { label: "1 day", value: "1440" },
  { label: "7 days", value: "10080" },
];

const GAS_RESERVE = parseEther("0.001");

export function DepositForm({ onTransactionConfirmed }: DepositFormProps) {
  const { address, chainId, isConnected } = useAccount();
  const { address: vaultAddress, isConfigured } = useVaultContract();
  const { isPending, writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hash | undefined>();
  const handledHashRef = useRef<Hash | undefined>(undefined);
  const isCorrectNetwork = chainId === bscTestnet.id;
  const limitsQuery = useVaultLimits();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId: bscTestnet.id,
    query: {
      enabled: Boolean(address && isCorrectNetwork),
    },
  });

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

  const validationMessage = useMemo(
    () =>
      validateDepositInput({
        amount,
        balance: balance?.value,
        duration,
        gasReserve: GAS_RESERVE,
        maxDuration: limitsQuery.data?.maxLockDuration,
        minDuration: limitsQuery.data?.minLockDuration,
      }),
    [amount, balance?.value, duration, limitsQuery.data],
  );

  const estimatedReleaseDate = useMemo(() => {
    const durationMinutes = Number(duration);

    if (!nowMs || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return undefined;
    }

    return new Date(nowMs + durationMinutes * 60_000);
  }, [duration, nowMs]);

  const durationLabel = useMemo(() => {
    if (!/^\d+$/.test(duration.trim())) {
      return "--";
    }

    return formatDurationFromMinutes(BigInt(duration.trim()));
  }, [duration]);

  const isDisabled =
    !isConnected ||
    !isConfigured ||
    !isCorrectNetwork ||
    limitsQuery.isLoading ||
    Boolean(validationMessage) ||
    isPending ||
    isConfirming;

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNowMs(Date.now()), 0);
    const interval = window.setInterval(() => setNowMs(Date.now()), 30_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (
      isConfirmed &&
      receipt?.transactionHash &&
      receipt.transactionHash !== handledHashRef.current
    ) {
      handledHashRef.current = receipt.transactionHash;
      onTransactionConfirmed?.(receipt.transactionHash);
      void refetchBalance();
    }
  }, [isConfirmed, onTransactionConfirmed, receipt?.transactionHash, refetchBalance]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const fieldError = validateDepositInput({
      amount,
      balance: balance?.value,
      duration,
      gasReserve: GAS_RESERVE,
      maxDuration: limitsQuery.data?.maxLockDuration,
      minDuration: limitsQuery.data?.minLockDuration,
    });

    if (fieldError) {
      setError(fieldError);
      return;
    }

    if (!vaultAddress) {
      setError("Contract configuration required. Add the contract address to .env.local.");
      return;
    }

    if (!address || !isConnected) {
      setError("Connect your wallet before depositing.");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Switch your wallet to BSC Testnet before depositing.");
      return;
    }

    setIsConfirmOpen(true);
  }

  async function confirmDeposit() {
    setError(null);
    setIsConfirmOpen(false);

    if (!vaultAddress) {
      setError("Contract configuration required. Add the contract address to .env.local.");
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "deposit",
        args: [BigInt(duration.trim())],
        chainId: bscTestnet.id,
        value: parseEther(amount.trim()),
      });

      setTransactionHash(hash);
      setAmount("");
      setDuration("");
    } catch (writeError) {
      setError(getReadableError(writeError));
    }
  }

  function applyMaxAmount() {
    const available = balance?.value;

    if (available === undefined || available <= GAS_RESERVE) {
      setAmount("0");
      return;
    }

    setAmount(formatEther(available - GAS_RESERVE));
  }

  function updateDuration(value: string) {
    setDuration(value);
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">New lock</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Deposit tBNB</h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <LockKeyhole className="size-5" />
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <div className="flex items-end gap-2">
            <Input
              className="w-full"
              inputMode="decimal"
              label="Amount"
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.05"
              step="any"
              type="number"
              value={amount}
            />
            <Button
              className="mb-0"
              disabled={!balance?.value}
              onClick={applyMaxAmount}
              variant="secondary"
            >
              Max
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {durationPresets.map((preset) => (
            <Button
              key={preset.value}
              onClick={() => updateDuration(preset.value)}
              size="sm"
              variant={duration === preset.value ? "primary" : "secondary"}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Input
          inputMode="numeric"
          label="Duration in minutes"
          min={limitsQuery.data ? Number(limitsQuery.data.minLockDuration) : 1}
          onChange={(event) => updateDuration(event.target.value)}
          placeholder="60"
          step="1"
          type="number"
          value={duration}
        />

        {limitsQuery.data ? (
          <p className="text-xs leading-5 text-slate-500">
            Contract range: {formatDurationFromMinutes(limitsQuery.data.minLockDuration)} to{" "}
            {formatDurationFromMinutes(limitsQuery.data.maxLockDuration)}.
          </p>
        ) : null}

        {validationMessage && (amount || duration) ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {validationMessage}
          </p>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <CalendarClock className="size-4" />
            Deposit summary
          </p>
          <dl className="mt-3 grid gap-2 text-sm">
            <SummaryRow label="Amount" value={amount ? `${amount} tBNB` : "--"} />
            <SummaryRow
              label="Duration"
              value={durationLabel}
            />
            <SummaryRow
              label="Estimated release"
              value={estimatedReleaseDate ? formatDateTimeFromDate(estimatedReleaseDate) : "--"}
            />
          </dl>
        </div>

        <Button className="w-full" disabled={isDisabled} isLoading={isPending || isConfirming} type="submit">
          {isPending
            ? "Waiting for wallet approval"
            : isConfirming
              ? "Waiting for confirmation"
              : "Review lock"}
        </Button>
      </form>

      {!isConfigured ? (
        <p className="mt-3 text-sm font-medium text-amber-700">
          Contract configuration required before deposits are enabled.
        </p>
      ) : null}

      {error ? (
        <TransactionNotice
          className="mt-4"
          message={error}
          title="Deposit failed"
          tone="error"
        />
      ) : null}

      {transactionHash ? (
        <TransactionNotice
          className="mt-4"
          hash={transactionHash}
          message={
            isConfirmed
              ? "Deposit confirmed. Vault data is refreshing."
              : "Transaction submitted. Waiting for BSC Testnet confirmation."
          }
          title={isConfirmed ? "Deposit confirmed" : "Transaction submitted"}
          tone={isConfirmed ? "success" : "info"}
        />
      ) : null}

      <Dialog
        labelledBy="deposit-confirmation-title"
        onClose={() => setIsConfirmOpen(false)}
        open={isConfirmOpen}
      >
        <div className="pr-10">
          <p className="text-sm font-semibold text-slate-500">Confirm deposit</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950" id="deposit-confirmation-title">
            Lock {amount || "--"} tBNB
          </h3>
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          <SummaryRow label="Amount to lock" value={`${amount || "--"} tBNB`} />
          <SummaryRow
            label="Duration"
            value={durationLabel}
          />
          <SummaryRow
            label="Estimated release"
            value={estimatedReleaseDate ? formatDateTimeFromDate(estimatedReleaseDate) : "--"}
          />
          <SummaryRow label="Network" value="BSC Testnet" />
        </dl>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          This deposit cannot be withdrawn before maturity. Testnet tBNB has no real monetary value.
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => setIsConfirmOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button disabled={isPending || isConfirming} isLoading={isPending} onClick={confirmDeposit}>
            Confirm and lock
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
