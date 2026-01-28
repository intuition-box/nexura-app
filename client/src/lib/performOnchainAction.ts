import chain from "./chain";
import { getWalletClient } from "./viem";
import { network, NEXONS, NEXONS_ABI } from "./constants";
import { ethers } from "ethers";
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
    if (!walletClient) throw new Error("No injected wallet found. Install MetaMask or another Ethereum wallet.");

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
    if (!walletClient) throw new Error("No injected wallet found. Install MetaMask or another Ethereum wallet.");

    const mainnet = network === "mainnet";

    await walletClient.switchChain({ id: mainnet ? 1155 : 13579 });

    const account = await walletClient.getAddresses();

    await walletClient.writeContract({
      address: (mainnet ? "0xa13442fA08Cf107580098d3D1eD858450eeeEeEa" : "0x55F8DbC90946976A234103ed7B7E6e3CeC1A9Af3") as Address,
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

export const mintNexon = async (level: number, userId: string) => {
  try {
    const walletClient = getWalletClient();
    if (!walletClient) throw new Error("No injected wallet found. Install MetaMask or another Ethereum wallet.");

    const mainnet = network === "mainnet";

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: mainnet ? "0x483" : "0x350b" }]
    });

    // await walletClient.switchChain({ id: mainnet ? 1155 : 13579 });

    // const account = await walletClient.getAddresses();

    const { address, metadata } = NEXONS[level];

    // // await walletClient.writeContract({
    // //   address,
    // //   abi: parseAbi(["function mint(string memory metadataURI, string memory userId)"]),
    // //   functionName: "mint",
    // //   args: [metadata, userId],
    // //   account: account[0],
    // //   chain
    // // });

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      address,
      NEXONS_ABI,
      signer
    );

    const tx = await contract.mint(
      metadata,
      userId
    );

    await tx.wait();

    return tx.hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Kindly click the Intuition Mainnet button on the navbar, to add the intuition mainnet network and switch")
    }

    if (error.data) {
      const iface = new ethers.Interface(NEXONS_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyMinted, NotAllowedToMint
    }

    console.error(error);
    throw new Error(error.message);
  }
};
