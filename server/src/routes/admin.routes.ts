import { Router } from "express";
import { addAdmin, adminLogin, createAdmin, createQuest, getAdmins, getTasks, markTask, removeAdmin } from "@/controllers/admin.controller";
import { authenticateAdmin } from "@/middlewares/auth.middleware";

const router = Router();

router
  .post("/create-quest", authenticateAdmin, createQuest)
  .post("/validate-task", authenticateAdmin, markTask)
  .post("/add-admin", authenticateAdmin, addAdmin)
  .post("/register", authenticateAdmin, createAdmin)
  .post("/login", authenticateAdmin, adminLogin)
  .post("/remove-admin", authenticateAdmin, removeAdmin)
  .get("/get-quests", authenticateAdmin, getTasks)
  .get("/get-admins", authenticateAdmin, getAdmins);

export default router;