import { Router } from "express";
import {
	fetchUser,
	referralInfo,
	updateUsername,
	allowRefRewardClaim,
	claimReferreralReward
} from "@/controllers/app.controller";
import { signIn } from "@/controllers/auth.controller";
import { authenticateUser } from "@/middlewares/auth.middleware";
import { upload } from "@/config/multer";

const router = Router();

router
	.get("/profile", authenticateUser, fetchUser)
	.post("/claim-referral-reward", authenticateUser, claimReferreralReward)
	.post("/allow-ref-claim", authenticateUser, allowRefRewardClaim)
	.get("/referral-info", authenticateUser, referralInfo)
	// .post("/sign-up", signUp)
	.post("/sign-in", signIn)
	.patch("/update", authenticateUser, upload.single("profilePic"), updateUsername);

export default router;
