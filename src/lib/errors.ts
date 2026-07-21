import { BaseError } from "viem";

export function getReadableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  if (
    normalized.includes("user rejected") ||
    normalized.includes("user denied") ||
    normalized.includes("rejected the request") ||
    normalized.includes("4001")
  ) {
    return "User rejected the request in the wallet.";
  }

  if (normalized.includes("chain") && normalized.includes("does not match")) {
    return "Wrong network. Switch your wallet to BSC Testnet and try again.";
  }

  if (normalized.includes("insufficient funds") || normalized.includes("exceeds the balance")) {
    return "Insufficient tBNB. Leave enough balance for the deposit and gas.";
  }

  if (normalized.includes("gas") && normalized.includes("insufficient")) {
    return "Insufficient tBNB for gas.";
  }

  if (normalized.includes("network") || normalized.includes("rpc") || normalized.includes("timeout")) {
    return "RPC unavailable. Refresh and try again in a moment.";
  }

  if (normalized.includes("funds still locked") || normalized.includes("not mature")) {
    return "Funds are still locked until the release time.";
  }

  if (normalized.includes("not owner") || normalized.includes("owner")) {
    return "The connected wallet is not the owner of this lock.";
  }

  if (normalized.includes("already withdrawn")) {
    return "This lock has already been withdrawn.";
  }

  if (normalized.includes("revert") || normalized.includes("execution reverted")) {
    return "Contract reverted the transaction.";
  }

  if (error instanceof BaseError) {
    return error.shortMessage || error.message;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("user rejected")) {
      return "Transaction rejected in wallet.";
    }

    return error.message;
  }

  return "Something went wrong. Check your wallet and try again.";
}
