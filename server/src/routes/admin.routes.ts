import { Router } from "express";
import {
  addAdmin,
  adminLogout,
  rewardXp,
  banUser,
  unBanUser,
  getBannedUsers,
  createQuest,
  getAdmins,
  resendAdminInvite,
  deleteAdminInvite,
  getTasks,
  getUserSummary,
  getAdminLeaderboard,
  markTask,
  removeAdmin,
  manageAdmin
} from "@/controllers/admin.controller";
import { publishAdminCampaign } from "@/controllers/adminCampaign.controller";
import { addCampaignAddress, closeCampaign, deleteCampaign, fetchHubCampaigns, recordCampaignRewardsWithdrawal, reopenCampaign } from "@/controllers/campaign.controller";
import { fetchChannels, fetchRoles, fetchServers } from "@/controllers/hub.auth.controller";
import { getCampaign, getHub, saveCampaign, saveCampaignWithQuests } from "@/controllers/hub.controller";
import {
  createLesson,
  deleteLesson,
  deleteMiniLesson,
  deleteQuestion,
  createQuestion,
  createMiniLesson,
  getAllLessons,
  getLessonDetailsForAdmin,
  updateLesson,
  updateMiniLesson,
  updateQuestion,
  reorderLessonContent,
  reorderLessons,
  publishLesson,
  unpublishLesson,
  updateQuestionIntro,
} from "@/controllers/lesson.controller";
import { upload } from "@/config/multer";
import { attachAdminCampaignHub, requireAdminSuperadmin } from "@/middlewares/auth.middleware";

const router = Router();

router
  .post("/create-quest", createQuest)
  .post("/validate-task", markTask)
  .post("/add-admin", addAdmin)
  .post("/resend-invite", resendAdminInvite)
  .post("/logout", adminLogout)
  .post("/remove-admin", removeAdmin)
  .post("/manage-admin", manageAdmin)
  .post("/reward-xp", rewardXp)
  .post("/ban-user", banUser)
  .post("/unban-user", unBanUser)
  .get("/me", attachAdminCampaignHub, getHub)
  .get("/get-campaigns", attachAdminCampaignHub, fetchHubCampaigns)
  .get("/get-campaign", attachAdminCampaignHub, getCampaign)
  .get("/get-roles", fetchRoles)
  .get("/get-channels", fetchChannels)
  .get("/get-servers", fetchServers)
  .patch("/save-campaign", requireAdminSuperadmin, attachAdminCampaignHub, upload.single("coverImage"), saveCampaign)
  .patch("/save-campaign-quests", requireAdminSuperadmin, attachAdminCampaignHub, upload.single("coverImage"), saveCampaignWithQuests)
  .patch("/add-campaign-address", requireAdminSuperadmin, attachAdminCampaignHub, addCampaignAddress)
  .patch("/publish-campaign", requireAdminSuperadmin, attachAdminCampaignHub, publishAdminCampaign)
  .delete("/delete-campaign", requireAdminSuperadmin, attachAdminCampaignHub, deleteCampaign)
  .patch("/close-campaign", requireAdminSuperadmin, attachAdminCampaignHub, closeCampaign)
  .patch("/reopen-campaign", requireAdminSuperadmin, attachAdminCampaignHub, reopenCampaign)
  .patch("/record-campaign-rewards-withdrawal", requireAdminSuperadmin, attachAdminCampaignHub, recordCampaignRewardsWithdrawal)
  .post("/create-lesson", upload.fields([{ name: "coverImage", maxCount: 1 }, { name: "profileImage", maxCount: 1 }]), createLesson)
  .delete("/delete-lesson", deleteLesson)
  .patch("/update-lesson", upload.fields([{ name: "coverImage", maxCount: 1 }, { name: "profileImage", maxCount: 1 }]), updateLesson)
  .post("/create-mini-lesson", createMiniLesson)
  .patch("/update-mini-lesson", updateMiniLesson)
  .delete("/delete-mini-lesson", deleteMiniLesson)
  .post("/create-question", createQuestion)
  .patch("/update-question", updateQuestion)
  .delete("/delete-question", deleteQuestion)
  .patch("/reorder-lesson-content", reorderLessonContent)
  .patch("/reorder-lessons", reorderLessons)
  .patch("/publish-lesson", publishLesson)
  .patch("/unpublish-lesson", unpublishLesson)
  .patch("/update-question-intro", updateQuestionIntro)
  .get("/get-banned-users", getBannedUsers)
  .get("/get-quests", getTasks)
  .get("/get-admins", getAdmins)
  .delete("/delete-invite", deleteAdminInvite)
  .get("/user-summary", getUserSummary)
  .get("/leaderboard", getAdminLeaderboard)
  .get("/get-lesson-details", getLessonDetailsForAdmin)
  .get("/get-lessons", getAllLessons);

export default router;
