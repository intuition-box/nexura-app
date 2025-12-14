import logger from "@/config/logger";
import { UNAUTHORIZED } from "@/utils/status.utils";
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
			res.status(400).json({ error: "Token has expired" });
			return
		}

		res.status(500).json({ error: "Invalid authentication token" });
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

		const { id, status } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;
    if (status != "user") {
      res.status(UNAUTHORIZED).json({ error: "only authenticated users can use this route" });
      return;
		}
		console.log({ aut: id });

		req.id = id as string;

		next();
	} catch (error: any) {
		logger.error(error);
		if (error.trim() === "jwt expired") {
			res.status(400).json({ error: "Token has expired, kindly login again" });
			return
		}

		res.status(500).json({ error: "Invalid authentication token" });
	}
}

export const authenticateUser2 = async (req: GlobalRequest, res: GlobalResponse, next: GlobalNextFunction) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];
	
	if (!token) {
		next();
		return;
	}

	const { id } = await JWT.verify(token) as decodedDataType;

	req.id = id as string;

	next();
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

		const { status } = await JWT.verify(authHeader.split(" ")[1]!) as decodedDataType;
    if (status != "admin") {
      res.status(UNAUTHORIZED).json({ error: "only admins can use this route" });
      return;
    }

		next();
	} catch (error: any) {
		logger.error(error);
		if (error.trim() === "jwt expired") {
			res.status(400).json({ error: "Token has expired, kindly login again" });
			return
		}

		res.status(500).json({ error: "Invalid authentication token" });
	}
}