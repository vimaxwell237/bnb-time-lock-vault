"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { createPublicClient, http, parseAbiItem } from "viem";
import { bscTestnet, bscTestnetRpcUrl } from "@/config/wagmi";
import { vaultContractAddress, vaultDeploymentBlock } from "@/contracts/vaultConfig";
import type { VaultActivityItem } from "@/types/activity";

// The configured public BSC Testnet RPC caps eth_getLogs ranges below 500 blocks.
const BLOCK_CHUNK_SIZE = 100n;

const depositEvent = parseAbiItem(
  "event BNBDeposited(address indexed user, uint256 indexed lockId, uint256 amount, uint256 depositedAt, uint256 releaseTime)",
);

const withdrawalEvent = parseAbiItem(
  "event BNBWithdrawn(address indexed user, uint256 indexed lockId, uint256 amount)",
);

// Activity history must use the direct BSC RPC, independent of the connected wallet transport.
const activityClient = createPublicClient({
  chain: bscTestnet,
  transport: http(bscTestnetRpcUrl),
});

type UseVaultActivityOptions = {
  address?: Address;
  enabled?: boolean;
};

export function useVaultActivity({ address, enabled = true }: UseVaultActivityOptions) {
  return useQuery({
    enabled: Boolean(
      enabled &&
        vaultContractAddress &&
        vaultDeploymentBlock !== undefined &&
        address,
    ),
    queryKey: ["vault-activity", bscTestnet.id, vaultContractAddress, address],
    queryFn: async (): Promise<VaultActivityItem[]> => {
      if (!vaultContractAddress || !address || vaultDeploymentBlock === undefined) {
        return [];
      }

      const client = activityClient;
      const contractAddress = vaultContractAddress;
      const deploymentBlock = vaultDeploymentBlock;
      const latestBlock = await client.getBlockNumber();
      const fromBlock = deploymentBlock > latestBlock ? latestBlock : deploymentBlock;
      const items = new Map<string, VaultActivityItem>();
      const blockTimestamps = new Map<bigint, bigint>();

      async function getTimestamp(blockNumber: bigint) {
        const cached = blockTimestamps.get(blockNumber);
        if (cached !== undefined) {
          return cached;
        }

        const block = await client.getBlock({ blockNumber });
        blockTimestamps.set(blockNumber, block.timestamp);
        return block.timestamp;
      }

      for (let start = fromBlock; start <= latestBlock; start += BLOCK_CHUNK_SIZE + 1n) {
        const end = start + BLOCK_CHUNK_SIZE > latestBlock ? latestBlock : start + BLOCK_CHUNK_SIZE;

        const [depositLogs, withdrawalLogs] = await Promise.all([
          client.getLogs({
            address: contractAddress,
            args: { user: address },
            event: depositEvent,
            fromBlock: start,
            toBlock: end,
          }),
          client.getLogs({
            address: contractAddress,
            args: { user: address },
            event: withdrawalEvent,
            fromBlock: start,
            toBlock: end,
          }),
        ]);

        for (const log of depositLogs) {
          if (
            log.args.amount === undefined ||
            log.args.lockId === undefined ||
            log.args.user === undefined ||
            log.blockNumber === null
          ) {
            continue;
          }

          const timestamp =
            log.args.depositedAt ?? (await getTimestamp(log.blockNumber));

          items.set(`${log.transactionHash}-${log.logIndex}`, {
            amount: log.args.amount,
            blockNumber: log.blockNumber,
            lockId: log.args.lockId,
            logIndex: log.logIndex,
            status: "confirmed",
            timestamp,
            transactionHash: log.transactionHash,
            type: "deposit",
            user: log.args.user,
          });
        }

        for (const log of withdrawalLogs) {
          if (
            log.args.amount === undefined ||
            log.args.lockId === undefined ||
            log.args.user === undefined ||
            log.blockNumber === null
          ) {
            continue;
          }

          items.set(`${log.transactionHash}-${log.logIndex}`, {
            amount: log.args.amount,
            blockNumber: log.blockNumber,
            lockId: log.args.lockId,
            logIndex: log.logIndex,
            status: "confirmed",
            timestamp: await getTimestamp(log.blockNumber),
            transactionHash: log.transactionHash,
            type: "withdrawal",
            user: log.args.user,
          });
        }
      }

      return [...items.values()].sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return b.logIndex - a.logIndex;
        }

        return a.blockNumber > b.blockNumber ? -1 : 1;
      });
    },
    refetchInterval: 25_000,
    staleTime: 20_000,
  });
}
