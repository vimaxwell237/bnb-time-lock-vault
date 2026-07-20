import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/format";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  helperText?: string;
  label: string;
};

export function Input({ className, helperText, id, label, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor={inputId}>
      <span>{label}</span>
      <input
        className={cn(
          "h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
          className,
        )}
        id={inputId}
        {...props}
      />
      {helperText ? <span className="text-xs font-normal text-slate-500">{helperText}</span> : null}
    </label>
  );
}
