import { type WalletClient, type PublicClient, custom, createWalletClient, createPublicClient } from "viem";
import chain from "./chain";

let walletClient: WalletClient | undefined = undefined;
let publicClient: PublicClient | undefined = undefined;

export const getPublicClient = () => {
  if (typeof window === 'undefined') return null;

  const provider = (window as any).ethereum;

  if (!provider) {
    console.error("No Ethereum provider found");
    alert("No injected wallet found. Install MetaMask or another Ethereum wallet.");
    return null;
  }

  if (!publicClient) {
    publicClient = createPublicClient({
      chain,
      transport: custom(provider)
    })
  }

  return publicClient;
};

export const getWalletClient = () => {
  if (typeof window === 'undefined') return null;

  const provider = (window as any).ethereum;

  if (!provider) {
    console.error("No Ethereum provider found");
    alert("No injected wallet found. Install MetaMask or another Ethereum wallet.");
    return null;
  }

  if (!walletClient) {
    walletClient = createWalletClient({
      chain,
      transport: custom(provider)
    });

    return walletClient;
  }

  return walletClient;
}
