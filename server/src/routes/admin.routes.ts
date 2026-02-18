import { Router } from "express";
import { addAdmin, adminLogout, adminLogin, banUser, createAdmin, unBanUser, getBannedUsers, createQuest, getAdmins, getTasks, markTask, removeAdmin } from "@/controllers/admin.controller";
import { authenticateAdmin } from "@/middlewares/auth.middleware";

const router = Router();

router
  .post("/create-quest", authenticateAdmin, createQuest)
  .post("/validate-task", authenticateAdmin, markTask)
  .post("/add-admin", authenticateAdmin, addAdmin)
  .post("/register", createAdmin)
  .post("/login", adminLogin)
  .post("/logout", authenticateAdmin, adminLogout)
  .post("/remove-admin", authenticateAdmin, removeAdmin)
  .post("/ban-user", authenticateAdmin, banUser)
  .post("/unban-user", authenticateAdmin, unBanUser)
  .get("/get-banned-users", authenticateAdmin, getBannedUsers)
  .get("/get-quests", authenticateAdmin, getTasks)
  .get("/get-admins", authenticateAdmin, getAdmins);

export default router;