import { type WalletClient, custom, createWalletClient, createPublicClient } from "viem";
import chain from "./chain";

let walletClient: WalletClient | undefined = undefined;

export const publicClient = createPublicClient({
  chain,
  transport: custom((window as any).ethereum)
});

export const getWalletClient = () => {
  if (!walletClient) {
    walletClient = createWalletClient({
      chain,
      transport: custom((window as any).ethereum)
    });

    return walletClient;
  }

  return walletClient;
}
