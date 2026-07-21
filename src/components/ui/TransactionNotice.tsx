import type { Hash } from "viem";
import { AlertTriangle, CheckCircle2, ExternalLink, Info, XCircle } from "lucide-react";
import { cn, getExplorerTxUrl } from "@/lib/format";

type NoticeTone = "info" | "success" | "warning" | "error";

type TransactionNoticeProps = {
  className?: string;
  hash?: Hash;
  message: string;
  title: string;
  tone?: NoticeTone;
};

const toneClasses: Record<NoticeTone, string> = {
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-slate-200 bg-slate-50 text-slate-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const toneIcons = {
  error: XCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

export function TransactionNotice({
  className,
  hash,
  message,
  title,
  tone = "info",
}: TransactionNoticeProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn("rounded-lg border p-4", toneClasses[tone], className)}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-85">{message}</p>
          {hash ? (
            <a
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href={getExplorerTxUrl(hash)}
              rel="noreferrer"
              target="_blank"
            >
              View on BscScan
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
