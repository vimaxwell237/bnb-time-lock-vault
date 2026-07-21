import { isAddress, type Address } from "viem";

export type VaultConfigState = "ready" | "missing" | "invalid";

export const rawVaultContractAddress =
  process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS?.trim() ?? "";

export const vaultContractAddress: Address | undefined =
  rawVaultContractAddress && isAddress(rawVaultContractAddress)
    ? (rawVaultContractAddress as Address)
    : undefined;

export const vaultConfigState: VaultConfigState = !rawVaultContractAddress
  ? "missing"
  : vaultContractAddress
    ? "ready"
    : "invalid";

export const vaultConfigMessage =
  vaultConfigState === "missing"
    ? "Add NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS to .env.local."
    : vaultConfigState === "invalid"
      ? "NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS is not a valid contract address."
      : "Contract configured.";

export const rawVaultDeploymentBlock =
  process.env.NEXT_PUBLIC_VAULT_DEPLOYMENT_BLOCK?.trim() ?? "";

function parseDeploymentBlock(value: string) {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }

  try {
    const parsed = BigInt(value);
    return parsed >= 0n ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export const vaultDeploymentBlock = parseDeploymentBlock(rawVaultDeploymentBlock);

export const vaultDeploymentBlockMessage = !rawVaultDeploymentBlock
  ? "Add NEXT_PUBLIC_VAULT_DEPLOYMENT_BLOCK to enable wallet transaction history."
  : vaultDeploymentBlock === undefined
    ? "NEXT_PUBLIC_VAULT_DEPLOYMENT_BLOCK must be a non-negative whole number."
    : "Deployment block configured.";
