import { Router } from "express";
import {
	claimEcosystemQuest,
	performCampaignQuest,
	setTimer,
	submitQuest,
	claimQuest,
	claimMiniQuest,
	createMiniQuest,
	fetchMiniQuests,
} from "@/controllers/quest.controller";
import {
	authenticateUser,
	authenticateUser2,
} from "@/middlewares/auth.middleware";

const router = Router();

router
	.post("/claim-ecosystem-quest", authenticateUser, claimEcosystemQuest)
	.post("/set-timer", authenticateUser, setTimer)
	// .post("/create-quest", authenticateUser, createQuest)
	.post("/create-mini-quest", authenticateUser, createMiniQuest)
	.get("/fetch-mini-quests", authenticateUser2, fetchMiniQuests)
	.post("/claim-mini-quest", authenticateUser, claimMiniQuest)
	.post("/claim-quest", authenticateUser, claimQuest)
	.post("/perform-campaign-quest", authenticateUser, performCampaignQuest)
	.post("/submit-quest", authenticateUser, submitQuest);

export default router;
