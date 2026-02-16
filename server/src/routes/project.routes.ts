import { Router } from "express";
import { upload } from "@/middlewares/auth.middleware";
import { projectAndAdminSignIn, projectSignUp, projectAdminSignUp } from "@/controllers/project.auth.controller";
import { addProjectAdmin } from "@/controllers/project.controller";

const router = Router();

router
  .post("/sign-up", upload.single("logo"), projectSignUp)
  .post("/sign-in", projectAndAdminSignIn)
  .post("/add-admin", addProjectAdmin)
  .post("/admin/sign-up", projectAdminSignUp)
  .post("/admin/add-admin", addProjectAdmin)

export default router;
