import { Router } from "express";
import {
	fetchUser,
	referralInfo,
	updateUser,
	claimReferreralReward,
	updateBadge,
	performDailySignIn
} from "@/controllers/app.controller";
import { signIn } from "@/controllers/auth.controller";
import { authenticateUser } from "@/middlewares/auth.middleware";
import { upload } from "@/config/multer";
import { signInLimiter } from "@/middlewares/ratelimiter";

const router = Router();

router
	.get("/profile", authenticateUser, fetchUser)
	.post("/claim-referral-reward", authenticateUser, claimReferreralReward)
	.patch("/update-badge", authenticateUser, updateBadge)
	.get("/referral-info", authenticateUser, referralInfo)
	// .post("/sign-up", signUp)
	.post("/sign-in", signIn)
	.post("/perform-daily-sign-in", authenticateUser, performDailySignIn)
	.patch("/update", authenticateUser, upload.single("profilePic"), updateUser);

export default router;
