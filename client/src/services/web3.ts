import { multiVaultDeposit, redeem, getMultiVaultAddressFromChainId } from "@0xintuition/sdk";
import { Address, parseEther} from "viem";
import { getWalletClient, getPublicClient } from "../lib/viem";
import chain from "../lib/chain";

// --- Deposit / Support or Oppose function ---
export const buyShares = async (amountTrust: string, termId: Address, curveId: bigint) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();
  
  await walletClient.switchChain({ id: chain.id });

  const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

  const transactionHash = await multiVaultDeposit(
    { walletClient, publicClient, address },
    {
      args: [
        walletClient?.account?.address as "0x",
        termId,
        curveId,
        0n,
      ],
      value: parseEther(amountTrust)
    }
  );

  return transactionHash;
};

// --- Sell / Redeem ---
export const sellShares = async (sharesAmount: string, termId: Address, curveId: bigint) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();
  
  await walletClient.switchChain({ id: chain.id });

  const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

  const { transactionHash } = await redeem(
    { walletClient, publicClient, address },
    [
      walletClient?.account?.address as "0x",
      termId,
      curveId,
      parseEther(sharesAmount),
      0n
    ]
  );

  return transactionHash;
};
