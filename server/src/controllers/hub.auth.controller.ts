import { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, CREATED, NOT_FOUND } from "@/utils/status.utils";
import {
  validateHubAdminData,
  getMissingFields,
  validateSuperAdminData,
  validateHubData,
  JWT,
  getRefreshToken,
  hashPassword
} from "@/utils/utils";
import logger from "@/config/logger";
import { uploadImg } from "@/utils/img.utils";
import { CLIENT_URL } from "@/utils/env.utils";
import { hubAdmin, hub } from "@/models/hub.model";
import bcrypt from "bcrypt";
import { resetEmail } from "@/utils/sendMail";
import { OTP } from "@/models/otp.model";
import { REDIS } from "@/utils/redis.utils";

export const signIn = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { email, password }: { email: string; password: string } = req.body;

		if (!email || !password) {
			res.status(BAD_REQUEST).json({ error: "send the required data: email and password" });
			return;
    }

    const adminExists = await hubAdmin.findOne({ email }).lean();
    if (!adminExists) {
      res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
      return;
    }

    const comparePassword = await bcrypt.compare(password, adminExists.password);
    if (!comparePassword) {
      res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
      return;
    }

    const id = adminExists._id.toString();

		const accessToken = JWT.sign(id);
		const refreshToken = getRefreshToken(id);

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

export const superAdminSignUp = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { error } = validateSuperAdminData(req.body);
    if (error) {
      const missingFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `these field(s) are/is required: ${missingFields}` });
			return;
    }

    req.body.role = "superadmin";

    await hubAdmin.create(req.body);

    res.status(CREATED).json({ message: "created" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating super admin" });
  }
}

export const hubAdminSignUp = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    const { email, code } = req.body;
		const { error } = validateHubAdminData(req.body);

    if (error) {
      const missingFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `these field(s) are/is required: ${missingFields}` });
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

		const adminExists = await hubAdmin.findOne({ email }).lean();
		if (adminExists) {
			res.status(BAD_REQUEST).json({ error: "email is already in use" });
			return;
    }

    req.body.hub = otp.projectId;
    req.body.role = "admin";

		const admin = await hubAdmin.create(req.body);

		const id = admin._id.toString();

		const accessToken = JWT.sign(id);
		const refreshToken = getRefreshToken(id);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
    });

		await OTP.deleteOne({ code });

		res.status(OK).json({ message: "hub admin signed up!", accessToken });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error signing up hub admin" });
	}
};

export const forgotPassword = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
    const { email } = req.body;

    if (!email) {
      res.status(BAD_REQUEST).json({ error: "email is required" });
      return;
    }

    const projectExists = await hubAdmin.findOne({ email }).lean();
    if (!projectExists) {
      res.status(NOT_FOUND).json({ error: "email associated with admin is invalid or does not exist" });
      return;
    }

    const id = projectExists._id.toString();
    const clientLink = `${CLIENT_URL}/hub/reset-password?token=`;

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

export const resetPassword = async (req: GlobalRequest, res: GlobalResponse) => {
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

		const adminExists = await hubAdmin.findById(id);
		if (!adminExists) {
			res.status(BAD_REQUEST).json({ error: "id associated with admin is invalid" });
			return;
    }

    const hashedPassword = await hashPassword(password);

		adminExists.password = hashedPassword;
		await adminExists.save();

		await REDIS.set({ key: `reset-access-token:${token}`, data: { token }, ttl: 10 * 60 });

		res.status(OK).json({ message: "admin password reset successful!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error resetting admin password" });
	}
};

export const logout = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    const { token } = req;

  	await REDIS.set({ key: `logout:${token}`, data: { token }, ttl: 7 * 24 * 60 * 60 });

		res.clearCookie("refreshToken");
		res.status(OK).json({ message: "admin logged out!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error logging out admin" });
	}
};
