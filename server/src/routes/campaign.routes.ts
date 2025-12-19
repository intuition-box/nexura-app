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
	authenticateProject,
	authenticateUser,
	authenticateUser2,
	upload,
} from "@/middlewares/auth.middleware";

const router = Router();

router
	.patch("/add-campaign-address", authenticateProject, addCampaignAddress)
	.post("/complete-campaign", authenticateUser, claimCampaignRewards)
	.patch("/close-campaign", authenticateProject, closeCampaign)
	.post("/create-campaign", authenticateProject, upload.single("coverImage"), createCampaign)
	.post("/create-campaign-quests", authenticateProject, createCampaignQuests)
	.post("/create-ecosystem-quests", authenticateProject, createEcosystemQuests)
	.post("/join-campaign", authenticateUser, joinCampaign)
	.get("/quests", authenticateUser2, fetchCampaignQuests)
	.patch("/update-campaign", authenticateProject, updateCampaign);

export default router;
