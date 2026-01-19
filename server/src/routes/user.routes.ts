import { Router } from "express";
import {
	fetchUser,
	referralInfo,
	updateUser,
	allowRefRewardClaim,
	claimReferreralReward,
	updateBadge
} from "@/controllers/app.controller";
import { signIn } from "@/controllers/auth.controller";
import { authenticateUser } from "@/middlewares/auth.middleware";
import { upload } from "@/config/multer";

const router = Router();

router
	.get("/profile", authenticateUser, fetchUser)
	.post("/claim-referral-reward", authenticateUser, claimReferreralReward)
	.patch("/update-badge", authenticateUser, updateBadge)
	.post("/allow-ref-claim", authenticateUser, allowRefRewardClaim)
	.get("/referral-info", authenticateUser, referralInfo)
	// .post("/sign-up", signUp)
	.post("/sign-in", signIn)
	.patch("/update", authenticateUser, upload.single("profilePic"), updateUser);

export default router;
