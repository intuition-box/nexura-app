import { type WalletClient, type Address, type PublicClient, custom, createWalletClient, createPublicClient } from "viem";
import chain from "./chain";

let walletClient: WalletClient | undefined = undefined;
let publicClient: PublicClient | undefined = undefined;

export const getPublicClient = () => {
  if (typeof window === 'undefined') {
    throw new Error("window is undefined");
  };

  const provider = (window as any).ethereum;

  if (!provider) {
    throw new Error("No Ethereum provider found");
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

  const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
  if (!account) {
    throw new Error("No account found");
  }

  if (!walletClient) {
    walletClient = createWalletClient({
      chain,
      account,
      transport: custom(window.ethereum!)
    });

    return walletClient;
  }

  return walletClient;
}
