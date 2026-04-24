import "dotenv/config";
import {
  getMultiVaultAddressFromChainId,
  getAtomDetails,
  createTripleStatement,
  calculateAtomId,
  calculateTripleId,
  getTripleDetails,
  createAtomFromString,
} from "@0xintuition/sdk";
import { MultiVaultAbi } from "@0xintuition/protocol";
import { configureClient, API_URL_DEV } from "@0xintuition/graphql";
import {
  createWalletClient,
  createPublicClient,
  defineChain,
  http,
  parseEther,
  toHex,
  formatEther,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// --- Config ---

const PRIVATE_KEY = "0x7856b65a027106545fcff1c157daf038d01bfe67c542ea3404e4afed15676517" as `0x${string}`;
// Re-stakes (unlike first-stake triple creation) don't require the 0.1 protocol
// minimum on testnet. Keep this small to preserve wallet balance for iteration.
const STAKE_TRUST = parseEther("0.05");

// Stable triple — first run creates it, subsequent runs re-stake on it.
const SUBJECT = "I";
const PREDICATE = "Completed";
const OBJECT = "POA Persistent Retest Lesson on Nexura";

const intuitionTestnet = defineChain({
  id: 13579,
  name: "Intuition Testnet",
  nativeCurrency: { decimals: 18, name: "tTRUST", symbol: "tTRUST" },
  rpcUrls: { default: { http: ["https://testnet.rpc.intuition.systems"] } },
  blockExplorers: { default: { name: "Explorer", url: "https://testnet.explorer.intuition.systems" } },
});

const EXPLORER = intuitionTestnet.blockExplorers!.default.url;

const KNOWN_ATOM_IDS: Record<string, Address> = {
  I: "0x7ab197b346d386cd5926dbfeeb85dade42f113c7ed99ff2046a5123bb5cd016b",
  Completed: "0x2d864f0214db084b5420de2a72acaddae82d56d9e6e9fed7ecbab3d9f6afc1fe",
};

function banner(msg: string) {
  console.log(`\n${"=".repeat(72)}\n${msg}\n${"=".repeat(72)}`);
}

function line(label: string, value: unknown) {
  console.log(`  ${label.padEnd(22)} ${value}`);
}

async function main() {
  banner("POA Re-Stake Test — existing triple deposit via MultiVault");

  configureClient({ apiUrl: API_URL_DEV });

  const account = privateKeyToAccount(PRIVATE_KEY);
  const walletClient = createWalletClient({ account, chain: intuitionTestnet, transport: http() });
  const publicClient = createPublicClient({ chain: intuitionTestnet, transport: http() });
  const multiVaultAddress = getMultiVaultAddressFromChainId(intuitionTestnet.id);

  line("wallet", account.address);
  line("chain", `${intuitionTestnet.name} (${intuitionTestnet.id})`);
  line("multivault", multiVaultAddress);

  const balanceWei = await publicClient.getBalance({ address: account.address });
  line("balance", `${formatEther(balanceWei)} tTRUST`);
  const minNeeded = STAKE_TRUST + parseEther("0.02");
  if (balanceWei < minNeeded) {
    throw new Error(
      `Insufficient balance. Have ${formatEther(balanceWei)}, need ~${formatEther(minNeeded)} for stake + gas.`,
    );
  }

  const resolveAtom = async (label: string): Promise<Address> => {
    const known = KNOWN_ATOM_IDS[label];
    if (known) {
      try {
        if (await getAtomDetails(known)) return known;
      } catch {
        /* fall through */
      }
    }
    const atomId = calculateAtomId(toHex(label));
    const exists = await getAtomDetails(atomId);
    if (exists) return atomId;
    console.log(`    creating atom for "${label}"`);
    const { state } = await createAtomFromString(
      { walletClient, publicClient, address: multiVaultAddress },
      label,
    );
    return state.termId;
  };

  banner("Resolving atoms");
  const subject = await resolveAtom(SUBJECT);
  line("subject atom", subject);
  const predicate = await resolveAtom(PREDICATE);
  line("predicate atom", predicate);
  const object = await resolveAtom(OBJECT);
  line("object atom", object);

  const tripleId = calculateTripleId(subject, predicate, object);
  line("triple id", tripleId);

  const existing = await getTripleDetails(tripleId);
  line("triple exists", existing ? "yes" : "no");

  if (!existing) {
    banner("Creating triple (first run)");
    const { transactionHash } = await createTripleStatement(
      { walletClient, publicClient, address: multiVaultAddress },
      {
        args: [[subject], [predicate], [object], [STAKE_TRUST]],
        value: STAKE_TRUST,
      },
    );
    line("create tx", transactionHash);
    line("explorer", `${EXPLORER}/tx/${transactionHash}`);
    console.log("\nRe-run this script to exercise the re-stake path.");
    return;
  }

  banner("Re-staking on existing triple via MultiVault.deposit");
  const { request } = await publicClient.simulateContract({
    account,
    address: multiVaultAddress,
    abi: MultiVaultAbi,
    functionName: "deposit",
    args: [account.address, tripleId, 1n, 0n],
    value: STAKE_TRUST,
  });
  const transactionHash = await walletClient.writeContract({ ...request, account });
  line("restake tx", transactionHash);
  line("explorer", `${EXPLORER}/tx/${transactionHash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
  line("status", receipt.status);
  line("block", receipt.blockNumber);
  line("gas used", receipt.gasUsed);

  const finalBalance = await publicClient.getBalance({ address: account.address });
  line("balance after", `${formatEther(finalBalance)} tTRUST`);
  line("spent", `${formatEther(balanceWei - finalBalance)} tTRUST`);

  if (receipt.status !== "success") {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nFATAL:", err);
  process.exit(1);
});
