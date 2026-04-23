import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { admin } from "../src/models/admin.model";
import { hub } from "../src/models/hub.model";
import { lesson, miniLesson, question } from "../src/models/lesson.model";
import { campaign } from "../src/models/campaign.model";
import { quest, miniQuest, ecosystemQuest, campaignQuest } from "../src/models/quests.model";

const DB_URI = process.env.DB_URI;
if (!DB_URI) throw new Error("DB_URI missing");

const TEST_TAG = "TEST-PROOF-OF-ACTION";

async function main() {
  await mongoose.connect(DB_URI!);
  console.log("connected:", mongoose.connection.name);

  let testAdmin = await admin.findOne({ email: "seed-admin@nexura.test" });
  if (!testAdmin) {
    testAdmin = await admin.create({
      email: "seed-admin@nexura.test",
      username: "SeedAdmin",
      role: "superadmin",
      password: await bcrypt.hash("seed-only-do-not-use", 10),
      verified: true,
    });
    console.log("created admin:", testAdmin._id);
  }

  let testHub = await hub.findOne({ name: "Test Proof Hub" });
  if (!testHub) {
    testHub = await hub.create({
      name: "Test Proof Hub",
      logo: "https://nexura.intuition.box/logo.png",
      description: TEST_TAG,
      superAdmin: testAdmin._id,
      xpAllocated: 10000,
    });
    console.log("created hub:", testHub._id);
  }

  const existingLesson = await lesson.findOne({ title: "Test Proof Lesson" });
  if (!existingLesson) {
    const newLesson = await lesson.create({
      title: "Test Proof Lesson",
      description: TEST_TAG + " — short single-question lesson for testing Proof of Action.",
      coverImage: "https://picsum.photos/seed/nexura-test-lesson/800/400",
      profileImage: "https://picsum.photos/seed/nexura-test-lesson-avatar/200/200",
      noOfQuestions: 1,
      reward: 50,
      status: "published",
      disclaimer: "",
    });
    await miniLesson.create({
      lesson: newLesson._id,
      text: "Nexura uses semantic triples (subject, predicate, object) on the Intuition Protocol to record proofs of action.",
      order: 0,
      introHeader: "Intro",
      introBody: "Learn how Nexura records your actions on-chain.",
      outroHeader: "Nice",
      outroBody: "You can now claim XP via Proof of Action.",
    });
    await question.create({
      question: "What data structure does Intuition use to record claims?",
      options: ["Key/value pairs", "Semantic triples", "JSON-LD", "RDF-star"],
      solution: "Semantic triples",
      lesson: newLesson._id,
      order: 0,
    });
    console.log("created lesson:", newLesson._id);
  } else {
    console.log("lesson exists:", existingLesson._id);
  }

  const existingCampaign = await campaign.findOne({ title: "Test Proof Campaign" });
  if (!existingCampaign) {
    const now = Date.now();
    const newCampaign = await campaign.create({
      title: "Test Proof Campaign",
      project_image: "https://picsum.photos/seed/nexura-test-campaign/400/400",
      project_name: "Nexura Test",
      description: TEST_TAG + " — campaign for testing Proof of Action flow.",
      starts_at: new Date(now).toISOString(),
      ends_at: new Date(now + 7 * 24 * 3600 * 1000).toISOString(),
      totalXpAvailable: 500,
      totalTrustAvailable: 0,
      maxParticipants: 100,
      sub_title: "Proof of Action test campaign",
      campaignNumber: Math.floor(Math.random() * 900000) + 100000,
      status: "Active",
      reward: { xp: 500, trustTokens: 0, pool: 0 },
      noOfQuests: 2,
      projectCoverImage: "https://picsum.photos/seed/nexura-test-campaign-cover/1200/400",
      hub: testHub._id,
    });
    await campaignQuest.create({
      quest: "Follow @nexura_xyz on X (Twitter)",
      category: "twitter",
      tag: "follow-x",
      link: "https://twitter.com/nexura_xyz",
      campaign: newCampaign._id,
    });
    await campaignQuest.create({
      quest: "Give us one-word feedback on Nexura",
      category: "other",
      tag: "feedback",
      link: "https://nexura.intuition.box",
      campaign: newCampaign._id,
    });
    console.log("created campaign:", newCampaign._id);
  } else {
    console.log("campaign exists:", existingCampaign._id);
  }

  const existingQuest = await quest.findOne({ title: "Test Proof Quest" });
  if (!existingQuest) {
    const newQuest = await quest.create({
      title: "Test Proof Quest",
      sub_title: "Proof of Action test quest",
      description: TEST_TAG + " — 2-step quest with no twitter/discord/onchain tasks.",
      tag: "Test",
      status: "active",
      questNumber: Math.floor(Math.random() * 900000) + 100000,
      reward: 150,
      category: "one-time",
      noOfQuests: 2,
    });
    await miniQuest.create({
      text: "Visit nexura.intuition.box and scroll the homepage",
      tag: "portal",
      link: "https://nexura.intuition.box",
      quest: newQuest._id,
    });
    await miniQuest.create({
      text: "Read the Nexura manifesto",
      tag: "other",
      link: "https://nexura.intuition.box/about",
      quest: newQuest._id,
    });
    console.log("created quest:", newQuest._id);
  } else {
    console.log("quest exists:", existingQuest._id);
  }

  const existingDapp = await ecosystemQuest.findOne({ name: "Test Proof dApp" });
  if (!existingDapp) {
    const newDapp = await ecosystemQuest.create({
      name: "Test Proof dApp",
      description: TEST_TAG + " — sample ecosystem dApp for Proof of Action Explored.",
      logo: "https://picsum.photos/seed/nexura-test-dapp/200/200",
      reward: 100,
      websiteUrl: "https://intuition.systems",
      category: "infrastructure",
    });
    console.log("created dapp:", newDapp._id);
  } else {
    console.log("dapp exists:", existingDapp._id);
  }

  await mongoose.disconnect();
  console.log("done");
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
