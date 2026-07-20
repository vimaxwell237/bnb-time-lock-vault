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
