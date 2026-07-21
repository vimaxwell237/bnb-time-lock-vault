import { isAddress, parseEther } from "viem";

export function isValidContractAddress(value?: string) {
  return Boolean(value && isAddress(value));
}

export function validateDepositFields(amount: string, duration: string) {
  return validateDepositInput({ amount, duration });
}

export function validateDepositInput({
  amount,
  balance,
  duration,
  gasReserve,
  maxDuration,
  minDuration,
}: {
  amount: string;
  balance?: bigint;
  duration: string;
  gasReserve?: bigint;
  maxDuration?: bigint;
  minDuration?: bigint;
}) {
  const normalizedAmount = amount.trim();
  const normalizedDuration = duration.trim();

  if (!normalizedAmount) {
    return "Enter an amount of tBNB to lock.";
  }

  const numericAmount = Number(normalizedAmount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Enter a valid tBNB amount greater than zero.";
  }

  if (!/^\d+(\.\d+)?$/.test(normalizedAmount)) {
    return "Enter a valid tBNB number.";
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

  const durationBigInt = BigInt(normalizedDuration);

  if (minDuration !== undefined && durationBigInt < minDuration) {
    return `Duration must be at least ${minDuration.toString()} minutes.`;
  }

  if (maxDuration !== undefined && durationBigInt > maxDuration) {
    return `Duration must be no more than ${maxDuration.toString()} minutes.`;
  }

  if (balance !== undefined && gasReserve !== undefined) {
    try {
      const amountWei = parseEther(normalizedAmount);

      if (amountWei + gasReserve > balance) {
        return "Insufficient tBNB. Leave a small amount for gas.";
      }
    } catch {
      return "Enter a valid tBNB number.";
    }
  }

  return null;
}
