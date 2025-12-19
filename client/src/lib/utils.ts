import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export const getIntuitionNetworkParams = (isTestnet: boolean, chainId: string) => {
  return [{
		chainId,
		chainName: `Intuition ${isTestnet ? "Testnet" : "Mainnet"}`,
		nativeCurrency: {
			name: "Trust",
			symbol: "TRUST",
			decimals: 18,
		},
		rpcUrls: [
			isTestnet
				? "https://testnet.rpc.intuition.systems"
				: "https://rpc.intuition.systems",
		],
		blockExplorerUrls: [
			isTestnet
				? "https://testnet.explorer.intuition.systems"
				: "https://explorer.intuition.systems",
		],
	}];
};