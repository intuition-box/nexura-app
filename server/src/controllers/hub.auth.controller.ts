import { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, CREATED, NOT_FOUND } from "@/utils/status.utils";
import {
	validateHubAdminData,
	getMissingFields,
	validateSuperAdminData,
	JWT,
	getRefreshToken,
	hashPassword
} from "@/utils/utils";
import logger from "@/config/logger";
import { server } from "@/models/server.model";
import { uploadImg } from "@/utils/img.utils";
import {
	CLIENT_URL,
	DISCORD_HUB_CLIENT_REDIRECT_URI,
	DISCORD_HUB_REDIRECT_URI,
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	BOT_TOKEN,
} from "@/utils/env.utils";
import { hubAdmin, hub } from "@/models/hub.model";
import bcrypt from "bcrypt";
import axios from "axios";
import { resetEmail } from "@/utils/sendMail";
import { OTP } from "@/models/otp.model";
import { REDIS } from "@/utils/redis.utils";

const headers = {
	"Content-Type": "application/x-www-form-urlencoded",
	"Accept-encoding": "application/x-www-form-urlencoded",
};

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

		const superAdmin = await hubAdmin.create(req.body);

		const accessToken = JWT.sign(superAdmin._id.toString());
		const refreshToken = getRefreshToken(superAdmin._id.toString());

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(CREATED).json({ message: "super admin created", accessToken });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating super admin" });
	}
}

export const hubDiscordCallback = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { code } = req.query as { code: string };

		if (!code) {
			res.send("Please sign-in/connect discord again");
			return;
		}

		const params = new URLSearchParams({
			client_id: DISCORD_CLIENT_ID,
			client_secret: DISCORD_CLIENT_SECRET,
			redirect_uri: DISCORD_HUB_REDIRECT_URI,
			code,
			grant_type: "authorization_code",
		});

		const { data: { access_token, refresh_token } } = await axios.post("https://discord.com/api/v10/oauth2/token", params, { headers });

		const { data } = await axios.get("https://discord.com/api/v10/users/@me/guilds", {
			headers: {
				...headers,
				Authorization: `Bearer ${access_token}`,
			}
		});

		const serversCreated = await server.create({ servers: data });

		res.redirect(DISCORD_HUB_CLIENT_REDIRECT_URI + `?id=${serversCreated._id}`);
	} catch (error: any) {
		console.error(error);
		console.error("DISCORD HUB TOKEN ERROR STATUS:", error.response?.status);
		console.error("DISCORD HUB TOKEN ERROR DATA:", error.response?.data);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error signing in with discord" });
	}
}

export const fetchServers = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { id } = req.query as { id: string };

		const discordServers = await server.findById(id);
		if (!discordServers) {
			res.status(INTERNAL_SERVER_ERROR).json({ error: "kindly authenticate your discord" });
			return;
		}

		res.json({ message: "servers fetched", servers: discordServers.servers });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error fetching discord servers" });
	}
}

export const fetchRoles = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { id, serverId } = req.query as { id: string; serverId: string };

		const discordServers = await server.findById(id);
		if (!discordServers) {
			res.status(INTERNAL_SERVER_ERROR).json({ error: "kindly authenticate your discord" });
			return;
		}

		const { data } = await axios.get(`https://discord.com/api/v10/guilds/${serverId}/roles`, {
			headers: {
				...headers,
				Authorization: `Bot ${BOT_TOKEN}`,
			}
		});

		res.json({ message: "roles fetched", roles: data });
	} catch (error: any) {
		console.error(error);
		console.error("DISCORD HUB TOKEN ERROR STATUS:", error.response?.status);
		console.error("DISCORD HUB TOKEN ERROR DATA:", error.response?.data);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error fetching discord roles" });
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

		req.body.hub = otp.hubId;
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

		const hubAdminExists = await hubAdmin.findOne({ email }).lean();
		if (!hubAdminExists) {
			res.status(NOT_FOUND).json({ error: "email associated with admin is invalid or does not exist" });
			return;
		}

		const id = hubAdminExists._id.toString();
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
