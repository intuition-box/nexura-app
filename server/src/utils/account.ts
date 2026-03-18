import { createWalletClient, parseAbi, http, type WalletClient, type PublicClient, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { PRIVATE_KEY, network } from "./env.utils";
import { NexonsAddress } from "./constants";
import chain from "./chain.utils";

let walletClient: WalletClient | undefined = undefined;
let publicClient: PublicClient | undefined = undefined;

const account = privateKeyToAccount(PRIVATE_KEY);

const getWalletClient = () => {
	if (!walletClient) {
		walletClient = createWalletClient({
			account,
			chain,
			transport: http(),
		});
	}

	return walletClient;
};

export const getPublicClient = () => {
	if (!publicClient) {
		publicClient = createPublicClient({
			chain,
			transport: http(),
		});
	}

	return publicClient;
};

export const performIntuitionOnchainAction = async ({
	action,
	contractAddress,
	userId,
	level
}: {
	action: string;
  userId: string;
	level?: string;
	contractAddress?: string;
}) => {
	const walletClient = getWalletClient();

	switch (action) {
		case "join":
			await walletClient.writeContract({
				address: contractAddress as GlobalAddress,
				abi: parseAbi(["function joinCampaign(string memory userId)"]),
				functionName: "joinCampaign",
				args: [userId],
				account,
				chain
			});
			return;
    case "allow-claim":
      await walletClient.writeContract({
				address: contractAddress as GlobalAddress,
				abi: parseAbi([
					"function AllowCampaignRewardClaim(string memory userId)",
				]),
				functionName: "AllowCampaignRewardClaim",
				args: [userId],
				account,
				chain
			});
			return;
		case "allow-mint":
			await walletClient.writeContract({
				address: NexonsAddress[level!]!,
				abi: parseAbi(["function allowUserToMint(string memory userId)"]),
				functionName: "allowUserToMint",
				args: [userId],
				account,
				chain
			});
			return;
		case "allow-ref-reward":
			await walletClient.writeContract({
				address: network === "mainnet" ? "0xa13442fA08Cf107580098d3D1eD858450eeeEeEa" : "0x55F8DbC90946976A234103ed7B7E6e3CeC1A9Af3",
				abi: parseAbi([
					"function AllowReferralRewardClaim(string memory userId)",
				]),
				functionName: "AllowReferralRewardClaim",
				args: [userId],
				account,
				chain
			});
			return;
	}
};
