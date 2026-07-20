import { isAddress } from "viem";

export function isValidContractAddress(value?: string) {
  return Boolean(value && isAddress(value));
}

export function validateDepositFields(amount: string, duration: string) {
  const normalizedAmount = amount.trim();
  const normalizedDuration = duration.trim();

  if (!normalizedAmount) {
    return "Enter an amount of tBNB to lock.";
  }

  const numericAmount = Number(normalizedAmount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Enter a valid tBNB amount greater than zero.";
  }

  if (!normalizedDuration) {
    return "Enter a lock duration in minutes.";
  }

  const durationMinutes = Number(normalizedDuration);

  if (
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0 ||
    !Number.isInteger(durationMinutes)
  ) {
    return "Duration must be a whole number of minutes.";
  }

  return null;
}
