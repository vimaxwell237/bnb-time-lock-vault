import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/format";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
