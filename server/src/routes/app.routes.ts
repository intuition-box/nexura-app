import { authenticateUser } from "@/middlewares/auth.middleware";
import { Router } from "express";
import {
	checkXTask,
	checkDiscordTask,
	home,
  getAnalytics,
	saveCv,
	updateX,
	updateDiscord,
} from "@/controllers/app.controller";
import { discordCallback, xCallback, disconnectX, disconnectDiscord, } from "@/controllers/auth.controller";

const router = Router();

router
  .get("/", home)
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