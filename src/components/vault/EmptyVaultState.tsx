import { Inbox } from "lucide-react";

export function EmptyVaultState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Inbox className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
