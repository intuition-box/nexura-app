import {
  addCampaignAddress,
  closeCampaign,
  createCampaign,
  deleteCampaign,
  recordCampaignRewardsWithdrawal,
  reopenCampaign,
  updateCampaign
} from "@/controllers/campaign.controller";
import {
  addHubAdmin,
  deleteCampaignQuest,
  deleteHub,
  disconnectHubDiscord,
  getCampaign,
  removeHubAdmin,
  saveCampaign,
  saveCampaignWithQuests,
  updateCamapaignQuest,
  updateHub,
  updateIds,
  createHub,
  savePaymentHash,
  updateHubAdminRole,
  resendInvite,
  deleteInvite
} from "@/controllers/hub.controller";
import { Router } from "express";
import { upload } from "@/config/multer";

const router = Router();

router
  .patch("/save-campaign-quests", upload.single("coverImage"), saveCampaignWithQuests)
  .patch("/save-campaign", upload.single("coverImage"), saveCampaign)
  .get("/get-campaign", getCampaign)
  .delete("/delete-hub", deleteHub)
  .patch("/update-ids", updateIds)
  .delete("/remove-admin", removeHubAdmin)
  .post("/create-hub", upload.single("logo"), createHub)
  .patch("/update-hub", upload.fields([{ name: "logo", maxCount: 1 }, { name: "document", maxCount: 1 }]), updateHub)
  .patch("/disconnect-discord", disconnectHubDiscord)
  .patch("/save-payment-hash", savePaymentHash)
  .post("/add-admin", addHubAdmin)
  .post("/resend-invite", resendInvite)
  .delete("/delete-invite", deleteInvite)
  .patch("/update-admin-role", updateHubAdminRole)
  .post("/create-campaign", upload.single("coverImage"), createCampaign)
  .delete("/delete-campaign-quest", deleteCampaignQuest)
  .delete("/delete-campaign", deleteCampaign)
  .patch("/update-campaign", upload.single("coverImage"), updateCampaign)
  .patch("/update-campaign-quest", updateCamapaignQuest)
  .patch("/close-campaign", closeCampaign)
  .patch("/reopen-campaign", reopenCampaign)
  .patch("/add-campaign-address", addCampaignAddress)
  .patch("/record-campaign-rewards-withdrawal", recordCampaignRewardsWithdrawal);

export default router;
