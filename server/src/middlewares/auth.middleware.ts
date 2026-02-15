import logger from "@/config/logger";
import { admin } from "@/models/admin.model";
import { bannedUser } from "@/models/bannedUser.model";
import { user } from "@/models/user.model";
import { BAD_REQUEST, UNAUTHORIZED } from "@/utils/status.utils";
import { JWT } from "@/utils/utils";
import multer from "multer";

type decodedDataType = {
	status: "project" | "user" | "admin";
	id: string;
};

const fileSize = 5 * (1024 ** 2); // 5 MB

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize }
});

export const authenticateProject = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
		}

		const { id, status } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;
		if (status != "project") {
			res.status(UNAUTHORIZED).json({ error: "only authenticated projects can use this route" });
			return;
		}

		req.id = id as string;

		next();
	} catch (error: any) {
		logger.error(error);
		if (error.trim() === "jwt expired") {
			res.status(400).json({ error: "Token has expired, kindly re-login" });
			return
		}

		res.status(500).json({ error: "Invalid authentication token, kindly re-login." });
	}
}

export const authenticateUser = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
		}

		const { id } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;

		req.id = id as string;

		const userExists = await user.findById(id);
		if (!userExists) {
			res.status(BAD_REQUEST).json({ error: "id associated with user is invalid" });
			return;
		}

		const userBanned = await bannedUser.findOne({ userId: id });
		if (userBanned) {
			res.status(BAD_REQUEST).json({ error: "user is banned" });
			return;
		}

		next();
	} catch (error: any) {
		logger.error(error);
		if (error.trim() === "jwt expired") {
			res.status(400).json({ error: "Token has expired, kindly re-login, kindly login again" });
			return
		}

		res.status(500).json({ error: "Invalid authentication token, kindly re-login." });
	}
}

export const authenticateUser2 = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];

		if (!token) {
			next();
			return;
		}

		const { id } = await JWT.verify(token) as decodedDataType;

		req.id = id as string;

		next();
	} catch (error) {
		next();
	}
}

export const authenticateAdmin = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
		}

		const { id } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;

		const isAdmin = await admin.findById(id);
		if (!isAdmin) {
			res.status(UNAUTHORIZED).json({ error: "only admins can use this route" });
			return;
		}

    req.id = id;

    req.role = isAdmin.role;

		next();
	} catch (error: any) {
		logger.error(error);
		if (error.trim() === "jwt expired") {
			res.status(400).json({ error: "Token has expired, kindly re-login, kindly login again" });
			return
		}

		res.status(500).json({ error: "Invalid authentication token, kindly re-login." });
	}
}