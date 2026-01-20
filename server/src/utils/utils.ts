import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_SECRET, REFRESH_SECRET } from "./env.utils";
import { performIntuitionOnchainAction } from "./account";
import { NexonsAddress } from "./constants";

export const padNumber = (numberToBePadded: number) => {
	return numberToBePadded.toString().padStart(3, "0");
}

async function updateLevel (xp: number, badges: number[], userId: string) {
	let address: `0x${string}` | undefined = undefined;
	let level: string = "1";

	if (xp > 1000 && xp < 3000) {
		level = "1";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 3000 && xp < 6000) {
		level = "2";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 6000 && xp < 10000) {
		level = "3";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 10000 && xp < 15000) {
		level = "4";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 15000 && xp < 20000) {
		level = "5";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 20000 && xp < 30000) {
		level = "6";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 30000 && xp < 40000) {
		level = "7";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 40000 && xp < 50000) {
		level = "8";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp > 50000 && xp < 65000) {
		level = "9";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	} else if (xp >= 65000) {
		level = "10";
		if (!badges.includes(parseInt(level))) {
			address = NexonsAddress[level]
		}
	}

	if (address) {
		await performIntuitionOnchainAction({ action: "allow-mint", level, userId });
	}

	return level;
}

export { updateLevel };

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
