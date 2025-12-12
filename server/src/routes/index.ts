import { Router } from "express";
import { home, getLeaderboard } from "@/controllers/app.controller";
import { fetchCampaigns } from "@/controllers/campaign.controller";
import adminRoutes from "./admin.routes.ts";
import campaignRoutes from "./campaign.routes.ts";
import projectRoutes from "./project.routes.ts";
import questRoutes from "./quest.routes.ts";
import userRoutes from "./user.routes.ts";
import {
	fetchEcosystemDapps,
	fetchQuests,
} from "@/controllers/quest.controller.ts";

const router = Router();

router
	.get("/", home)
	.use("/admin", adminRoutes)
	.get("/ecosystem-quests", fetchEcosystemDapps)
	.get("/quests", fetchQuests)
	.get("/campaigns", fetchCampaigns)
	.use("/campaign", campaignRoutes)
	.get("/leaderboard", getLeaderboard)
	.use("/project", projectRoutes)
	.use("/quest", questRoutes)
	.use("/user", userRoutes);

export default router;
