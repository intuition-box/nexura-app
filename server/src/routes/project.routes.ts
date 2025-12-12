import { Router } from "express";
import { projectSignUp } from "@/controllers/auth.controller";
import { upload } from "@/middlewares/auth.middleware";

const router = Router();

router
  .post("/sign-up", upload.single("logo"), projectSignUp)
  // .post("/sign-in");

export default router;