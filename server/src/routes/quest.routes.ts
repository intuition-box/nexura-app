import { Router } from "express";
import {
	claimEcosystemQuest,
	performCampaignQuest,
	setTimer,
	submitQuest,
	claimQuest
} from "@/controllers/quest.controller";
import { authenticateUser } from "@/middlewares/auth.middleware";

const router = Router();

router
	.post("/claim-ecosystem-quest", authenticateUser, claimEcosystemQuest)
	.post("/eco-timer", authenticateUser, setTimer)
	.post("/claim-quest", authenticateUser, claimQuest)
	.post("/perform-campaign-quest", authenticateUser, performCampaignQuest)
	.post("/submit-quest", authenticateUser, submitQuest);

export default router;
