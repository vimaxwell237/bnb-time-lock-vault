import { vaultAbi } from "@/contracts/vaultAbi";
import {
  rawVaultContractAddress,
  vaultConfigMessage,
  vaultConfigState,
  vaultContractAddress,
} from "@/contracts/vaultConfig";

export function useVaultContract() {
  return {
    abi: vaultAbi,
    address: vaultContractAddress,
    configMessage: vaultConfigMessage,
    configState: vaultConfigState,
    isConfigured: vaultConfigState === "ready",
    rawAddress: rawVaultContractAddress,
  };
}
