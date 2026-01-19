import { createWalletClient, parseAbi, http, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { PRIVATE_KEY, network } from "./env.utils";
import { NexonsAddress } from "./constants";
import chain from "./chain.utils";

let walletClient: WalletClient | undefined = undefined;

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
		case "claim-ref-reward":
			await walletClient.writeContract({
				address: network === "mainnet" ? "0x" : "0x1b18236aa21212ae375ab72F4c4226987c7d8D59",
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
