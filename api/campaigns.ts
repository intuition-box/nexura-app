import { Router } from "express";

const router = Router();

// Example campaigns (moved outside the route so both endpoints can access it)
const now = new Date();
const campaigns = [
  {
    id: "1",
    name: "Campaign Alpha",
    description: "First campaign live now.",
    project_name: "Project Alpha",
    project_image: "/campaign.png",
    starts_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // yesterday
    ends_at: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),   // tomorrow
    metadata: JSON.stringify({ participants: 250, category: "NFT" }),
    rewards: {
      amount: 3000,
      currency: "tTrust",
    },
  },
  {
    id: "2",
    name: "Campaign Beta",
    description: "Second campaign coming soon.",
    project_name: "Project Beta",
    project_image: "/campaign1.png",
    starts_at: "TBD",
    ends_at: "TBD",
    metadata: JSON.stringify({ participants: 50, category: "DeFi" }),
    rewards: {
      amount: 3000,
      currency: "tTrust",
    },
  },
  {
    id: "3",
    name: "Campaign Gamma",
    description: "Upcoming campaign for testing.",
    project_name: "Project Gamma",
    project_image: "",
    starts_at: "TBD",
    ends_at: "TBD",
    metadata: JSON.stringify({ participants: 75, category: "AI" }),
    rewards: {
      amount: 3000,
      currency: "tTrust",
    },
  },
];

// GET all campaigns
router.get("/", (_req, res) => {
  res.json(campaigns);
});

// GET single campaign by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const campaign = campaigns.find(c => c.id === id);

  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  res.json(campaign);
});

export default router;
