import { authenticateUser } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { checkXTask, checkDiscordTask, home } from "@/controllers/app.controller";
import { discordCallback, xCallback } from "@/controllers/auth.controller";

const router = Router();

router
  .get("/", home)
  .post("/check-x", authenticateUser, checkXTask)
  .post("/check-discord", authenticateUser, checkDiscordTask)
  .get("/auth/discord/callback", authenticateUser, discordCallback)
  .get("/auth/x/callback", authenticateUser, xCallback);

export default router;