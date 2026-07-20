"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Hash } from "viem";
import { parseEther } from "viem";
import { LockKeyhole } from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TransactionNotice } from "@/components/ui/TransactionNotice";
import { bscTestnet } from "@/config/wagmi";
import { vaultAbi } from "@/contracts/vaultAbi";
import { getReadableError } from "@/lib/errors";
import { validateDepositFields } from "@/lib/validation";
import { useVaultContract } from "@/hooks/useVaultContract";

type DepositFormProps = {
  onTransactionConfirmed?: (hash: Hash) => void;
};

export function DepositForm({ onTransactionConfirmed }: DepositFormProps) {
  const { address, chainId, isConnected } = useAccount();
  const { address: vaultAddress, isConfigured } = useVaultContract();
  const { isPending, writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hash | undefined>();
  const handledHashRef = useRef<Hash | undefined>(undefined);
  const isCorrectNetwork = chainId === bscTestnet.id;

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
    () => validateDepositFields(amount, duration),
    [amount, duration],
  );

  const isDisabled =
    !isConnected ||
    !isConfigured ||
    !isCorrectNetwork ||
    Boolean(validationMessage) ||
    isPending ||
    isConfirming;

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const fieldError = validateDepositFields(amount, duration);

    if (fieldError) {
      setError(fieldError);
      return;
    }

    if (!vaultAddress) {
      setError("Contract configuration required. Add the contract address to .env.local.");
      return;
    }

    if (!address || !isConnected) {
      setError("Connect MetaMask before depositing.");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Switch MetaMask to BSC Testnet before depositing.");
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
        <Input
          inputMode="decimal"
          label="Amount"
          min="0"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.05"
          step="any"
          type="number"
          value={amount}
        />
        <Input
          inputMode="numeric"
          label="Duration in minutes"
          min="1"
          onChange={(event) => setDuration(event.target.value)}
          placeholder="60"
          step="1"
          type="number"
          value={duration}
        />

        <Button className="w-full" disabled={isDisabled} isLoading={isPending || isConfirming} type="submit">
          {isConfirming ? "Confirming deposit" : "Lock tBNB"}
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
              : "Deposit submitted. Waiting for BSC Testnet confirmation."
          }
          title={isConfirmed ? "Deposit confirmed" : "Transaction submitted"}
          tone={isConfirmed ? "success" : "info"}
        />
      ) : null}
    </Card>
  );
}
