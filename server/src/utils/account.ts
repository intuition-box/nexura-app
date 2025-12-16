import { createWalletClient, parseAbi, http, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { PRIVATE_KEY } from "./env.utils";
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
	lvl,
}: {
	action: string;
  userId: string;
	lvl?: string;
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
				account: account.address,
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
				account: account.address,
				chain
			});
			return;
    case "allow-mint":
      await walletClient.writeContract({
				address: NexonsAddress[lvl!]!,
				abi: parseAbi(["function allowUserToMint(string memory userId)"]),
				functionName: "allowUserToMint",
				args: [userId],
				account: account.address,
				chain
      });
      return
	}
};
