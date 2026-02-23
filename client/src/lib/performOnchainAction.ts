import chain from "./chain";
import { getWalletClient } from "./viem";
import { network, NEXONS, NEXONS_ABI, CAMPAIGN_ABI, STUDIO_FEE_CONTRACT } from "./constants";
import { ethers } from "ethers";
import { parseAbi, type Address, parseEther } from "viem";
import { getIntuitionNetworkParams } from "./utils";

const ERC20_TRANSFER_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

const STUDIO_FEE_ABI = [
  "function payFee() external payable",
  "error AlreadyCreatedSixCampaigns()",
  "error SendTheRequiredFeeAmount(uint fee)",
];

const mainnet = network === "mainnet";

const chainId = mainnet ? "0x483" : "0x350b";

const ensureSwitch = async () => {
  // Fast path: switch if chain is already in wallet
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });
    return;
  } catch (err: any) {
    if (err.code === 4001) throw err; // user rejected — bubble up
    // Any other error → try adding the chain
  }

  // Add (+ auto-switch) for wallets that don't know the chain yet
  const params = getIntuitionNetworkParams(false, chainId);
  await (window as any).ethereum.request({ method: "wallet_addEthereumChain", params });
};

export const payStudioHubFee = async (): Promise<string> => {
  try {
    if (!window.ethereum) throw new Error("No injected wallet found. Install MetaMask or another Ethereum wallet.");

    await ensureSwitch();

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      STUDIO_FEE_CONTRACT,
      STUDIO_FEE_ABI,
      signer
    );

    const tx = await contract.payFee({ value: parseEther(mainnet ? "1000" : "2") });

    await tx.wait();

    return tx.hash as string;
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(STUDIO_FEE_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyCreatedSixCampaigns, SendTheRequiredFeeAmount
    }

    console.error(error);
    throw new Error(error.message ?? "Payment failed.");
  }
};

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

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      campaignAddress,
      CAMPAIGN_ABI,
      signer
    );

    const tx = await contract.claimReward(userId);

    await tx.wait();

    return tx.hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Kindly click the Intuition Mainnet button on the navbar, to add the intuition mainnet network and switch")
    }

    if (error.data) {
      const iface = new ethers.Interface(CAMPAIGN_ABI);
      const decoded = iface.parseError(error.data);

      throw new Error(decoded?.name); // e.g. AlreadyClaimed, CompleteCampaignToClaimRewards
    }

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

    const { address, metadata } = NEXONS[level];

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
