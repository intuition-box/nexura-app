import chain from "./chain";
import { getWalletClient } from "./viem";
import { network } from "./constants";
import { parseAbi, type Address } from "viem";

export const createCampaignOnchain = async () => {
  try {

  } catch (error: any) {
  console.error(error);
  throw new Error(error.message);
  }
}

export const claimCampaignOnchainReward = async ({ campaignAddress, userId }: { campaignAddress: string, userId: string }) => {
  try {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error("Please install an injected wallet like MetaMask to perform this action.");

    const mainnet = network === "mainnet";

    await walletClient.switchChain({ id: mainnet ? 1155 : 13579 });

    const account = await walletClient.getAddresses();

    await walletClient.writeContract({
      address: campaignAddress as Address,
      abi: parseAbi(["function claimReward(string memory userId)"]),
      functionName: "claimReward",
      args: [userId],
      account: account[0],
      chain
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
}

export const claimReferralReward = async (userId: string) => {
  try {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error("Please install an injected wallet like MetaMask to perform this action.");

    const mainnet = network === "mainnet";

    await walletClient.switchChain({ id: mainnet ? 1155 : 13579 });

    const account = await walletClient.getAddresses();

    await walletClient.writeContract({
      address: (mainnet ? "0xReferralsMainnetAddr" : "0x1b18236aa21212ae375ab72F4c4226987c7d8D59") as Address,
      abi: parseAbi(["function claimReferralReward(string memory userId)"]),
      functionName: "claimReferralReward",
      args: [userId],
      account: account[0],
      chain
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
}
