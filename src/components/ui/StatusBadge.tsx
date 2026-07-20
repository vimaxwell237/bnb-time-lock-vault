import { CheckCircle2, Clock3, LockOpen } from "lucide-react";
import { cn } from "@/lib/format";
import type { LockStatus } from "@/types/vault";

const statusClasses: Record<LockStatus, string> = {
  active: "border-amber-200 bg-amber-50 text-amber-800",
  matured: "border-emerald-200 bg-emerald-50 text-emerald-800",
  withdrawn: "border-slate-200 bg-slate-100 text-slate-700",
};

const statusLabels: Record<LockStatus, string> = {
  active: "Active",
  matured: "Matured",
  withdrawn: "Withdrawn",
};

const statusIcons = {
  active: Clock3,
  matured: LockOpen,
  withdrawn: CheckCircle2,
};

export function StatusBadge({ className, status }: { className?: string; status: LockStatus }) {
  const Icon = statusIcons[status];

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold",
        statusClasses[status],
        className,
      )}
    >
      <Icon className="size-3.5" />
      {statusLabels[status]}
    </span>
  );
}
