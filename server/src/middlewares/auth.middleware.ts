import logger from "@/config/logger";
import { admin } from "@/models/admin.model";
import { bannedUser } from "@/models/bannedUser.model";
import { project, projectAdmin } from "@/models/project.model";
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

export const authenticateProject = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
    }

		const { id } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;
		
    const projectExists = await project.findById(id).lean();
    if (!projectExists) {
      res.status(UNAUTHORIZED).json({ error: "route is available only to projects" });
      return;
    }

    req.id = id as string;
    req.adminName = projectExists.name;
	req.campaignCreator = projectExists;

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

export const authenticateProject2 = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({
				error: "authorization token is missing or invalid",
			});
			return;
    }

    const token = authHeader.split(" ")[1]!;

    const adminOrProjectLoggedOut = await REDIS.get(`logout:${token}`);
    if (adminOrProjectLoggedOut) {
      res.status(BAD_REQUEST).json({ error: "admin or project is logged out, kindly login again" });
      return;
    }

    const { id } = await JWT.verify(token) as decodedDataType;

    let exists;

    exists = await projectAdmin.findById(id).lean();
    if (!exists) {
      const projectExists = await project.findById(id).lean();
      if (!projectExists) {
        res.status(UNAUTHORIZED).json({ error: "route is available only to projects and project admins" });
        return;
      }

      exists = { name: projectExists.name, project: projectExists._id };
    }

    req.id = id as string;
    req.adminName = exists.name;
    req.project = exists.project.toString();
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
