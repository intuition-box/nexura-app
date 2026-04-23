import { type WalletClient, type Address, type PublicClient, custom, createWalletClient, createPublicClient } from "viem";
import chain from "./chain";

let walletClient: WalletClient | undefined = undefined;
let publicClient: PublicClient | undefined = undefined;
let walletClientAccount: Address | undefined = undefined;

export const getPublicClient = () => {
  if (typeof window === 'undefined') {
    throw new Error("window is undefined");
  };

  const provider = (window as any).ethereum;

  if (!provider) {
    throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");
  }

  if (!publicClient) {
    publicClient = createPublicClient({
      chain,
      transport: custom(provider)
    });
    
    return publicClient;
  }

  return publicClient;
};

export const getWalletClient = async () => {
  if (typeof window === 'undefined') {
    throw new Error("window is undefined");
  };

  if (!window.ethereum) {
    throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");
  }

  const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
  if (!account) {
    throw new Error("No connected wallet account found. Connect a wallet with RainbowKit first.");
  }

  if (!walletClient || walletClientAccount?.toLowerCase() !== String(account).toLowerCase()) {
    walletClient = createWalletClient({
      chain,
      account,
      transport: custom(window.ethereum!)
    });
    walletClientAccount = account;

    return walletClient;
  }

  return walletClient;
}
