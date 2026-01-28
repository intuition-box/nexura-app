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
import { updateSubmission, validatePortalTask } from "@/controllers/app.controller";
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
	.post("/check-portal-task", authenticateUser, validatePortalTask)
	.get("/fetch-mini-quests", authenticateUser2, fetchMiniQuests)
	.post("/claim-mini-quest", authenticateUser, claimMiniQuest)
	.post("/update-submission", authenticateUser, updateSubmission)
	.post("/claim-quest", authenticateUser, claimQuest)
	.post("/perform-campaign-quest", authenticateUser, performCampaignQuest)
	.post("/submit-quest", authenticateUser, submitQuest);

export default router;
