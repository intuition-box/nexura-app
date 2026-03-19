import { Router } from "express";
import {
  signIn,
  hubAdminSignUp,
  forgotPassword,
  resetPassword,
  logout,
  superAdminSignUp,
  hubDiscordCallback,
  fetchRoles,
  fetchChannels,
  fetchServers
} from "@/controllers/hub.auth.controller";
import { authenticateHubAdmin, authenticateHubAdmin2 } from "@/middlewares/auth.middleware";
import { fetchHubCampaigns, publishCampaign } from "@/controllers/campaign.controller";
import { validateCampaignSubmissions, getCampaignSubmissions, getHub, getHubAdmins } from "@/controllers/hub.controller";
import hubAppRoutes from "./hub.app.routes";

const router = Router();

router
  // --- Any-admin routes (authenticateHubAdmin2) ---
  .get("/get-campaigns", authenticateHubAdmin2, fetchHubCampaigns)
  .get("/campaign-submissions", authenticateHubAdmin2, getCampaignSubmissions)
  .post("/validate-campaign-submissions", authenticateHubAdmin2, validateCampaignSubmissions)
  .get("/me", authenticateHubAdmin2, getHub)
  .get("/hub-admins", authenticateHubAdmin2, getHubAdmins)
  .patch("/publish-campaign", authenticateHubAdmin, publishCampaign)
  // --- Public routes ---
  .post("/sign-in", signIn)
  .post("/logout", authenticateHubAdmin2, logout)
  .post("/reset-password", resetPassword)
  .post("/forgot-password", forgotPassword)
  .post("/sign-up", superAdminSignUp)
  .get("/discord/callback", hubDiscordCallback)
  .get("/get-roles", fetchRoles)
  .get("/get-channels", fetchChannels)
  .get("/get-servers", fetchServers)
  .post("/admin/sign-up", hubAdminSignUp)
  // --- Superadmin-only routes ---
  .use("/", authenticateHubAdmin, hubAppRoutes)

export default router;
