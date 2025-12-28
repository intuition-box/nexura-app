import { Router } from "express";
import { home, getLeaderboard } from "@/controllers/app.controller";
import { fetchCampaigns } from "@/controllers/campaign.controller";
import adminRoutes from "./admin.routes.ts";
import campaignRoutes from "./campaign.routes.ts";
import projectRoutes from "./project.routes.ts";
import questRoutes from "./quest.routes.ts";
import userRoutes from "./user.routes.ts";
import appRoutes from "./app.routes.ts";
import {
	fetchEcosystemDapps,
	fetchQuests,
} from "@/controllers/quest.controller.ts";
import { authenticateUser2 } from "@/middlewares/auth.middleware";

const router = Router();

router
	.use("/", appRoutes)
	.use("/admin", adminRoutes)
	.get("/ecosystem-quests", authenticateUser2, fetchEcosystemDapps)
	.get("/quests", authenticateUser2, fetchQuests)
	.get("/campaigns", authenticateUser2, fetchCampaigns)
	.use("/campaign", campaignRoutes)
	.get("/leaderboard", getLeaderboard)
	.use("/project", projectRoutes)
	.use("/quest", questRoutes)
	.use("/user", userRoutes);

export default router;
