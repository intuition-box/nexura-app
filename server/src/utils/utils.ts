import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_SECRET, REFRESH_SECRET } from "./env.utils";

export const padNumber = (numberToBePadded: number) => {
	return numberToBePadded.toString().padStart(3, "0");
}

export const validateCampaignData = (reqData: any) => {
	const campaignSchema = z.object({
		title: z.string().trim(),
		description: z.string().trim(),
		nameOfProject: z.string().trim(),
		starts_at: z.string().trim(),
		ends_at: z.string().trim(),
		reward: z.object({
			xp: z.number(),
			// trust: z.number()
		}),
		totaltrustAvailable: z.number().optional(),
		contractAddress: z.string().optional(),
	});

	const parseData = campaignSchema.safeParse(reqData);

	return parseData;
};

export const validateQuestData = (reqData: any) => {
	const questSchema = z.object({
		title: z.string().trim(),
		description: z.string().trim(),
		category: z.enum(["one-time", "weekly"]),
		reward: z.object({
			xp: z.number(),
			trust: z.number(),
		}),
		url: z.string().trim().optional(),
	});

	const parseData = questSchema.safeParse(reqData);

	return parseData;
};

export const validateMiniQuestData = (reqData: any) => {
	const miniQuestSchema = z.object({
		text: z.string().trim(),
		quest: z.string().trim(),
		link: z.string().trim().optional(),
	});

	const parseData = miniQuestSchema.safeParse(reqData);

	return parseData;
};

export const validateCampaignQuestData = (reqData: any) => {
	const questSchema = z.object({
		title: z.string().trim(),
		description: z.string().trim(),
		url: z.string().trim().optional(),
		campaign: z.string().trim(),
		reward: z.object({
			xp: z.number(),
		}),
	});

	const parseData = questSchema.safeParse(reqData);

	return parseData;
};

export const validateEcosystemQuestData = (reqData: any) => {
	const ecosystemSchema = z.object({
		title: z.string().trim(),
		description: z.string().trim(),
		timer: z.string().trim(),
		link: z.string().trim(),
		tags: z.enum([
			"defi",
			"lending-protocols",
			"prediction-markets",
			"nft",
			"social",
			"gaming",
			"portal",
			"domain-name",
			"launchpads",
		]),
		rewards: z.object({
			xp: z.number(),
			trust: z.number(),
		}),
	});

	const parseData = ecosystemSchema.safeParse(reqData);

	return parseData;
};

export const validateProjectData = (reqData: any) => {
	const projectSchema = z.object({
		name: z.string().trim(),
		email: z.email().trim(),
		description: z.string().trim(),
		// password: z.string().trim(),
	});

	const parseData = projectSchema.safeParse(reqData);

	return parseData;
};

export const validateUserSignUpData = (reqData: any) => {
	const userSchema = z.object({
		username: z.string().trim(),
		email: z.email().trim().optional(),
		// password: z.string().trim(),
	});

	const parseData = userSchema.safeParse(reqData);

	return parseData;
};

export const JWT = {
	sign: (data: any) => {
		return jwt.sign(data, JWT_SECRET, { expiresIn: "1d" });
	},

	verify: (jwtToken: string) => {
		return new Promise((resolve, reject) => {
			jwt.verify(jwtToken, JWT_SECRET, (error, decodedText) => {
				if (error) reject(error.message);
				else if (typeof decodedText === "object") {
					resolve(decodedText);
				} else {
					reject("Invalid JWT payload");
				}
			});
		});
	},
};

export const getRefreshToken = (id: any) => {
	return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: "30d" });
};
