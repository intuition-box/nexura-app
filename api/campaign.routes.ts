import { Router } from "express";

const router = Router();

// ------ CAMPAIGN DATA ------
export const mockCampaigns = [
  {
    tasks: [
      {
        id: "task-1",
        title: "Follow Nexura on X",
        type: "link",
        url: "https://x.com/NexuraXYZ",
        points: 20,
      },
      {
        id: "task-2",
        title: "Join Nexura Discord Server & Verify",
        type: "link",
        url: "https://discord.gg/caK9kATBya",
        points: 25,
      },
      {
        id: "task-3",
        title: "Send a Message in Any Nexura Discord Channel",
        type: "link",
        url: "https://discord.gg/caK9kATBya",
        points: 25,
      },
      {
        id: "task-4",
        title: "Support or Oppose the #IntuitionBilly Claim",
        type: "link",
        url: "https://portal.intuition.systems/explore/triple/0x713f27d70772462e67805c6f76352384e01399681398f757725b9cbc7f495dcf?tab=positions",
        points: 30,
      },
      {
        id: "task-5",
        title: "Support or Oppose the Nexura Claim",
        type: "pending-link",
        url: "#",
        points: 30,
      },
      {
        id: "task-6",
        title: "Like & Comment on Nexura’s Pinned Post",
        type: "pending-link",
        url: "#",
        points: 20,
        project_image: "/campaign.png",
      },
    ],

    starts_at: "2025-12-01T00:00:00Z",
    ends_at: "2026-01-03T23:59:59Z",

  },
];


router.get("/", (_req, res) => {
  res.json({
    oneTimeCampaigns: mockCampaigns.filter(c => c.status === "active"),
    featuredCampaigns: mockCampaigns.filter(c => c.status === "featured"),
  });
});

// ------ GET SINGLE CAMPAIGN ------
router.get("/:id", (req, res) => {
  const campaign = mockCampaigns.find((c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ message: "Campaign not found" });
  res.json(campaign);
});


export default router;
