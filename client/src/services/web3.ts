import { redeem, getMultiVaultAddressFromChainId, getAtomDetails, createTripleStatement, calculateAtomId, createAtomFromString } from "@0xintuition/sdk";
import { Address, parseEther} from "viem";
import { getWalletClient, getPublicClient } from "../lib/viem";
import { apiRequestV2 } from "../lib/queryClient";
import chain from "../lib/chain";
import { PROXY_CONTRACT_ABI, PROXY_FEE_CONTRACT } from "../lib/constants";
import { allowToDeposit } from "../lib/utils";

// --- Deposit / Support or Oppose function ---
export const buyShares = async ({ buyAmount, termId, curveId, isApproved }: { buyAmount: string; termId: Address; isApproved: boolean; curveId: bigint }) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();

  await walletClient.switchChain({ id: chain.id });

  const account = walletClient?.account?.address as "0x";

  if (!isApproved) {
    await allowToDeposit(walletClient, account);
    await apiRequestV2("POST", "/api/user/set-approved");
  }

  const { request } = await publicClient.simulateContract({
    address: PROXY_FEE_CONTRACT,
    abi: PROXY_CONTRACT_ABI,
    functionName: "deposit",
    account,
    args: [
      account,
      termId,
      curveId,
      0n,
    ],
    value: parseEther(buyAmount)
  });

  const transactionHash = await walletClient.writeContract(request);

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

export const createProofOfAction = async ({ username, objectString }: { username: string, objectString: string }) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();
  
  await walletClient.switchChain({ id: chain.id });

  const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

  let subject: Address;
  let object: Address;

  const predicate = "0x2d864f0214db084b5420de2a72acaddae82d56d9e6e9fed7ecbab3d9f6afc1fe";

  const subjectAtomId = calculateAtomId(username as Address);
  const subjectExists = await getAtomDetails(subjectAtomId);

  if (!subjectExists) {
    const { state: { termId } } = await createAtomFromString(
      { walletClient, publicClient, address },
      username
    );

    subject = termId;
  } else {
    subject = subjectAtomId;
  }

  const objectAtomId = calculateAtomId(objectString as Address);
  const objectExists = await getAtomDetails(objectAtomId);

  if (!objectExists) {
    const { state: { termId } } = await createAtomFromString(
      { walletClient, publicClient, address },
      objectString
    );

    object = termId;
  } else {
    object = objectAtomId;
  }

  const { transactionHash } = await createTripleStatement(
    { walletClient, publicClient, address },
    {
      args: [
        [subject],
        [predicate],
        [object],
        [parseEther('0.1')],
      ],
      value: parseEther('0.1'),
    }
  );

  return transactionHash;
}