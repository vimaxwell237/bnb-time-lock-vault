import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-emerald-700", className)} />;
}
