import type { Address } from "viem";

export type LockStatus = "active" | "matured" | "withdrawn";

export type VaultLock = {
  id: bigint;
  owner: Address;
  amount: bigint;
  depositedAt: bigint;
  releaseTime: bigint;
  withdrawn: boolean;
  remainingSeconds: bigint;
  isWithdrawable: boolean;
};

export type VaultStatsSnapshot = {
  contractBalance: bigint;
  totalLocked: bigint;
  nextLockId: bigint;
  minLockDuration: bigint;
  maxLockDuration: bigint;
};
