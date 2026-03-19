import chain from "./chain";
import { getWalletClient, getPublicClient } from "./viem";
import { network, NEXONS, NEXONS_ABI, REWARD_ABI, REWARD_BYTECODE, AUTHORIZED_ADDRESS } from "./constants";
import { ethers } from "ethers";
import { createPublicClient, http, parseAbi, type Address, parseEther, formatEther } from "viem";
import { getIntuitionNetworkParams } from "./utils";
import { buildUrl } from "./queryClient";
import { toUserFriendlyError } from "./errorMessages";

const STUDIO_FEE_ABI = [
  "function payFee() external payable",
  "error SendTheRequiredFeeAmount(uint fee)",
];

type StudioPaymentConfig = {
  network?: string;
  contractAddress?: string;
  chainId: string;
  amount: string;
};

const mainnet = network === "mainnet";

const chainId = mainnet ? "0x483" : "0x350b";
let readonlyPublicClient: ReturnType<typeof createPublicClient> | undefined;

const requireContractAddress = (address: string | undefined, label: string, networkLabel: string = network ?? "the current") => {
  const normalized = address?.trim();

  if (!normalized) {
    throw new Error(`${label} is not configured for ${networkLabel} network.`);
  }

  if (!ethers.isAddress(normalized)) {
    throw new Error(`${label} is invalid: ${normalized}`);
  }

  return normalized;
};

const getReadonlyPublicClient = () => {
  if (!readonlyPublicClient) {
    readonlyPublicClient = createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  }

  return readonlyPublicClient;
};

const normalizeUnixTimestamp = (value: number, fieldName: string): number => {
  const normalized = Math.floor(Number(value));

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(`${fieldName} is invalid.`);
  }

  return normalized;
};

const getStudioPaymentConfig = async (): Promise<StudioPaymentConfig> => {
  const response = await fetch(buildUrl("/api/studio-payment-config"));

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(json?.error || "Unable to load studio payment configuration.");
  }

  return response.json();
};

const ensureSwitch = async (targetChainId: string) => {
  // Fast path: switch if chain is already in wallet
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }]
    });
    return;
  } catch (err: any) {
    if (err.code === 4001) throw err; // user rejected — bubble up
    // Any other error → try adding the chain
  }

  // Add (+ auto-switch) for wallets that don't know the chain yet
  const params = getIntuitionNetworkParams(false, targetChainId);
  await (window as any).ethereum.request({ method: "wallet_addEthereumChain", params });
};

export const payStudioHubFee = async (): Promise<string> => {
  try {
    if (!window.ethereum) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");
    const config = await getStudioPaymentConfig();
    const studioFeeContract = requireContractAddress(config.contractAddress, "Studio fee contract", config.network ?? "the server");

    await ensureSwitch(config.chainId);

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      studioFeeContract,
      STUDIO_FEE_ABI,
      signer
    );

    const tx = await contract.payFee({ value: parseEther(config.amount) });

    await tx.wait();

    return tx.hash as string;
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(STUDIO_FEE_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Payment failed.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Payment failed.");
  }
};

interface IrewardContract {
  nameOfCampaign: string;
  totalRewards: number | string;
  rewardToken: number | string;
  startDate: number;
}

const toWeiAmount = (amount: number | string, fieldName: string): bigint => {
  const normalized = typeof amount === "number" ? amount.toString() : amount.trim();

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(`${fieldName} must be greater than zero.`);
  }

  return parseEther(normalized);
};

export const createRewardsContract = async ({ nameOfCampaign, totalRewards, rewardToken, startDate }: IrewardContract) => {
  try {
    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const totalRewardsWei = toWeiAmount(totalRewards, "Total rewards");
    const rewardTokenWei = toWeiAmount(rewardToken, "Reward per participant");

    const [account] = await walletClient.getAddresses();
    const walletBalance = await publicClient.getBalance({ address: account as Address });

    if (walletBalance < totalRewardsWei) {
      throw new Error(
        `Insufficient TRUST balance. Required: ${formatEther(totalRewardsWei)} TRUST, available: ${formatEther(walletBalance)} TRUST.`
      );
    }

    const hash = await walletClient.deployContract({
      abi: REWARD_ABI,
      bytecode: REWARD_BYTECODE,
      args: [nameOfCampaign, totalRewardsWei, rewardTokenWei, AUTHORIZED_ADDRESS, startDate],
      account,
      chain,
      value: totalRewardsWei
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (!receipt.contractAddress) {
      throw new Error("Unable to determine deployed contract address.");
    }
    const tx = await publicClient.getTransaction({ hash });
    if (tx.value !== totalRewardsWei) {
      throw new Error("Contract deployment did not fund the exact reward pool amount.");
    }

    const onchainTotalReward = await publicClient.readContract({
      address: receipt.contractAddress,
      abi: REWARD_ABI,
      functionName: "totalReward",
    }) as bigint;
    const onchainRewardToken = await publicClient.readContract({
      address: receipt.contractAddress,
      abi: REWARD_ABI,
      functionName: "rewardToken",
    }) as bigint;
    if (onchainTotalReward !== totalRewardsWei || onchainRewardToken !== rewardTokenWei) {
      throw new Error("Deployed rewards contract configuration does not match the requested reward pool.");
    }
    const maxClaimableParticipants = onchainRewardToken > 0n
      ? (onchainTotalReward / onchainRewardToken).toString()
      : "0";

    return {
      txHash: receipt.transactionHash,
      contractAddress: receipt.contractAddress,
      fundedAmount: formatEther(tx.value),
      rewardPerParticipant: formatEther(rewardTokenWei),
      maxClaimableParticipants,
    };
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Failed to deploy rewards contract.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Failed to deploy rewards contract.");
  }
}

export const addReward = async (contractAddress: string, rewardsToAdd: number | string): Promise<string> => {
  try {
    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const [account] = await walletClient.getAddresses();

    const rewardsToAddWei = toWeiAmount(rewardsToAdd, "Reward to add");

    const { request } = await publicClient.simulateContract({
      abi: REWARD_ABI,
      address: contractAddress as "0x",
      functionName: "addReward",
      args: [rewardsToAddWei],
      chain,
      account,
      value: rewardsToAddWei
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  } catch (error: any) {
    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Failed to add reward.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Failed to add reward.");
  }
}

export const getRewardContractBalance = async (contractAddress: string): Promise<bigint> => {
  const validatedCampaignAddress = requireContractAddress(contractAddress, "Campaign contract");
  const publicClient = getReadonlyPublicClient();

  return publicClient.getBalance({ address: validatedCampaignAddress as Address });
};

export const getRewardContractStartDate = async (contractAddress: string): Promise<number> => {
  const validatedCampaignAddress = requireContractAddress(contractAddress, "Campaign contract");
  const publicClient = getReadonlyPublicClient();

  const startDate = await publicClient.readContract({
    abi: REWARD_ABI,
    address: validatedCampaignAddress as Address,
    functionName: "startDate",
  }) as bigint;

  return Number(startDate);
};

export const getRewardCampaignCreator = async (contractAddress: string): Promise<string> => {
  const validatedCampaignAddress = requireContractAddress(contractAddress, "Campaign contract");
  const publicClient = getReadonlyPublicClient();

  const creator = await publicClient.readContract({
    abi: REWARD_ABI,
    address: validatedCampaignAddress as Address,
    functionName: "campaignCreator",
  }) as Address;

  return String(creator);
};

export const updateRewardStartTime = async (contractAddress: string, newDate: number): Promise<string> => {
  try {
    const walletClient = await getWalletClient();
    const publicClient = getPublicClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const [account] = await walletClient.getAddresses();
    const validatedCampaignAddress = requireContractAddress(contractAddress, "Campaign contract");
    const normalizedDate = normalizeUnixTimestamp(newDate, "Campaign start date");

    const { request } = await publicClient.simulateContract({
      abi: REWARD_ABI,
      address: validatedCampaignAddress as Address,
      functionName: "updateDate",
      args: [normalizedDate],
      chain,
      account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Please switch to the required network and try again.");
    }

    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Failed to update reward start time.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Failed to update reward start time.");
  }
}

export const syncRewardContractStartDate = async (contractAddress: string, newDate: number) => {
  const normalizedDate = normalizeUnixTimestamp(newDate, "Campaign start date");
  const currentStartDate = await getRewardContractStartDate(contractAddress);

  if (normalizedDate <= currentStartDate) {
    return {
      updated: false,
      currentStartDate,
      nextStartDate: normalizedDate,
      txHash: null,
    };
  }

  const txHash = await updateRewardStartTime(contractAddress, normalizedDate);

  return {
    updated: true,
    currentStartDate,
    nextStartDate: normalizedDate,
    txHash,
  };
};

export const closeRewardCampaign = async (contractAddress: string): Promise<string> => {
  try {
    const walletClient = await getWalletClient();
    const publicClient = getReadonlyPublicClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

    await ensureSwitch(chainId);

    const [account] = await walletClient.getAddresses();
    const validatedCampaignAddress = requireContractAddress(contractAddress, "Campaign contract");

    const { request } = await publicClient.simulateContract({
      abi: REWARD_ABI,
      address: validatedCampaignAddress as Address,
      functionName: "closeCampaign",
      chain,
      account,
    });

    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Please switch to the required network and try again.");
    }

    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Failed to withdraw remaining rewards.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Failed to withdraw remaining rewards.");
  }
};

export const claimCampaignOnchainReward = async ({ campaignAddress, userId }: { campaignAddress: string, userId: string }) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");
    const validatedCampaignAddress = requireContractAddress(campaignAddress, "Campaign contract");

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      validatedCampaignAddress,
      REWARD_ABI,
      signer
    );

    const tx = await contract.claimReward(userId);

    await tx.wait();

    return tx.hash;
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error("Please switch to the required network and try again.")
    }

    if (error.data) {
      const iface = new ethers.Interface(REWARD_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Unable to claim rewards.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Unable to claim rewards.");
  }
}

export const claimReferralReward = async (userId: string) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

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
    throw toUserFriendlyError(error, "Unable to claim referral reward.");
  }
}

export const mintNexon = async (level: number, userId: string) => {
  try {
    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("No wallet provider available. Connect a wallet with RainbowKit first.");

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
      throw new Error("Please switch to the required network and try again.")
    }

    if (error.data) {
      const iface = new ethers.Interface(NEXONS_ABI);
      const decoded = iface.parseError(error.data);

      throw toUserFriendlyError(decoded?.name ?? error, "Unable to mint badge.");
    }

    console.error(error);
    throw toUserFriendlyError(error, "Unable to mint badge.");
  }
};
