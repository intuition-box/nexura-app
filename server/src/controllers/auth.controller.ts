import bcrypt from "bcrypt";
import cryptoRandomString from "crypto-random-string";
import logger from "@/config/logger";
import {
	BAD_REQUEST,
	CREATED,
	INTERNAL_SERVER_ERROR,
	NOT_FOUND,
	OK,
} from "@/utils/status.utils";
import {
	DISCORD_CLIENT_ID,
	DISCORD_REDIRECT_URI,
	DISCORD_CLIENT_SECRET, 
	X_API_BEARER_TOKEN,
	X_CLIENT_REDIRECT_URI,
	DISCORD_CLIENT_REDIRECT_URI,
	X_REDIRECT_URI, 
	X_API_CLIENT_ID,
	X_API_CLIENT_SECRET
} from "@/utils/env.utils";
import { formatDate } from "date-fns";
import { user } from "@/models/user.model";
import { getRefreshToken, JWT, validateProjectData } from "@/utils/utils";
import { project } from "@/models/project.model";
import { uploadImg } from "@/utils/img.utils";
import { referredUsers } from "@/models/referrer.model";
import axios from "axios";
import { cvModel } from "@/models/cv.models";

export const discordCallback = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { code } = req.query as { code: string };

		if (!code) {
			res.send("Please sign-in/connect discord again");
			return;
		}

		const params = new URLSearchParams({
			client_id: DISCORD_CLIENT_ID,
			client_secret: DISCORD_CLIENT_SECRET,
			redirect_uri: DISCORD_REDIRECT_URI,
			code,
			grant_type: "authorization_code",
		});

		const headers = {
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept-encoding": "application/x-www-form-urlencoded",
		};

		const { data: { access_token, refresh_token } } = await axios.post("https://discord.com/api/v10/oauth2/token", params, { headers });

		const { data: { id, username } } = await axios.get("https://discord.com/api/v10/users/@me", {
			headers: {
				...headers,
				Authorization: `Bearer ${access_token}`,
			}
		});

		res.redirect(DISCORD_CLIENT_REDIRECT_URI + `?discord_id=${id}&username=${username}`);
	} catch (error: any) {
		logger.error(error);
		console.error("DISCORD TOKEN ERROR STATUS:", error.response?.status)
		console.error("DISCORD TOKEN ERROR DATA:", error.response?.data)
		console.error("DISCORD TOKEN ERROR HEADERS:", error.response?.headers)
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error signing in with discord" });
	}
};

export const xCallback = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { code, state } = req.query as { code: string; state: string };

		if (!code) {
			res.status(BAD_REQUEST).json({ error: "auth code from x is required" });
			return;
		}

		const fetchState = await cvModel.findOne({ state });
		if (!fetchState) {
			res.status(NOT_FOUND).json({ error: "state var is needed" });
			return;
		}

		const { data: { access_token } } = await axios.post(
			`https://api.x.com/2/oauth2/token?grant_type=authorization_code&client_id=${X_API_CLIENT_ID}&redirect_uri=${X_REDIRECT_URI}&code=${code}&code_verifier=${fetchState.cv}`, 
			{ headers: 
				{ "Content-Type": "application/x-www-form-urlencoded" }
			}
		);

		const { data: { id, username } } = await axios.get("https://api.x.com/2/users/me",
			{ headers: 
				{ "Authorization": `Bearer ${access_token}` }
			}
		);

		res.redirect(X_CLIENT_REDIRECT_URI + `?x_id=${id}&username=${username}`);
	} catch (error: any) {
		logger.error(error);
		console.error("X TOKEN ERROR STATUS:", error.response?.status)
		console.error("X TOKEN ERROR DATA:", error.response?.data)
		console.error("X TOKEN ERROR HEADERS:", error.response?.headers)	
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error signing in with x" });
	}
}

export const signIn = async (req: GlobalRequest, res: GlobalResponse) => {
	try {

		const { address, referrer }: { address: string; referrer?: string } =
			req.body;

		if (!address) {
			res
				.status(BAD_REQUEST)
				.json({ error: "address cannot be empty" });
			return;
		}

		const slicedAddress = address.slice(0, 4) + "..." + address.slice(-4);
		console.log({ slicedAddress, referrer });

		const userExists = await user.findOne({ address });
		if (!userExists) {

			const referrerCode = cryptoRandomString({
				length: 8,
				type: "alphanumeric",
			});

			const dateJoined = formatDate(new Date(), "MMM, y");

			const referral = {
				code: referrerCode,
			};

			const userReferrer = await user.findOne({ "referral.code": referrer });

			const newUser = new user({ address, username: slicedAddress, referral, dateJoined });

			const id = newUser._id;

			if (userReferrer) {
				const signedUp = formatDate(new Date(), "MMM dd, y");

				await referredUsers.create({ user: userReferrer._id, newUser: id, signedUp, username: slicedAddress });
			}

			await newUser.save();

			const accessToken = JWT.sign({ id, status: "user" });
			const refreshToken = getRefreshToken(id);

			req.id = id as unknown as string;

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: true,
				maxAge: 30 * 24 * 60 * 60,
			});

			res.status(CREATED).json({ message: "user created!", accessToken, user: newUser });
			return;
		}

		const accessToken = JWT.sign({ id: userExists._id, status: "user" });
		const refreshToken = getRefreshToken(userExists._id);

		req.id = userExists._id as unknown as string;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(200).json({ message: "signed in", accessToken, user: userExists });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error signing user in" });
	}
};

export const projectSignUp = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const projectLogoAsFile = req.file?.buffer;
		if (!projectLogoAsFile) {
			res.status(BAD_REQUEST).json({ error: "project logo is required" });
			return;
		}

		const { success } = validateProjectData(req.body);
		if (!success) {
			res
				.status(BAD_REQUEST)
				.json({ error: "send the correct data required to create a project" });
			return;
		}

		const projectLogoUrl = await uploadImg({
			file: projectLogoAsFile,
			filename: req.file?.originalname as string,
			folder: "project-logo",
		});

		req.body.logo = projectLogoUrl;
		// req.body.password = await hashPassword(req.body.password);

		const projectUser = await project.create(req.body);

		const id = projectUser._id;

		const accessToken = JWT.sign({ id, status: "project" });
		const refreshToken = getRefreshToken(id);

		req.id = id as unknown as string;

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

export const projectSignIn = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const { email, password }: { email: string; password: string } = req.body;

		if (!email || !password) {
			res.status(BAD_REQUEST).json({ error: "send the required data" });
			return;
		}

		const projectUser = await project.findOne({ email });
		if (!projectUser) {
			res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
			return;
		}

		// const comparePassword = await bcrypt.compare(password, projectUser.password);
		// if (!comparePassword) {
		// 	res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
		// 	return;
		// }

		const id = projectUser._id;

		const accessToken = JWT.sign({ id, status: "project" });
		const refreshToken = getRefreshToken(id);

		req.id = id as unknown as string;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(OK).json({ message: "project signed in!", accessToken });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error signing project in" });
	}
};
