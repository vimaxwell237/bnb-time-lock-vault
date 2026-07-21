"use client";

import { ArrowDownToLine, ArrowUpFromLine, ExternalLink } from "lucide-react";
import { formatDateTime, formatHash, formatTbnb, getExplorerTxUrl } from "@/lib/format";
import type { VaultActivityItem } from "@/types/activity";

type ActivityRowProps = {
  activity: VaultActivityItem;
};

export function ActivityRow({ activity }: ActivityRowProps) {
  const isDeposit = activity.type === "deposit";
  const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              isDeposit
                ? "inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-800"
                : "inline-flex h-8 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 text-xs font-bold text-sky-800"
            }
          >
            <Icon className="size-3.5" />
            {isDeposit ? "Deposit" : "Withdrawal"}
          </span>
          <span className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700">
            Confirmed
          </span>
          <span className="font-mono text-sm font-semibold text-slate-900">
            Lock #{activity.lockId.toString()}
          </span>
        </div>
        <div className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-slate-800">Amount:</span>{" "}
            {formatTbnb(activity.amount)}
          </p>
          <p>
            <span className="font-semibold text-slate-800">Time:</span>{" "}
            {formatDateTime(activity.timestamp)}
          </p>
        </div>
      </div>
      <a
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        href={getExplorerTxUrl(activity.transactionHash)}
        rel="noreferrer"
        target="_blank"
      >
        <span className="font-mono">{formatHash(activity.transactionHash)}</span>
        <ExternalLink className="size-4" />
      </a>
    </div>
  );
}
