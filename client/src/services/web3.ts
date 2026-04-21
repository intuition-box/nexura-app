import { redeem, getMultiVaultAddressFromChainId, getAtomDetails, createTripleStatement, calculateAtomId, calculateTripleId, getTripleDetails, createAtomFromString } from "@0xintuition/sdk";
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

// Known on-chain Intuition atom IDs — reuse these verbatim instead of
// hashing + creating, to guarantee we bind to the existing atoms.
const KNOWN_ATOM_IDS: Record<string, Address> = {
  I: "0x7ab197b346d386cd5926dbfeeb85dade42f113c7ed99ff2046a5123bb5cd016b",
  Completed: "0x2d864f0214db084b5420de2a72acaddae82d56d9e6e9fed7ecbab3d9f6afc1fe",
  Explored: "0xd211ec9dd52be828be3d3256841485ff54370ec9463cdb0473cf8de9971cbefa",
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
    const known = KNOWN_ATOM_IDS[label];
    if (known) return known;
    // createAtomFromString stores atomData as toHex(label); match that here
    // so calculateAtomId produces the same id as what the contract indexes.
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
  const tripleId = calculateTripleId(subject, predicate, object);
  const existingTriple = await getTripleDetails(tripleId);

  if (existingTriple) {
    const account = walletClient.account!.address as Address;
    const { request } = await publicClient.simulateContract({
      address: PROXY_FEE_CONTRACT,
      abi: PROXY_CONTRACT_ABI,
      functionName: "deposit",
      account,
      args: [account, tripleId, 0n, 0n],
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