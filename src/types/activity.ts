import type { Address, Hash } from "viem";

export type VaultActivityType = "deposit" | "withdrawal";
export type VaultActivityStatus = "confirmed";

export type VaultActivityItem = {
  amount: bigint;
  blockNumber: bigint;
  lockId: bigint;
  logIndex: number;
  status: VaultActivityStatus;
  timestamp: bigint;
  transactionHash: Hash;
  type: VaultActivityType;
  user: Address;
};
