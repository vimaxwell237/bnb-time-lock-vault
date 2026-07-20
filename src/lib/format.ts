import { formatEther, type Address, type Hash } from "viem";
import { siteConfig } from "@/config/site";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatAddress(address?: Address | string, size = 4) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
}

export function formatTbnb(value?: bigint, maximumFractionDigits = 5) {
  if (value === undefined) {
    return `0 ${siteConfig.currencySymbol}`;
  }

  const asEther = formatEther(value);
  const numericValue = Number(asEther);

  if (!Number.isFinite(numericValue)) {
    return `${asEther} ${siteConfig.currencySymbol}`;
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(numericValue)} ${siteConfig.currencySymbol}`;
}

export function formatDateTime(seconds?: bigint) {
  if (seconds === undefined || seconds === 0n) {
    return "Unavailable";
  }

  const timestamp = Number(seconds) * 1000;

  if (!Number.isFinite(timestamp)) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function formatCountdown(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "Ready";
  }

  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function formatDurationFromMinutes(value?: bigint) {
  if (value === undefined) {
    return "Unavailable";
  }

  const minutes = Number(value);

  if (!Number.isFinite(minutes)) {
    return `${value.toString()} min`;
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function getExplorerTxUrl(hash: Hash | string) {
  return `${siteConfig.explorerUrl}/tx/${hash}`;
}
