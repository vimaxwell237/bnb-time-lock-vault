import { parseAbi } from "viem";

export const vaultAbi = parseAbi([
  "event BNBDeposited(address indexed user, uint256 indexed lockId, uint256 amount, uint256 depositedAt, uint256 releaseTime)",
  "event BNBWithdrawn(address indexed user, uint256 indexed lockId, uint256 amount)",
  "function deposit(uint256 durationInMinutes) payable returns (uint256 lockId)",
  "function withdraw(uint256 lockId)",
  "function getLock(uint256 lockId) view returns (address owner, uint256 amount, uint256 depositedAt, uint256 releaseTime, bool withdrawn, uint256 remainingSeconds)",
  "function remainingTime(uint256 lockId) view returns (uint256)",
  "function isWithdrawable(uint256 lockId) view returns (bool)",
  "function getUserLockIds(address user) view returns (uint256[])",
  "function getUserLockCount(address user) view returns (uint256)",
  "function getUserLockIdAt(address user, uint256 index) view returns (uint256)",
  "function contractBalance() view returns (uint256)",
  "function nextLockId() view returns (uint256)",
  "function totalLocked() view returns (uint256)",
  "function MIN_LOCK_DURATION() view returns (uint256)",
  "function MAX_LOCK_DURATION() view returns (uint256)",
]);
