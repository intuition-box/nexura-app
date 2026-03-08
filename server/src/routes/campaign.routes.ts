import { Router } from "express";
import {
	addCampaignAddress,
	claimCampaignRewards,
	closeCampaign,
	createCampaign,
	joinCampaign,
	updateCampaign,
} from "@/controllers/campaign.controller";
import {
	createCampaignQuests,
	createEcosystemQuests,
	fetchCampaignQuests,
} from "@/controllers/quest.controller";
import {
	authenticateHubAdmin,
	authenticateUser,
	authenticateUser2,
	upload,
} from "@/middlewares/auth.middleware";

const router = Router();

router
	.patch("/add-campaign-address", authenticateHubAdmin, addCampaignAddress)
	.post("/complete-campaign", authenticateUser, claimCampaignRewards)
	.patch("/close-campaign", authenticateHubAdmin, closeCampaign)
	.post("/create-campaign", authenticateHubAdmin, upload.single("coverImage"), createCampaign)
	.post("/create-campaign-quests", authenticateHubAdmin, createCampaignQuests)
	.post("/create-ecosystem-quests", authenticateHubAdmin, createEcosystemQuests)
	.post("/join-campaign", authenticateUser, joinCampaign)
	.get("/quests", authenticateUser2, fetchCampaignQuests)
	.patch("/update-campaign", authenticateHubAdmin, updateCampaign);

export default router;
