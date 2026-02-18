import { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, CREATED } from "@/utils/status.utils";
import {
  validateProjectAdminData,
  getMissingFields,
  validateProjectData,
  JWT,
  getRefreshToken,
  hashPassword
} from "@/utils/utils";
import logger from "@/config/logger";
import { uploadImg } from "@/utils/img.utils";
import { CLIENT_URL } from "@/utils/env.utils";
import { projectAdmin, project } from "@/models/project.model";
import bcrypt from "bcrypt";
import { resetEmail } from "@/utils/sendMail";
import { OTP } from "@/models/otp.model";
import { REDIS } from "@/utils/redis.utils";

export const projectSignUp = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
    const { error } = validateProjectData(req.body);
		if (error) {
      const emptyFields = getMissingFields(error);

			res
				.status(BAD_REQUEST)
				.json({ error: `these field(s) are required: ${emptyFields}` });
			return;
    }

    const projectExists = await project.exists({ email: req.body.email });
    if (projectExists) {
      res.status(BAD_REQUEST).json({ error: "email is already in use" });
      return;
    }

    const name = req.body.name.toLowerCase().trim();

    const nameExists = await project.exists({ name });
    if (nameExists) {
      res.status(BAD_REQUEST).json({ error: "name is already in use" });
      return;
    }

    const projectLogoAsFile = req.file?.buffer;
		if (!projectLogoAsFile) {
			res.status(BAD_REQUEST).json({ error: "project logo is required" });
			return;
    }

    const projectLogo = await uploadImg({ file: projectLogoAsFile, filename: req.file?.originalname, folder: "project-logos" });

    req.body.password = await hashPassword(req.body.password);
    req.body.logo = projectLogo;
		req.body.name = name;

		const projectUser = await project.create(req.body);

		const id = projectUser._id.toString();

		const accessToken = JWT.sign(id);
		const refreshToken = getRefreshToken(id);

		req.id = id;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(CREATED).json({ message: "project created!", accessToken });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error signing project up" });
	}
};

export const projectAndAdminSignIn = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { email, password, role }: { email: string; password: string; role: string } = req.body;

		if (!email || !password || !role) {
			res.status(BAD_REQUEST).json({ error: "send the required data: role, email and password" });
			return;
    }

    let id: string = "";

    if (role !== "project") {
      const projectAdminExists = await projectAdmin.findOne({ email }).lean();
      if (!projectAdminExists) {
        res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
        return;
      }

      const comparePassword = await bcrypt.compare(password, projectAdminExists.password);
      if (!comparePassword) {
        res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
        return;
      }

      id = projectAdminExists._id.toString();
    } else if (role === "project") {
      const projectExists = await project.findOne({ email }).lean();
      if (!projectExists) {
        res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
        return;
      }

      const comparePassword = await bcrypt.compare(password, projectExists.password);
      if (!comparePassword) {
        res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
        return;
      }

      id = projectExists._id.toString();
		}

		const accessToken = JWT.sign(id);
		const refreshToken = getRefreshToken(id);

		req.id = id;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(OK).json({ message: "signed in!", accessToken });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error signing in" });
	}
};

export const projectAdminSignUp = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    const { email, code } = req.body;
		const { error } = validateProjectAdminData(req.body);

    if (error) {
      const missingFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `these field(s) are required: ${missingFields}` });
			return;
    }

    const otp = await OTP.findOne({ code, email }).lean();
    if (!otp) {
      res.status(BAD_REQUEST).json({ error: "otp has expired" });
      return;
    }

    const now = new Date();

    if (otp.expiresAt < now) {
      res.status(BAD_REQUEST).json({ error: "otp has expired" });
      return;
    };

		const adminExists = await projectAdmin.findOne({ email }).lean();
		if (adminExists) {
			res.status(BAD_REQUEST).json({ error: "email is already in use" });
			return;
    }

    req.body.project = otp.projectId;

		const admin = await projectAdmin.create(req.body);

		const id = admin._id.toString();

		const accessToken = JWT.sign(id);
		const refreshToken = getRefreshToken(id);

		req.id = id;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
    });

		await OTP.deleteOne({ code });
		
		res.status(OK).json({ message: "project admin signed up!", accessToken });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error signing up project admin" });
	}
};

export const forgotPassword = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
    const { email, role } = req.body;

    if (!email || !role) {
      res.status(BAD_REQUEST).json({ error: "email and role are required" });
      return;
    }
    
    let id;
    let clientLink;

    if (role === "admin") {
      const adminExists = await projectAdmin.findOne({ email }).lean();
      if (!adminExists) {
        res.status(BAD_REQUEST).json({ error: "email associated with admin is invalid" });
        return;
      }

      id = adminExists._id.toString();
      clientLink = `${CLIENT_URL}/admin/reset-password?token=`;
    } else if (role === "project") {
      const projectExists = await project.findOne({ email }).lean();
      if (!projectExists) {
        res.status(BAD_REQUEST).json({ error: "email associated with project is invalid" });
        return;
      }

      id = projectExists._id.toString();
      clientLink = `${CLIENT_URL}/project/reset-password?token=`;
    }

		const token = JWT.sign(id, "10m");
		const link = clientLink + token;

		await resetEmail(email, link);

		res.status(OK).json({ message: "password reset email sent!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error sending password reset email" });
	}
};

export const resetPasswordProject = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { token, password } = req.body;

		if (!token || !password) {
			res.status(BAD_REQUEST).json({ error: "send token and password" });
			return;
    }

    const accessTokenUsed = await REDIS.get(`reset-access-token:${token}`);
    if (accessTokenUsed) {
      res.status(BAD_REQUEST).json({ error: "access token already used, request a new one to change your password" });
      return;
  	}

    const { id } = await JWT.verify(token) as { id: string };

		const projectExists = await project.findById(id);
		if (!projectExists) {
			res.status(BAD_REQUEST).json({ error: "id associated with project or token is invalid" });
			return;
    }

    const hashedPassword = await hashPassword(password);

		projectExists.password = hashedPassword;
		await projectExists.save();

		await REDIS.set({ key: `reset-access-token:${token}`, data: { token }, ttl: 10 * 60 });

		res.status(OK).json({ message: "project password reset successful!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error resetting project password" });
	}
};

export const resetPasswordProjectAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { token, password } = req.body;

		if (!token || !password) {
			res.status(BAD_REQUEST).json({ error: "send token and password" });
			return;
		}

		const accessTokenUsed = await REDIS.get(`reset-access-token:${token}`);
		if (accessTokenUsed) {
			res.status(BAD_REQUEST).json({ error: "access token already used, request a new one to change your password" });
			return;
		}

    const { id } = await JWT.verify(token) as { id: string };
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "token is invalid" });
      return;
    }

		const projectAdminExists = await projectAdmin.findById(id);
		if (!projectAdminExists) {
			res.status(BAD_REQUEST).json({ error: "id associated with project admin or token is invalid" });
			return;
    }

    const hashedPassword = await hashPassword(password);

		projectAdminExists.password = hashedPassword;
    await projectAdminExists.save();

    await REDIS.set({ key: `reset-access-token:${token}`, data: { token }, ttl: 10 * 60 });

		res.status(OK).json({ message: "project admin password reset successful!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error resetting project admin password" });
	}
};

export const logoutProjectOrAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    
    const { token } = req;

  	await REDIS.set({ key: `logout:${token}`, data: { token }, ttl: 7 * 24 * 60 * 60 });

		res.clearCookie("refreshToken");
		res.status(OK).json({ message: "project or admin logged out!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error logging out project or admin" });
	}
};
