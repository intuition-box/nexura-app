import { Router } from "express";

const router = Router();

// Example quests
const now = new Date();
const quests = {
  oneTimeQuests: [
    {
      id: "onetime-x-follow",
      title: "Follow on X",
      description: "Follow our X account to stay updated",
      type: "one-time",
      reward: "50 XP",
      url: "https://x.com/NexuraXYZ",
      starts_at: now.toISOString(),
      ends_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString(), // one week later
      metadata: JSON.stringify({ category: "Social" }),
    },
    {
      id: "onetime-discord-join",
      title: "Join our Discord",
      description: "Join our Discord server to chat with the community",
      type: "one-time",
      reward: "50 XP",
      url: "https://discord.gg/caK9kATBya",
      metadata: JSON.stringify({ category: "Community" }),
    },
  ],
  dailyQuests: [
    {
      id: "daily-comment-post",
      title: "Comment on Latest Post",
      description: "Leave a comment on our latest post to engage with the community",
      type: "daily",
      reward: "30 XP",
      url: "https://x.com/NexuraXYZ/latest",
      starts_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // yesterday
      ends_at: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),   // tomorrow
      metadata: JSON.stringify({ category: "Engagement" }),
    },
  ],
  featuredQuests: [
    {
      id: "feat-support-claim",
      title: "Support a Claim on Intuition Portal",
      description: "Support or oppose a featured claim on Intuition Portal",
      type: "featured",
      reward: "100 XP",
      url: "https://portal.intuition.systems/explore/triple/0xdce8ebb5bdb2668732d43cce5eca85d6a5119fd1bc92f36dd85998ab48ce7a63?tab=positions",
      starts_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      ends_at: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),  // in 2 days
      metadata: JSON.stringify({ category: "Portal" }),
    },
  ],
};

// GET all quests
router.get("/", (_req, res) => {
  res.json(quests);
});

// GET single quest by ID (search in all categories)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const allQuests = [
    ...quests.oneTimeQuests,
    ...quests.dailyQuests,
    ...quests.featuredQuests,
  ];
  const quest = allQuests.find(q => q.id === id);

  if (!quest) {
    return res.status(404).json({ message: "Quest not found" });
  }

  res.json(quest);
});

export default router;
