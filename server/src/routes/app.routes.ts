import { authenticateUser, authenticateUser2 } from "@/middlewares/auth.middleware";
import { rateLimiter } from "@/middlewares/ratelimiter";
import { Router } from "express";
import {
	checkXTask,
	checkDiscordTask,
	home,
  getAnalytics,
	saveCv,
	updateX,
  updateDiscord,
	getClaims
} from "@/controllers/app.controller";
import { discordCallback, xCallback, disconnectX, disconnectDiscord, } from "@/controllers/auth.controller";

const router = Router();

router
  .get("/", home)
  .get("/get-claims", rateLimiter, authenticateUser2, getClaims)
  .get("/get-analytics", getAnalytics)
  .post("/check-x", authenticateUser, checkXTask)
  .post("/check-discord", authenticateUser, checkDiscordTask)
  .get("/save-cv", authenticateUser, saveCv)
  .get("/auth/discord/callback", discordCallback)
  .get("/auth/x/callback", xCallback)
  .get("/auth/x/logout", authenticateUser, disconnectX)
  .get("/auth/discord/logout", authenticateUser, disconnectDiscord)
  .get("/discord/update", authenticateUser, updateDiscord)
  .get("/x/update", authenticateUser, updateX);

export default router;