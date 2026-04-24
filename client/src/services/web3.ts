import { redeem, getMultiVaultAddressFromChainId, getAtomDetails, createTripleStatement, calculateAtomId, calculateTripleId, getTripleDetails, createAtomFromString } from "@0xintuition/sdk";
import { MultiVaultAbi } from "@0xintuition/protocol";
import { Address, parseEther, toHex } from "viem";
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

export const createProofOfAction = async ({
  subjectString = "I",
  predicateString = "Completed",
  objectString,
  stakeTrust,
}: {
  subjectString?: string;
  predicateString?: string;
  objectString: string;
  stakeTrust?: string;
}) => {
  const walletClient = await getWalletClient();
  const publicClient = getPublicClient();

  await walletClient.switchChain({ id: chain.id });

  const address = getMultiVaultAddressFromChainId(walletClient.chain?.id!);

  const resolveAtom = async (label: string): Promise<Address> => {
    // createAtomFromString stores atomData as toHex(label); match that here
    // so calculateAtomId produces the same id as what the contract indexes.
    // This is network-agnostic — the network-specific MultiVault is picked up
    // via `address` (from getMultiVaultAddressFromChainId) and the network-
    // specific GraphQL endpoint is configured at app bootstrap.
    const atomId = calculateAtomId(toHex(label));
    const exists = await getAtomDetails(atomId);
    if (exists) return atomId;
    const { state: { termId } } = await createAtomFromString(
      { walletClient, publicClient, address },
      label
    );
    return termId;
  };

  const subject = await resolveAtom(subjectString);
  const predicate = await resolveAtom(predicateString);
  const object = await resolveAtom(objectString);

  const MIN_STAKE = 0.1;
  const requested = stakeTrust !== undefined ? Number(stakeTrust) : MIN_STAKE;
  const effective = Number.isFinite(requested) && requested >= MIN_STAKE ? requested : MIN_STAKE;
  const stakeAmount = parseEther(effective.toString() as `${number}`);

  // If the triple (subject, predicate, object) already exists, stake into it
  // via deposit. Otherwise create the triple with the initial deposit.
  // Check existence on-chain via isTriple (authoritative) and fall back to
  // the GraphQL indexer. The indexer lags, so concurrent users would otherwise
  // both miss an existing triple and each create a new one.
  const tripleId = calculateTripleId(subject, predicate, object);
  let tripleExists = false;
  try {
    tripleExists = await publicClient.readContract({
      address,
      abi: MultiVaultAbi,
      functionName: "isTriple",
      args: [tripleId],
    }) as boolean;
  } catch {
    tripleExists = false;
  }
  if (!tripleExists) {
    const indexed = await getTripleDetails(tripleId);
    tripleExists = Boolean(indexed);
  }

  if (tripleExists) {
    // Stake on an existing triple by calling MultiVault.deposit directly.
    // The SDK's single `deposit` wrapper drops msg.value, and PROXY_FEE_CONTRACT
    // was previously used as a workaround but depends on a frontend env var
    // that is not wired on every deployment. Calling MultiVault with its raw
    // ABI and a plumbed `value` works in all environments. Default curveId is
    // 1 (linear) — matches what createTriples uses at triple creation time.
    const account = walletClient.account!.address as Address;
    const { request } = await publicClient.simulateContract({
      address,
      abi: MultiVaultAbi,
      functionName: "deposit",
      account,
      args: [account, tripleId, 1n, 0n],
      value: stakeAmount,
    });
    const transactionHash = await walletClient.writeContract(request);
    return transactionHash;
  }

  const { transactionHash } = await createTripleStatement(
    { walletClient, publicClient, address },
    {
      args: [
        [subject],
        [predicate],
        [object],
        [stakeAmount],
      ],
      value: stakeAmount,
    }
  );

  return transactionHash;
}