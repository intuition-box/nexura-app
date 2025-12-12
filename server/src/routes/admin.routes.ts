import { Router } from "express";
import { createQuest } from "@/controllers/admin.controller";
import { authenticateAdmin } from "@/middlewares/auth.middleware";

const router = Router();

router
  .post("/create-quest", authenticateAdmin, createQuest);

export default router;