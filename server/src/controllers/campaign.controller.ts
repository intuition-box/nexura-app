import mongoose from "mongoose";
import logger from "@/config/logger";
import { campaign, campaignCompleted } from "@/models/campaign.model";
import { project } from "@/models/project.model";
import { referredUsers } from "@/models/referrer.model";
import { user } from "@/models/user.model";
import { performIntuitionOnchainAction } from "@/utils/account";
import { uploadImg } from "@/utils/img.utils";
import {
	OK,
	INTERNAL_SERVER_ERROR,
	CREATED,
	BAD_REQUEST,
	NOT_FOUND,
	FORBIDDEN,
	UNAUTHORIZED,
} from "@/utils/status.utils";
import { validateCampaignData, updateLevel, checkPayment } from "@/utils/utils";
import { campaignQuest } from "@/models/quests.model";

interface IReward {
	xp: number;
	trustTokens: number;
	pool: number;
}

interface ICreateCampaign {
	project_name: string;
	reward: IReward;
	starts_at: Date;
	project_image: string;
	projectCoverImage: string;
	creator: string;
	ends_at: Date;
	title: string;
	description: string;
}

export const fetchCampaigns = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const campaigns = await campaign.find().lean();

		const joinedCampaigns = await campaignCompleted.find({ user: req.id }).lean();

		const mergedCampaigns: any[] = [];

		for (const c of campaigns) {
			const joined = joinedCampaigns.find((j) => j.campaign?.toString() === c._id.toString());

			const mergedJoinedCampaign: Record<any, unknown> = c;

			mergedJoinedCampaign.joined = joined ? true : false;

			mergedCampaigns.push(mergedJoinedCampaign);
		}

		res.status(OK).json({ message: "campaigns fetched!", campaigns: mergedCampaigns });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error fetching campaigns" });
	}
};

export const createCampaign = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const requestData: ICreateCampaign = req.body;
		const coverImageAsFile = req.file?.buffer;

		const projectUserId = req.id;

		const txHash = req.body.txHash;
		if (!txHash) {
			res.status(BAD_REQUEST).json({ error: "transaction hash is required" });
			return;
		}

		const campaignNo = await checkPayment(txHash);
		if (!campaignNo) {
			res
				.status(FORBIDDEN)
				.json({ error: "kindly pay the require amount (1000 TRUST) to proceed" });
			return;
		}

		const campaignCreator = await project.findById(projectUserId);
		if (!campaignCreator) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with user is invalid" });
			return;
		}

		if (campaignCreator.campaignsCreated >= campaignNo) {
			res.status(FORBIDDEN).json({ error: "kindly pay the required amount (1000 TRUST) to proceed" });
			return;
		}

		const xpAllocated = campaignCreator.xpAllocated;
		if (xpAllocated === 0) {
			res
				.status(FORBIDDEN)
				.json({ error: "contact nexura team to recieve xp allocation" });
			return;
		}

		const { success } = validateCampaignData(requestData);
		if (!success) {
			res
				.status(BAD_REQUEST)
				.json({ error: "send the correct data required to create a campaign" });
			return;
		}

		if (!coverImageAsFile) {
			res
				.status(BAD_REQUEST)
				.json({ error: "project cover image is required" });
			return;
		}

		const projectCoverImageUrl = await uploadImg({
			file: coverImageAsFile,
			filename: req.file?.originalname as string,
			folder: "campaigns",
			maxSize: 2 * 1024 ** 2, // 2 MB
		});

		const ends_at = new Date(requestData.ends_at);

		requestData.ends_at = ends_at;

		requestData.creator = projectUserId as string;

		requestData.projectCoverImage = projectCoverImageUrl;

		requestData.project_image = campaignCreator.logo;

		const newCampaign = new campaign(requestData);

		newCampaign.totalXpAvailable = xpAllocated;

		campaignCreator.campaignsCreated += 1;
		campaignCreator.xpAllocated = 0;

		const campaignQuestsFromBody = req.body.campaignQuests as Record<string, any>[];

		const manyData: any[] = [];

		if (campaignQuestsFromBody.length > 0) {
			for (const quest of campaignQuestsFromBody) {
				quest.campaign = newCampaign._id;

				manyData.push(quest);
			}

			await campaignQuest.insertMany(manyData);
		}

		newCampaign.noOfQuests = campaignQuestsFromBody.length;

		await newCampaign.save();
		await campaignCreator.save();

		res.status(CREATED).json({ message: "campaign created!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error creating campaign!" });
	}
};

export const addCampaignAddress = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const { id, contractAddress }: { id: string; contractAddress: string } =
			req.body;

			if (!mongoose.Types.ObjectId.isValid(id)) {
				res.status(BAD_REQUEST).json({ error: "Invalid campaign ID" });
				return;
			}

		const foundCampaign = await campaign.findById(id);
		if (!foundCampaign) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}

		foundCampaign.contractAddress = contractAddress;

		await foundCampaign.save();

		res.status(OK).json({ message: "campaign address added!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error adding campaign address!" });
	}
};

export const joinCampaign = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const id = req.query.id;

		if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
			return res.status(BAD_REQUEST).json({
				error: "Invalid campaign ID",
			});
    }

		const userId = req.id;
		if (!userId) {
			res.status(UNAUTHORIZED).json({ error: "kindly login or sign up" });
			return;
		}

		const campaignToJoin = await campaign.findById(id);
		if (!campaignToJoin) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}

		const completedCampaign = await campaignCompleted.findOne({
			user: userId,
			campaign: id,
		});
		if (!completedCampaign) {
			const joined = new campaignCompleted({ user: userId, campaign: id });

			campaignToJoin.participants += 1;

			if (campaignToJoin.trustClaimed < campaignToJoin.totalTrustAvailable) {
				await performIntuitionOnchainAction({
					action: "join",
					userId,
					contractAddress: campaignToJoin.contractAddress!,
				});
			}

			await campaignToJoin.save();
			await joined.save();

			res.status(OK).json({ message: "campaign joined" });
			return;
		}

		res.status(BAD_REQUEST).json({ error: "already joined campaign" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error joining campaign!" });
	}
};

export const updateCampaign = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		// todo: get logo and project cover image

		const { id } = req.body;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid campaign ID" });
		}

		const campaignUpdateData: Record<string, unknown> = {};

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(BAD_REQUEST).json({
				error: "Invalid campaign ID",
			});
		}

		for (const field of ["description", "title", "ends_at", "reward"]) {
			const value = req.body[field];
			if (field !== "ends_at") {
				campaignUpdateData[field] = value;
			} else {
				const ends_at = new Date(value);
				campaignUpdateData[field] = ends_at;
			}
		}

		if (Object.keys(campaignUpdateData).length === 0) {
			res
				.status(BAD_REQUEST)
				.json({ error: "No valid fields provided for update" });
			return;
		}

		await campaign.findByIdAndUpdate(id, campaignUpdateData);

		res.status(OK).json({ message: "campaign updated!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error updating campaign!" });
	}
};

export const closeCampaign = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const id = req.query.id as string;

		if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid campaign ID" });
}

		const foundCampaign = await campaign.findById(id);
		if (!foundCampaign) {
			res.status(NOT_FOUND).json({ error: "campaign id is invalid" });
			return;
		}

		if (foundCampaign.status === "Ended") {
			res.status(FORBIDDEN).json({ error: "campaign has already ended" });
			return;
		}

		foundCampaign.status = "Ended";
		await foundCampaign.save();

		res.status(OK).json({ message: "campaign closed!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error closing campaign!" });
	}
};

export const claimCampaignRewards = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const campaignId = req.query.id as string;

		const userToReward = await user.findById(req.id);
		if (!userToReward) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with user is invalid" });
			return;
		}

		const campaignToClaimRewards = await campaign.findById(campaignId);
		if (!campaignToClaimRewards) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}

		const completedCampaign = await campaignCompleted.findOne({
			campaign: campaignId,
			user: req.id
		});

		if (!completedCampaign?.questsCompleted) {
			res.status(FORBIDDEN).json({
				error: "all quests must be completed before rewards can be claimed",
			});
			return;
		}

		if (completedCampaign.campaignCompleted) {
			res.status(FORBIDDEN).json({ error: "campaign reward has been claimed" });
			return;
		}

		if (userToReward.status !== "Active") {
			userToReward.status = "Active";

			const userReferred = await referredUsers.findOne({ newUser: userToReward._id });
			if (userReferred && userReferred.status !== "Active") {
				userReferred.status = "Active";
	
				await userReferred.save();
			}
		}

		const xp = campaignToClaimRewards.reward?.xp as number;
		const trustTokens = campaignToClaimRewards.reward?.trustTokens ?? 0;

		if (campaignToClaimRewards.trustClaimed < campaignToClaimRewards.totalTrustAvailable) {
			userToReward.trustEarned += trustTokens;
			campaignToClaimRewards.trustClaimed += trustTokens;
		}

		userToReward.xp += xp;
		userToReward.campaignsCompleted += 1;

		campaignToClaimRewards.xpClaimed += xp;

		completedCampaign.campaignCompleted = true;

		const level = await updateLevel(userToReward.xp, userToReward.badges, userToReward._id.toString());
		
		userToReward.level = level;

		await completedCampaign.save();
		await campaignToClaimRewards.save();
		await userToReward.save();

		res.status(OK).json({ message: "campaign completed" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error claiming campaign quest" });
	}
};
