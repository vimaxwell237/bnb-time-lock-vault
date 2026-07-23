import { ShieldCheck } from "lucide-react";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="vault-brand-mark flex size-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-950">{siteConfig.name}</p>
            <p className="text-sm text-slate-600">{siteConfig.networkName}</p>
          </div>
        </div>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
