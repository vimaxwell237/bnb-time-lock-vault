import { BaseError } from "viem";

export function getReadableError(error: unknown) {
  if (error instanceof BaseError) {
    return error.shortMessage || error.message;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("user rejected")) {
      return "Transaction rejected in wallet.";
    }

    return error.message;
  }

  return "Something went wrong. Check MetaMask and try again.";
}
