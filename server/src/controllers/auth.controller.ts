import bcrypt from "bcrypt";
import cryptoRandomString from "crypto-random-string";
import logger from "@/config/logger";
import {
	BAD_REQUEST,
	CREATED,
	INTERNAL_SERVER_ERROR,
	OK,
} from "@/utils/status.utils";
import { formatDate } from "date-fns";
import { user } from "@/models/user.model";
import { getRefreshToken, JWT, validateProjectData, validateUserSignUpData } from "@/utils/utils";
import { project } from "@/models/project.model";
import { uploadImg } from "@/utils/img.utils";
import { referredUsers } from "@/models/referrer.model";

interface SignUpParams {
	email: string;
	username: string;
	password: string;
	referrer?: string
}

const hashPassword = async (password: string) => {
	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
}

export const signUp = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { success } = validateUserSignUpData(req.body);
		if (!success) {
			res
				.status(BAD_REQUEST)
				.json({ error: "send the correct data required to create a user" });
			return;
		}

		const { username, password, email, referrer: referrerCode }: SignUpParams =
			req.body;

		if (username.length < 4) {
			res
				.status(BAD_REQUEST)
				.json({ error: "username cannot be empty or less than 4 characters" });
			return;
		}

		const userReferrerCode = cryptoRandomString({
			length: 8,
			type: "alphanumeric",
		});

		const dateJoined = formatDate(new Date(), "MMM, y");

		const referral = {
			code: userReferrerCode,
		};

		const userReferrer = await user.findOne({ referral: { code: referrerCode } });
		const hashedPassword = await hashPassword(password);

		const newUser = await user.create({ username, referral, dateJoined, password: hashedPassword, email });
		const signedUp = formatDate(new Date(), "MMM dd, y");
		if (userReferrer) {
			await referredUsers.create({ user: userReferrer._id, signedUp, username: newUser.username });
		}

		const id = newUser._id;

		const accessToken = JWT.sign({ id, status: "user" });
		const refreshToken = getRefreshToken(id);

		req.id = id as unknown as string;

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			maxAge: 30 * 24 * 60 * 60,
		});

		res.status(CREATED).json({ message: "user created!", accessToken });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "Error signing user up" });
	}
};

export const signIn = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		// const { usernameOrEmail, password }: { usernameOrEmail: string; password: string } =
		// 	req.body;

		// if (!usernameOrEmail || usernameOrEmail.length < 4 || !password) {
		// 	res
		// 		.status(BAD_REQUEST)
		// 		.json({ error: "usernameOrEmail or password cannot be empty or less than 4 characters" });
		// 	return;
		// }

		// const existingUser = await user.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
		// if (!existingUser) {
		// 	res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
		// 	return;
		// }

		// const comparePassword = await bcrypt.compare(password, existingUser.password);
		// if (!comparePassword) {
		// 	res.status(BAD_REQUEST).json({ error: "invalid signin credentials" });
		// 	return;
		// }

		// const id = existingUser._id;

		// const accessToken = JWT.sign({ id, status: "user" });
		// const refreshToken = getRefreshToken(id);

		// req.id = id as unknown as string;

		// res.cookie("refreshToken", refreshToken, {
		// 	httpOnly: true,
		// 	secure: true,
		// 	maxAge: 30 * 24 * 60 * 60,
		// });

		// res.status(OK).json({ message: "user signed in!", accessToken });

		const { username, address, referrer }: { username?: string; address: string; referrer?: string } =
			req.body;

		// if (!username || username.length < 4) {
		// 	res
		// 		.status(BAD_REQUEST)
		// 		.json({ error: "username cannot be empty or less than 4 characters" });
		// 	return;
		// }

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
		req.body.password = await hashPassword(req.body.password);

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
