import "dotenv/config";
import mongoose from "mongoose";
import {
  getMultiVaultAddressFromChainId,
  getAtomDetails,
  createTripleStatement,
  calculateAtomId,
  calculateTripleId,
  getTripleDetails,
  createAtomFromString,
} from "@0xintuition/sdk";
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

import { hub } from "../src/models/hub.model.ts";
import { lesson, miniLesson, question } from "../src/models/lesson.model.ts";
import { campaign } from "../src/models/campaign.model.ts";
import { ecosystemQuest, campaignQuest } from "../src/models/quests.model.ts";
import { admin } from "../src/models/admin.model.ts";
import bcrypt from "bcrypt";

// --- Config ---

const PRIVATE_KEY = "0x7856b65a027106545fcff1c157daf038d01bfe67c542ea3404e4afed15676517" as `0x${string}`;
const STAKE_TRUST = parseEther("0.1");
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");

const DB_URI = process.env.DB_URI;
if (!DB_URI) throw new Error("DB_URI missing from env");

const intuitionTestnet = defineChain({
  id: 13579,
  name: "Intuition Testnet",
  nativeCurrency: { decimals: 18, name: "tTRUST", symbol: "tTRUST" },
  rpcUrls: { default: { http: ["https://testnet.rpc.intuition.systems"] } },
  blockExplorers: { default: { name: "Explorer", url: "https://testnet.explorer.intuition.systems" } },
});

const EXPLORER = intuitionTestnet.blockExplorers!.default.url;

// --- Helpers ---

type StepResult = {
  label: string;
  surface: "lesson" | "campaign" | "dapp";
  surfaceId?: string;
  subject: string;
  predicate: string;
  object: string;
  subjectAtomId?: Address;
  predicateAtomId?: Address;
  objectAtomId?: Address;
  tripleId?: Address;
  existingTriple?: boolean;
  txHash?: string;
  error?: string;
};

function banner(msg: string) {
  console.log(`\n${"=".repeat(72)}\n${msg}\n${"=".repeat(72)}`);
}

function line(label: string, value: unknown) {
  console.log(`  ${label.padEnd(22)} ${value}`);
}

// --- Main ---

async function main() {
  banner("Proof of Action — End-to-End Test");

  configureClient({ apiUrl: API_URL_DEV });

  const account = privateKeyToAccount(PRIVATE_KEY);
  const walletClient = createWalletClient({ account, chain: intuitionTestnet, transport: http() });
  const publicClient = createPublicClient({ chain: intuitionTestnet, transport: http() });
  const multiVaultAddress = getMultiVaultAddressFromChainId(intuitionTestnet.id);

  line("wallet address", account.address);
  line("chain", `${intuitionTestnet.name} (${intuitionTestnet.id})`);
  line("multivault", multiVaultAddress);

  const balanceWei = await publicClient.getBalance({ address: account.address });
  line("balance", `${formatEther(balanceWei)} tTRUST`);
  const minNeeded = (STAKE_TRUST * 35n) / 10n; // 3 × 0.1 stake + ~0.05 gas margin
  if (balanceWei < minNeeded) {
    throw new Error(
      `Insufficient balance. Have ${formatEther(balanceWei)} tTRUST, need at least ${formatEther(minNeeded)} for 3 stakes + gas.`,
    );
  }

  banner("Seeding MongoDB surfaces");
  await mongoose.connect(DB_URI!);
  line("db", mongoose.connection.name);

  let testAdmin = await admin.findOne({ email: "seed-admin@nexura.test" });
  if (!testAdmin) {
    testAdmin = await admin.create({
      email: "seed-admin@nexura.test",
      username: "SeedAdmin",
      role: "superadmin",
      password: await bcrypt.hash("seed-only-do-not-use", 10),
      verified: true,
    });
  }
  let testHub = await hub.findOne({ name: "Test Proof Hub" });
  if (!testHub) {
    testHub = await hub.create({
      name: "Test Proof Hub",
      logo: "https://nexura.intuition.box/logo.png",
      description: "POA test hub",
      superAdmin: testAdmin._id,
      xpAllocated: 10000,
    });
  }

  const lessonTitle = `POA Retest Lesson ${RUN_ID}`;
  const campaignTitle = `POA Retest Campaign ${RUN_ID}`;
  const dappName = `POA Retest dApp ${RUN_ID}`;

  const newLesson = await lesson.create({
    title: lessonTitle,
    description: `POA retest ${RUN_ID} — single-question lesson.`,
    coverImage: "https://picsum.photos/seed/poa-retest-lesson/800/400",
    profileImage: "https://picsum.photos/seed/poa-retest-lesson-avatar/200/200",
    noOfQuestions: 1,
    reward: 50,
    status: "published",
    disclaimer: "",
  });
  await miniLesson.create({
    lesson: newLesson._id,
    text: "POA retest — one mini lesson.",
    order: 0,
    introHeader: "Intro",
    introBody: "Retest intro.",
    outroHeader: "Done",
    outroBody: "Retest outro.",
  });
  await question.create({
    question: "What is this retest for?",
    options: ["POA", "Other"],
    solution: "POA",
    lesson: newLesson._id,
    order: 0,
  });
  line("lesson", `${newLesson._id} (${lessonTitle})`);

  const now = Date.now();
  const newCampaign = await campaign.create({
    title: campaignTitle,
    project_image: "https://picsum.photos/seed/poa-retest-campaign/400/400",
    project_name: "Nexura POA Retest",
    description: `POA retest ${RUN_ID} — campaign for POA retest.`,
    starts_at: new Date(now).toISOString(),
    ends_at: new Date(now + 7 * 24 * 3600 * 1000).toISOString(),
    totalXpAvailable: 500,
    totalTrustAvailable: 0,
    maxParticipants: 100,
    sub_title: "POA retest campaign",
    campaignNumber: Math.floor(Math.random() * 900000) + 100000,
    status: "Active",
    reward: { xp: 500, trustTokens: 0, pool: 0 },
    noOfQuests: 1,
    projectCoverImage: "https://picsum.photos/seed/poa-retest-campaign-cover/1200/400",
    hub: testHub._id,
  });
  await campaignQuest.create({
    quest: "POA retest feedback",
    category: "other",
    tag: "feedback",
    link: "https://nexura.intuition.box",
    campaign: newCampaign._id,
  });
  line("campaign", `${newCampaign._id} (${campaignTitle})`);

  const newDapp = await ecosystemQuest.create({
    name: dappName,
    description: `POA retest ${RUN_ID} — ecosystem dApp for POA Explored.`,
    logo: "https://picsum.photos/seed/poa-retest-dapp/200/200",
    reward: 100,
    websiteUrl: "https://intuition.systems",
    category: "infrastructure",
  });
  line("dapp", `${newDapp._id} (${dappName})`);

  banner("Running on-chain POA stakes");

  const SUBJECT = "I";
  const KNOWN_ATOM_IDS: Record<string, Address> = {
    I: "0x7ab197b346d386cd5926dbfeeb85dade42f113c7ed99ff2046a5123bb5cd016b",
    Completed: "0x2d864f0214db084b5420de2a72acaddae82d56d9e6e9fed7ecbab3d9f6afc1fe",
  };

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

  const steps: StepResult[] = [
    {
      label: "lesson Completed",
      surface: "lesson",
      surfaceId: String(newLesson._id),
      subject: SUBJECT,
      predicate: "Completed",
      object: `${lessonTitle} on Nexura`,
    },
    {
      label: "campaign Completed",
      surface: "campaign",
      surfaceId: String(newCampaign._id),
      subject: SUBJECT,
      predicate: "Completed",
      object: `${campaignTitle} on Nexura`,
    },
    {
      label: "dapp Explored",
      surface: "dapp",
      surfaceId: String(newDapp._id),
      subject: SUBJECT,
      predicate: "Explored",
      object: dappName,
    },
  ];

  for (const step of steps) {
    console.log(`\n>> ${step.label}`);
    line("subject", step.subject);
    line("predicate", step.predicate);
    line("object", step.object);
    try {
      step.subjectAtomId = await resolveAtom(step.subject);
      line("subject atom", step.subjectAtomId);
      step.predicateAtomId = await resolveAtom(step.predicate);
      line("predicate atom", step.predicateAtomId);
      step.objectAtomId = await resolveAtom(step.object);
      line("object atom", step.objectAtomId);

      const tripleId = calculateTripleId(step.subjectAtomId, step.predicateAtomId, step.objectAtomId);
      step.tripleId = tripleId;
      line("triple id", tripleId);

      const existing = await getTripleDetails(tripleId);
      step.existingTriple = !!existing;
      line("triple exists", step.existingTriple ? "yes (would restake)" : "no (will create)");

      if (step.existingTriple) {
        line("skipping", "existing triple requires PROXY_FEE_CONTRACT deposit — not testing that path here");
        continue;
      }

      const { transactionHash } = await createTripleStatement(
        { walletClient, publicClient, address: multiVaultAddress },
        {
          args: [[step.subjectAtomId], [step.predicateAtomId], [step.objectAtomId], [STAKE_TRUST]],
          value: STAKE_TRUST,
        },
      );
      step.txHash = transactionHash;
      line("tx hash", `${transactionHash}`);
      line("explorer", `${EXPLORER}/tx/${transactionHash}`);
    } catch (err) {
      step.error = err instanceof Error ? err.message : String(err);
      console.error(`    ERROR: ${step.error}`);
    }
  }

  banner("Summary");
  for (const s of steps) {
    const status = s.error ? "FAIL" : s.txHash ? "OK   " : s.existingTriple ? "SKIP " : "NONE ";
    console.log(`  [${status}] ${s.label.padEnd(22)} ${s.txHash || s.error || "(no tx)"}`);
  }

  const finalBalance = await publicClient.getBalance({ address: account.address });
  line("balance after", `${formatEther(finalBalance)} tTRUST`);
  line("spent", `${formatEther(balanceWei - finalBalance)} tTRUST`);

  await mongoose.disconnect();

  const failed = steps.filter((s) => s.error);
  if (failed.length) process.exit(1);
}

main().catch(async (err) => {
  console.error("\nFATAL:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* noop */
  }
  process.exit(1);
});
