import { Router } from "express";
import { getLeaderboard } from "@/controllers/app.controller";
import { fetchCampaigns } from "@/controllers/campaign.controller";
import adminRoutes from "./admin.routes.ts";
import campaignRoutes from "./campaign.routes.ts";
import hubRoutes from "./hub.routes.ts";
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
	.get("/server-time", (_req, res) => {
		res.json({ serverTime: Date.now() });
	})
	.use("/", appRoutes)
	.use("/admin", adminRoutes)
	.get("/ecosystem-quests", authenticateUser2, fetchEcosystemDapps)
	.get("/quests", authenticateUser2, fetchQuests)
	.get("/campaigns", authenticateUser2, fetchCampaigns)
	.use("/campaign", campaignRoutes)
	.get("/leaderboard", authenticateUser2, getLeaderboard)
	.use("/hub", hubRoutes)
	.use("/quest", questRoutes)
	.use("/user", userRoutes);

export default router;
