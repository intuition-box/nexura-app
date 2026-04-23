import { type WalletClient, type PublicClient } from "viem";
import {
  getWalletClient as coreGetWalletClient,
  getPublicClient as coreGetPublicClient,
} from "@wagmi/core";
import { wagmiConfig } from "./wagmiConfig";
import chain from "./chain";

const NO_WALLET_MSG =
  "No wallet provider available. Connect a wallet with RainbowKit first.";

export const getPublicClient = (): PublicClient => {
  const client = coreGetPublicClient(wagmiConfig, { chainId: chain.id });
  if (!client) {
    throw new Error(NO_WALLET_MSG);
  }
  return client as unknown as PublicClient;
};

export const getWalletClient = async (): Promise<WalletClient> => {
  try {
    const client = await coreGetWalletClient(wagmiConfig, { chainId: chain.id });
    if (!client) {
      throw new Error(NO_WALLET_MSG);
    }
    return client as unknown as WalletClient;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      /connector|not connected|no wallet/i.test(msg)
    ) {
      throw new Error(NO_WALLET_MSG);
    }
    throw err;
  }
};
