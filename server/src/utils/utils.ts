import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_SECRET, network, REFRESH_SECRET } from "./env.utils";
import { performIntuitionOnchainAction } from "./account";
import { NexonsAddress } from "./constants";
import { ethers } from "ethers";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const padNumber = (numberToBePadded: number) => {
	return numberToBePadded.toString().padStart(3, "0");
}

export const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(12);
	return await bcrypt.hash(password, salt);
}

export const startOfDayUTC = (date = new Date()): Date => {
	return new Date(Date.UTC(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate()
	));
};

async function updateLevel (xp: number, badges: number[], userId: string) {
	let address: `0x${string}` | undefined = undefined;
	let level: string = "1";

	try {
		if (xp >= 1000 && xp < 3000) {
			level = "1";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 3000 && xp < 6000) {
			level = "2";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 6000 && xp < 10000) {
			level = "3";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 10000 && xp < 15000) {
			level = "4";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 15000 && xp < 20000) {
			level = "5";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 20000 && xp < 30000) {
			level = "6";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 30000 && xp < 40000) {
			level = "7";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 40000 && xp < 50000) {
			level = "8";
			if (!badges.includes(parseInt(level))) {
				address = NexonsAddress[level]
			}
		} else if (xp >= 50000 && xp < 65000) {
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
	} catch (error) {
		return level;
	}
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
			trust: z.number().optional().default(0),
			pool: z.number()
		}),
		totalTrustAvailable: z.number().optional(),
		campaignQuests: z.array(
			z.object({
				link: z.string().optional(),
				quest: z.string(),
				tag: z.enum(["like", "follow-x", "repost-x", "join-discord", "portal", "message-discord", "portal", "comment-x", "other"]),
				category: z.enum(["twitter", "discord", "reddit", "instagram", "facebook", "other"]),
			})
		),
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

export const validateHubData = (reqData: any) => {
	const hubSchema = z.object({
		name: z.string().trim(),
    description: z.string().trim(),
		address: z.string().trim(),
	});

	const parseData = hubSchema.safeParse(reqData);

	return parseData;
};

export const generateOTP = () => {
	const code = crypto
		.randomInt(0, 1000000000)
		.toString()
		.padStart(6, "0")
    .slice(0, 6);

	return code;
};

export const validateSuperAdminData = (reqData: any) => {
	const hubSuperAdminSchema = z.object({
		name: z.string().trim().min(3),
		email: z.email().trim(),
    password: z.string().trim().min(8),
	});

	const parseData = hubSuperAdminSchema.safeParse(reqData);

	return parseData;
};

export const validateHubAdminData = (reqData: any) => {
	const hubAdminSchema = z.object({
		name: z.string().trim().min(3),
		email: z.email().trim(),
    password: z.string().trim().min(8),
		code: z.string().trim().length(6),
	});

	const parseData = hubAdminSchema.safeParse(reqData);

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

export const validateSaveCampaignData = (reqData: any) => {
  const campaignSchema = z.object({
		title: z.string().trim(),
		description: z.string().trim(),
		nameOfProject: z.string().trim(),
    starts_at: z.string().trim(),
		projectCoverImage: z.string().optional(),
		ends_at: z.string().trim(),
		reward: z.object({
			xp: z.number(),
			trust: z.number().optional().default(0),
			pool: z.number()
		}),
		totalTrustAvailable: z.number().optional(),
	});

	const parseData = campaignSchema.safeParse(reqData);

	return parseData;
}; 

export const getMissingFields = (error: z.ZodError<Record<any, unknown>>) => {
  const emptyFieldsArray = Object.keys(z.treeifyError(error).properties!);
  const emptyFields = emptyFieldsArray.join(", ");
  return emptyFields;
};

export const JWT = {
  sign: (id: any, expiresInParam?: StringValue) => {
    const expiresIn = expiresInParam ?? "7d";
		return jwt.sign({ id }, JWT_SECRET, { expiresIn });
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

export const checkPayment = async (txHash: string) => {
	const provider = new ethers.JsonRpcProvider("https://rpc.intuition.systems");

	const feeInterface = new ethers.Interface(["event FeePaid(uint256 totalCampaigns)"]);

	const receipt = await provider.getTransactionReceipt(txHash);
	if (!receipt || receipt.status !== 1) {
		throw new Error("Transaction failed");
	}

	const FEE_CONTRACT = network === "testnet" ? "0x742ed23dD10686C22A5cD459Af96BC1F83e58C7a" : "";

	let totalCampaigns: number = 0;

	// Check logs
	for (const log of receipt.logs) {
		if (log.address.toLowerCase() !== FEE_CONTRACT.toLowerCase()) continue;

    const parsed = feeInterface.parseLog(log);

		if (parsed?.name === "FeePaid") {
			totalCampaigns = parsed.args.totalCampaigns ?? 0;
		}
	}

	return totalCampaigns;
}
