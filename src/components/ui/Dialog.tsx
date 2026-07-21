"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type DialogProps = {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
  open: boolean;
};

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Dialog({ children, labelledBy, onClose, open }: DialogProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
    focusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const elements = [...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)];

      if (elements.length === 0) {
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousActiveElement?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
        ref={panelRef}
      >
        <Button
          aria-label="Close dialog"
          className="absolute right-3 top-3 h-9 w-9 px-0"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
        {children}
      </div>
    </div>
  );
}
