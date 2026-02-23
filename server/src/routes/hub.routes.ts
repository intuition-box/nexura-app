import { Router } from "express";
import { signIn, hubAdminSignUp, forgotPassword, resetPassword, logout, superAdminSignUp } from "@/controllers/hub.auth.controller";
import { authenticateHubAdmin, authenticateHubAdmin2 } from "@/middlewares/auth.middleware";
import { fetchProjectCampaigns } from "@/controllers/campaign.controller";
import { validateCampaignSubmissions, getCampaignSubmissions } from "@/controllers/hub.controller";
import hubAppRoutes from "./hub.app.routes";

const router = Router();

router
  .get("/get-campaigns", authenticateHubAdmin2, fetchProjectCampaigns)
  .get("/campaign-submissions", authenticateHubAdmin2, getCampaignSubmissions)
  .post("/validate-campaign-submissions", authenticateHubAdmin2, validateCampaignSubmissions)
  .post("/sign-in", signIn)
  .post("/logout", authenticateHubAdmin2, logout)
  .post("/reset-password", resetPassword)
  .post("/forgot-password", forgotPassword)
  .post("/sign-up", superAdminSignUp)
  .post("/admin/sign-up", hubAdminSignUp)
  .use("/", authenticateHubAdmin, hubAppRoutes)

export default router;
