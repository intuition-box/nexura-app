import bcrypt from "bcrypt";
import logger from "@/config/logger";
import { quest } from "@/models/quests.model";
import { admin } from "@/models/admin.model";
import crypto from "crypto";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from "@/utils/status.utils";
import { getRefreshToken, JWT, validateQuestData } from "@/utils/utils";
import { sendEmailToAdmin } from "@/utils/sendMail";
import { campaignQuestCompleted, miniQuestCompleted } from "@/models/questsCompleted.models";
import { submission } from "@/models/submission.model";

export const createQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { success } = validateQuestData(req.body);
		if (!success) {
			res
				.status(BAD_REQUEST)
				.json({ error: "send the correct data required to create a quest" });
			return;
		}

		const newQuest = new quest(req.body);
		if (newQuest.category !== "weekly") {
			await newQuest.save();
		} else {
			// new Date(new Date(Date.now() + 86400000).setHours(0, 60, 0, 0)); (quests expire at 12am UTC. For now, it expires 1 day after creation)
			newQuest.expires = new Date(Date.now() + 86400000);
			await newQuest.save();
		}

		res.status(OK).json({ message: "quest quest created!" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating quest" });
	}
};

export const getAdmins = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const admins = await admin.find();

		res.status(OK).json({ message: "admins fetched", admins });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching admins" });
	}
}

export const removeAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { email }: { email: string } = req.body;
		if (!email) {
			res.status(BAD_REQUEST).json({ error: "send admin email" });
			return;
		}

		const adminExists = await admin.findOne({ email });
		if (!adminExists) {
			res.status(NOT_FOUND).json({ error: "admin does not exist" });
			return;
		}

		await admin.findOneAndDelete({ email });

		res.status(OK).json({ message: "admin removed" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error removing admin" });
	}
}

export const addAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { email }: { email: string } = req.body;
		if (!email) {
			res.status(BAD_REQUEST).json({ error: "send admin email" });
			return;
		}

		const emailExists = await admin.findOne({ email });
		if (!emailExists) {
			const newAdmin = new admin(req.body);

			const code = crypto
				.randomInt(0, 1000000000)
				.toString()
				.padStart(6, "0");

			newAdmin.code = code;

			await sendEmailToAdmin(email, code);

			await newAdmin.save();

			res.status(OK).json({ message: "created" });
			return;
		}

		res.status(BAD_REQUEST).json({ error: "admin with email exists" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error adding admin" });
	}
}

export const adminLogin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { email, password }: { email: string; password: string } = req.body;

		const adminExists = await admin.findOne({ email });
		if (!adminExists) {
			res.status(BAD_REQUEST).json({ error: "invalid credentials" });
			return;
		}

		const passwordCorrect = await bcrypt.compare(password, adminExists.password ?? "");
		if (!passwordCorrect) {
			res.status(BAD_REQUEST).json({ error: "invalid credentials" });
			return;
		}

		const accessToken = JWT.sign({ id: adminExists._id, status: "admin" });
		const refreshToken = getRefreshToken(adminExists._id);

		req.id = adminExists._id as unknown as string;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(OK).json({ message: "admin logged in", accessToken });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const createAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { password, confirmPassword, email, code }: { password: string; confirmPassword: string; code: string; email: string } = req.body;

		if (!password || !confirmPassword || !email) {
			res.status(BAD_REQUEST).json({ error: "send the required details" });
			return;
		}

		if (password !== confirmPassword) {
			res.status(BAD_REQUEST).json({ error: "passwords do not match" });
			return;
		}

		const semiAdmin = await admin.findOne({ email, verified: false });
		if (!semiAdmin) {
			res.status(NOT_FOUND).json({ error: "email is invalid or admin has been verified. contact master admin if issue persists" });
			return;
		}

		if (code !== semiAdmin.code) {
			res.status(UNAUTHORIZED).json({ error: "code sent is invalid" });
			return;
		}

		const salt = bcrypt.genSaltSync(12);

		const hashedPassword = await bcrypt.hash(password, salt);

		semiAdmin.verified = true;
		semiAdmin.password = hashedPassword;
		semiAdmin.code = "";

		await semiAdmin.save();

		const accessToken = JWT.sign({ id: semiAdmin._id, status: "admin" });
		const refreshToken = getRefreshToken(semiAdmin._id);

		req.id = semiAdmin._id as unknown as string;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(OK).json({ message: "admin verified", accessToken });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const getTasks = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const pendingTasks = await submission.find();
		
		res.status(OK).json({ message: "submitted tasks fetched", pendingTasks });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching tasks" });
	}
};

export const markTask = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { id, action, validatedBy }: { id: string; action: string; validatedBy: string } = req.body;

		const taskToBeVerified = await submission.findById(id);

		if (!taskToBeVerified) {
			res.status(NOT_FOUND).json({ error: "task does not exist" });
			return
		}

		let model;

		if (taskToBeVerified.page === "quest") {
			model = await miniQuestCompleted.findOne({ _id: taskToBeVerified.questCompleted, status: { $in: ["pending", "retry"] } });
			if (!model) {
				res.status(NOT_FOUND).json({ error: "mini quest already completed or is invalid" });
				return
			}

			if (action !== "accept") {
				taskToBeVerified.status = "retry";
				taskToBeVerified.validatedBy = validatedBy;
				model.status = "retry";
			} else {
				taskToBeVerified.status = "done";
				taskToBeVerified.validatedBy = validatedBy;
				model.status = "done";
			}

		} else {
			model = await campaignQuestCompleted.findOne({ _id: taskToBeVerified.questCompleted, status: { $in: ["pending", "retry"] } });
			if (!model) {
				res.status(NOT_FOUND).json({ error: "campaign quest already completed or is invalid" });
				return
			}

			if (action !== "accept") {
				taskToBeVerified.status = "retry";
				taskToBeVerified.validatedBy = validatedBy;
				model.status = "retry";
			} else {
				taskToBeVerified.status = "done";
				taskToBeVerified.validatedBy = validatedBy;
				model.status = "done";
			}
		}

		await taskToBeVerified.save();
		await model.save();

		res.status(OK).json({ message: "task marked" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error marking task" });
	}
}
