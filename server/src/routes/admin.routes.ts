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
import {
  createLesson,
  createQuestion,
  createMiniLesson,
  getAllLessons,
  getLessonDetailsForAdmin,
  updateLesson,
  updateMiniLesson,
  updateQuestion,
} from "@/controllers/lesson.controller";

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
  .post("/create-lesson", createLesson)
  .patch("/update-lesson", updateLesson)
  .post("/create-mini-lesson", createMiniLesson)
  .patch("/update-mini-lesson", updateMiniLesson)
	.post("/create-question", createQuestion)
  .patch("/update-question", updateQuestion)
  .get("/get-banned-users", getBannedUsers)
  .get("/get-quests", getTasks)
  .get("/get-admins", getAdmins)
  .delete("/delete-invite", deleteAdminInvite)
  .get("/user-summary", getUserSummary)
  .get("/leaderboard", getAdminLeaderboard)
  .get("/get-lesson-details", getLessonDetailsForAdmin)
  .get("/get-lessons", getAllLessons);

export default router;
