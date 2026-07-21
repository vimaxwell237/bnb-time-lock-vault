"use client";

import { Copy, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { bscTestnet } from "@/config/wagmi";
import { vaultContractAddress, vaultConfigMessage } from "@/contracts/vaultConfig";
import { formatAddress, getExplorerContractUrl } from "@/lib/format";

export function ContractInfo() {
  const contractAddress = vaultContractAddress;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Contract information</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">BNB Smart Chain Testnet</h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <FileText className="size-5" />
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <InfoRow label="Network" value="BNB Smart Chain Testnet" />
        <InfoRow label="Chain ID" value={bscTestnet.id.toString()} />
        <InfoRow label="Native currency" value="tBNB" />
        <InfoRow label="Status" value="Testnet only" />
        <InfoRow
          label="Contract"
          value={contractAddress ? formatAddress(contractAddress, 6) : vaultConfigMessage}
        />
      </dl>

      {contractAddress ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => void navigator.clipboard.writeText(contractAddress)}
            size="sm"
            variant="secondary"
          >
            <Copy className="size-3.5" />
            Copy address
          </Button>
          <a
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            href={getExplorerContractUrl(contractAddress)}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-3.5" />
            Open in BscScan
          </a>
        </div>
      ) : null}

      <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        The contract balance is public blockchain information. Viewing the balance does not give anyone control over the locked funds.
      </p>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
