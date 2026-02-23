import {
  addCampaignAddress,
  closeCampaign,
  createCampaign,
  deleteCampaign,
  publishCampaign,
  updateCampaign
} from "@/controllers/campaign.controller";
import {
  addHubAdmin,
  deleteCampaignQuest,
  deleteHub,
  getCampaign,
  removeHubAdmin,
  saveCampaign,
  saveCampaignWithQuests,
  updateCamapaignQuest,
  updateHub,
  createHub
} from "@/controllers/hub.controller";
import { Router } from "express";
import { upload } from "@/config/multer";

const router = Router();

router
  .patch("/save-campaign-quests", upload.single("coverImage"), saveCampaignWithQuests)
  .patch("/save-campaign", upload.single("coverImage"), saveCampaign)
  .get("/get-campaign", getCampaign)
  .delete("/delete-hub", deleteHub)
  .delete("/remove-admin", removeHubAdmin)
  .post("/create-hub", upload.single("logo"), createHub)
  .patch("/update-hub", upload.single("logo"), updateHub)
  .post("/add-admin", addHubAdmin)
  .post("/create-campaign", upload.single("coverImage"), createCampaign)
  .delete("/delete-campaign-quest", deleteCampaignQuest)
  .delete("/delete-campaign", deleteCampaign)
  .patch("/update-campaign", upload.single("coverImage"), updateCampaign)
  .patch("/update-campaign-quest", updateCamapaignQuest)
  .patch("/close-campaign", closeCampaign)
  .patch("/add-campaign-address", addCampaignAddress)
  .patch("/publish-campaign", publishCampaign);

export default router;