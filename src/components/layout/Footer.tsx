import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/75">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <p>BSC Testnet - tBNB only</p>
        <a
          className="inline-flex items-center gap-1.5 font-semibold text-slate-800 underline-offset-4 hover:underline"
          href={siteConfig.explorerUrl}
          rel="noreferrer"
          target="_blank"
        >
          BSC Testnet Explorer
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
