import { Router } from "express";
import {
	fetchUser,
	referralInfo,
	updateUsername,
} from "@/controllers/app.controller";
import { signIn, signUp } from "@/controllers/auth.controller";
import { authenticateUser } from "@/middlewares/auth.middleware";

const router = Router();

router
	.get("/profile", authenticateUser, fetchUser)
	.get("/referrer-info", authenticateUser, referralInfo)
	.post("/sign-up", signUp)
	.post("/sign-in", signIn)
	.patch("/update", authenticateUser, updateUsername);

export default router;
