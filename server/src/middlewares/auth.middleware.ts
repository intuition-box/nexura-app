import logger from "@/config/logger";
import { admin } from "@/models/admin.model";
import { bannedUser } from "@/models/bannedUser.model";
import { hub, hubAdmin } from "@/models/hub.model";
import { user } from "@/models/user.model";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/utils/status.utils";
import { JWT } from "@/utils/utils";
import { REDIS } from "@/utils/redis.utils";
import multer from "multer";

type decodedDataType = {
	id: string;
};

const fileSize = 5 * (1024 ** 2); // 5 MB

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize }
});

export const authenticateHubAdmin = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
    }

		const { id } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;

    const superAdminExists = await hubAdmin.findOne({ _id: id, role: "superadmin" }).lean();
    if (!superAdminExists) {
      res.status(UNAUTHORIZED).json({ error: "route is available only to super admins" });
      return;
    }

    req.id = id as string;
    req.adminName = superAdminExists.name;
  	req.admin = superAdminExists;

		next();
	} catch (error: any) {
		logger.error(error);
		if (error?.trim() === "jwt expired") {
			res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login" });
			return
		}

		res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
	}
}

export const authenticateHubAdmin2 = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
    }

    const token = authHeader.split(" ")[1]!;

    const loggedOut = await REDIS.get(`logout:${token}`);
    if (loggedOut) {
      res.status(BAD_REQUEST).json({ error: "admin is logged out, kindly login again" });
      return;
    }

    const { id } = await JWT.verify(token) as decodedDataType;

    const exists = await hubAdmin.findById(id).lean();
    if (!exists) {
      res.status(UNAUTHORIZED).json({ error: "route is available only to admins" });
      return;
    }

    req.id = id as string;
    req.adminName = exists.name;
    req.admin = exists;
    req.token = token;

		next();
	} catch (error: any) {
		logger.error(error);
		if (error?.trim() === "jwt expired") {
			res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login" });
			return
		}

		res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
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

    const token = authHeader.split(" ")[1]!;

    const userLoggedOut = await REDIS.get(`logout:${token}`);
    if (userLoggedOut) {
      res.status(BAD_REQUEST).json({ error: "user is logged out, kindly login again" });
      return;
    }

		const { id } = await JWT.verify(token) as decodedDataType;

    req.id = id as string;
		req.token = token;

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
		if (error?.trim() === "jwt expired") {
			res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login, kindly login again" });
			return
		}

		res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
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
      res.status(UNAUTHORIZED).json({
        error: "authorization token is missing or invalid",
      });
      return;
    }

    const token = authHeader.split(" ")[1]!;

    const adminLoggedOut = await REDIS.get(`logout:${token}`);
    if (adminLoggedOut) {
      res.status(BAD_REQUEST).json({ error: "admin is logged out, kindly login again" });
      return;
    }

    const { id } = await JWT.verify(token) as decodedDataType;

    const isAdmin = await admin.findById(id);
    if (!isAdmin) {
      res.status(UNAUTHORIZED).json({ error: "only admins can use this route" });
      return;
    }

    req.id = id;
    req.token = token;
    req.role = isAdmin.role;

    next();
  } catch (error: any) {
    logger.error(error);
    if (error?.trim() === "jwt expired") {
      res.status(BAD_REQUEST).json({ error: "Token has expired, kindly re-login, kindly login again" });
      return
    }

    res.status(INTERNAL_SERVER_ERROR).json({ error: "Invalid authentication token, kindly re-login." });
  }
};
