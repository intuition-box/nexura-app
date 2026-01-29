import logger from "@/config/logger";
import { campaign, campaignCompleted } from "@/models/campaign.model";
import { campaignQuest, ecosystemQuest, miniQuest, quest } from "@/models/quests.model";
import {
	campaignQuestCompleted,
	ecosystemQuestCompleted,
	miniQuestCompleted,
	questCompleted,
} from "@/models/questsCompleted.models";
import { user } from "@/models/user.model";
import { submission } from "@/models/submission.model";
import { referredUsers } from "@/models/referrer.model";
import { performIntuitionOnchainAction } from "@/utils/account";
import {
	INTERNAL_SERVER_ERROR,
	OK,
	BAD_REQUEST,
	FORBIDDEN,
	NOT_FOUND,
	CREATED,
} from "@/utils/status.utils";
import {
	validateCampaignQuestData,
	padNumber,
	validateEcosystemQuestData,
	validateMiniQuestData,
	updateLevel
} from "@/utils/utils";
import mongoose from "mongoose";
import { bannedUser } from "@/models/bannedUser.model";

// todo: add ecosystem completed to eco quests
export const fetchEcosystemDapps = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const ecosystemQuests = await ecosystemQuest.find();
		const ecosystemQuestsCompleted = await ecosystemQuestCompleted.find({
			user: req.id,
		});

		const mergedEcosystemQuests: any[] = [];

		for (const ecoQuest of ecosystemQuests) {
			const ecoQuestCompleted = ecosystemQuestsCompleted.find(
				(completedEcoQuest) =>
					completedEcoQuest.ecosystemQuest?.toString() === ecoQuest._id.toString()
			);

			const mergedEcoQuest: Record<any, unknown> = ecoQuest.toJSON();

			mergedEcoQuest.done = ecoQuestCompleted ? ecoQuestCompleted.done : false;

			mergedEcosystemQuests.push(mergedEcoQuest);
		}

		res.status(OK).json({ message: "quests fetched!", ecosystemQuests: mergedEcosystemQuests });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching quests" });
	}
};

export const fetchQuests = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const allQuests = await quest.find();
		const completedQuests = await questCompleted.find({
			user: new mongoose.Types.ObjectId(req.id),
		});

		const oneTimeQuestsInDB = allQuests.filter(
			(quest) => quest.category === "one-time"
		);

		const oneTimeQuests: any[] = [];

		for (const oneTimeQuest of oneTimeQuestsInDB) {
			const oneTimeQuestCompleted = completedQuests.find(
				(completedQuest) => completedQuest.quest?.toString() === oneTimeQuest._id.toString()
			);

			const mergedQuest: Record<any, unknown> = oneTimeQuest.toJSON();

			mergedQuest.done = oneTimeQuestCompleted ? oneTimeQuestCompleted.done : false;

			oneTimeQuests.push(mergedQuest);
		}

		const weeklyQuestsInDB = allQuests.filter(
			(quest) => quest.category === "weekly"
		);

		const weeklyQuests: any[] = [];

		for (const weeklyQuest of weeklyQuestsInDB) {
			const weeklyQuestCompleted = completedQuests.find(
				(completedQuest) => completedQuest.quest?.toString() === weeklyQuest._id.toString()
			);

			const mergedQuest: Record<any, unknown> = weeklyQuest.toJSON();

			mergedQuest.done = weeklyQuestCompleted ? weeklyQuestCompleted.done : false;

			weeklyQuests.push(mergedQuest);
		}

		res
			.status(OK)
			.json({ message: "quests fetched!", oneTimeQuests, weeklyQuests });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching quests" });
	}
};

export const fetchMiniQuests = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const id = req.query.id as string;
		
		const mainQuest = await quest.findById(id);
		if (!mainQuest) {
			res.status(BAD_REQUEST).json({ error: "quest doesn't exist or in invalid" });
			return;
		}

		const miniQuestsInDB = await miniQuest.find({ quest: id });

		const miniQuestsCompleted = await miniQuestCompleted.find({
			quest: id,
			user: req.id,
		});

		const miniQuests: any[] = [];

		for (const miniquest of miniQuestsInDB) {
			const miniquestCompleted = miniQuestsCompleted.find(
				(completedQuest) => completedQuest.miniQuest?.toString() === miniquest._id.toString()
			);

			const mergedQuest: Record<any, unknown> = miniquest.toJSON();

			mergedQuest.done = miniquestCompleted ? miniquestCompleted.done : false;
			mergedQuest.status = miniquestCompleted ? miniquestCompleted.status : "";

			miniQuests.push(mergedQuest);
		}

		const mainQuestCompleted = await questCompleted.findOne({ user: req.id, quest: id });

		const questNumber = padNumber(mainQuest.questNumber!);

		res.status(OK).json({ message: "mini quests fetched", miniQuests, questCompleted: mainQuestCompleted?.done, totalXp: mainQuest.reward, questNumber, sub_title: mainQuest?.sub_title, title: mainQuest.title });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching mini quests" });
	}
};

export const fetchCampaignQuests = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const id = req.query.id as string;
		const userId = req.id!;

		const currentCampaign = await campaign.findById(id);
		if (!currentCampaign) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}

		const quests = await campaignQuest.find({ campaign: id });

		const campaignQuestsCompleted = await campaignQuestCompleted.find({
			user: userId,
			campaign: id
		});

		const completedCampaign = await campaignCompleted.findOne({
			user: userId,
			campaign: id,
		});

		const campaignQuests: any[] = [];

		for (const campaign_quest of quests) {
			const campaign_questCompleted = campaignQuestsCompleted.find(
				(completedCampaignQuest) =>
					completedCampaignQuest.campaignQuest?.toString() === campaign_quest._id.toString()
			);

			const mergedCampaignQuest: Record<any, unknown> = campaign_quest.toJSON();

			mergedCampaignQuest.done = campaign_questCompleted ? campaign_questCompleted.done : false;
			mergedCampaignQuest.status = campaign_questCompleted ? campaign_questCompleted.status : "";
			
			campaignQuests.push(mergedCampaignQuest);
		}

		const joined = completedCampaign ? true : false;

		if (currentCampaign.noOfQuests === campaignQuestsCompleted.length && !completedCampaign?.questsCompleted) {
			if (currentCampaign.trustClaimed < 4000) {
				await performIntuitionOnchainAction({
					action: "allow-claim",
					userId,
					contractAddress: currentCampaign.contractAddress!,
				});
			}

			completedCampaign!.questsCompleted = true;
			await completedCampaign!.save();
		}

		const campaignNumber = padNumber(currentCampaign.campaignNumber);

		res.status(OK).json({
			message: "quests fetched!",
			campaignQuests,
			campaignCompleted: completedCampaign,
			description: currentCampaign.description,
			address: currentCampaign?.contractAddress,
			title: currentCampaign.title,
			trustClaimed: currentCampaign.trustClaimed,
			reward: currentCampaign.reward,
			sub_title: currentCampaign.sub_title,
			projectCoverImage: currentCampaign.projectCoverImage,
			joined,
			campaignNumber,
		});
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error fetching quests for campaign" });
	}
};

export const createCampaignQuests = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const { success } = validateCampaignQuestData(req.body);
		if (!success) {
			res.status(BAD_REQUEST).json({
				error: "send the correct data required to create a campaign quest",
			});
			return;
		}

		const campaignToUpdate = await campaign.findById(req.body.campaign);
		if (!campaignToUpdate) {
			res
				.status(BAD_REQUEST)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}

		await campaignQuest.create(req.body);

		campaignToUpdate.noOfQuests += 1;
		await campaignToUpdate.save();

		res.status(CREATED).json({ message: "campaign quest created!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error creating campaign quest" });
	}
};

export const createMiniQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { success } = validateMiniQuestData(req.body);
		if (!success) {
			res.status(BAD_REQUEST).json({ error: "send the data required to create a mini quest" });
			return;
		}

		await miniQuest.create(req.body);

		res.status(CREATED).json({ message: "mini quest created" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating mini quest" });
	}
};

// todo: link ecosystem quest to project
export const createEcosystemQuests = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const { success } = validateEcosystemQuestData(req.body);
		if (!success) {
			res.status(BAD_REQUEST).json({
				error: "send the correct data required to create an ecosystem quest",
			});
			return;
		}

		await ecosystemQuest.create(req.body);

		res.status(CREATED).json({ message: "campaign quest created!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error creating ecosystem quest" });
	}
};

export const performCampaignQuest = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const { id, campaignId } = req.body;

		const campaignQuestk = await campaignQuest.findById(id);
		if (!campaignQuestk) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign quest is invalid" });
			return;
		}

		const campaignDone = await campaignQuestCompleted.findOne({
			user: req.id,
			campaignQuest: id,
		});
		if (!campaignDone) {
			res.status(NOT_FOUND).json({ error: "campaign quest has not been done" });
			return
		}

		if (campaignDone.status !== "pending") {
			res.status(BAD_REQUEST).json({ error: "quest needs to be marked as pending before it can be claimed" });
			return;
		}

		if (campaignDone.done === true) {
			res.status(FORBIDDEN).json({ error: "campaign quest already claimed" });
			return;
		}

		campaignDone.done = true;
		campaignDone.status = "done";

		res.status(OK).json({ message: "quest done" });

		// if (!campaignDone) {
		// 	res.status(FORBIDDEN).json({ message: "submit campaign task to proceed" });
		// 	return;
		// }

		// if (campaignDone.status !== "done") {
		// 	res
		// 		.status(FORBIDDEN)
		// 		.json({ error: "task not performed" });
		// 	return;
		// }

		// if (campaignDone.done) {
		// 	res
		// 		.status(FORBIDDEN)
		// 		.json({ error: "already performed campaign task" });
		// 	return;
		// }

		// campaignDone.done = true;
		// await campaignDone.save();

		// res.status(OK).json({ message: "campaign task done" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error performing campaign quest" });
	}
};

export const claimMiniQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { questId, id } = req.body;

		const mini_quest = await miniQuest.findById(id);
		if (!mini_quest) {
			res.status(NOT_FOUND).json({ error: "mini quest id is invalid" });
			return;
		}

		const mainQuest = await quest.findById(questId);
		if (!mainQuest) {
			res.status(NOT_FOUND).json({ error: "quest is invalid/doesn't exist" });
			return;
		}

		const claimer = await user.findById(req.id);
		if (!claimer) {
			res.status(NOT_FOUND).json({ error: "invalid user or user dos not exist" });
			return;
		}

		const miniQuestExists = await miniQuestCompleted.findOne({ miniQuest: id, user: req.id });
		if (!miniQuestExists) {
			res.status(NOT_FOUND).json({ error: "mini quest has not been validated" });
			return
		}

		if (miniQuestExists.status !== "pending") {
			res.status(BAD_REQUEST).json({ error: "quest needs to be marked as pending before it can be caimed" });
			return;
		}

		if (miniQuestExists.done === true) {
			res.status(FORBIDDEN).json({ error: "quest already claimed" });
			return;
		}

		miniQuestExists.done = true;
		miniQuestExists.status = "done";

		res.status(OK).json({ message: "quest done" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error claiming mini quest" });
	}
};

export const claimQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const id = req.query.id as string;

		if (!id) {
			res.status(BAD_REQUEST).json({ error: "send quest id" });
			return;
		}

		const questFound = await quest.findById(id);
		if (!questFound) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with quest is invalid" });
			return;
		}

		const questUser = await user.findById(req.id);
		if (!questUser) {
			res.status(NOT_FOUND).json({ error: "invalid user" });
			return;
		}

		const isQuestCompleted = await questCompleted.findOne({ quest: id, user: questUser._id });
		if (isQuestCompleted) {
			res.status(FORBIDDEN).json({ error: "quest already completed" });
			return;
		}

		questUser.questsCompleted += 1;

		questUser.xp += questFound.reward;

		const category = questFound.category;
		if (category != "one-time") {
			await questCompleted.create({
				done: true,
				quest: id,
				user: questUser._id,
				category,
				expires: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
			});
		} else {
			const completedMiniQuests = await miniQuestCompleted.find({ user: req.id, quest: id });
			if (questFound.noOfQuests !== completedMiniQuests.length) {
				res.status(FORBIDDEN).json({ error: "complete all the tasks to complete the quest" });
				return;
			}

			await questCompleted.create({
				done: true,
				quest: id,
				user: questUser._id,
				category,
			});
		}

		if (questUser.status !== "Active") {
			questUser.status = "Active";

			const userReferred = await referredUsers.findOne({ newUser: questUser._id });
			if (userReferred && userReferred.status !== "Active") {
				userReferred.status = "Active";
	
				await userReferred.save();
			}
		}

		const level = await updateLevel(questUser.xp, questUser.badges, questUser._id.toString());

		questUser.level = level;

		await questUser.save();

		res.status(OK).json({ message: "quest done!" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error claiming quest" });
	}
};

export const claimEcosystemQuest = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const id = req.query.id;

		const userId = req.id;

		const ecosystemQuestUser = await user.findById(userId);
		if (!ecosystemQuestUser) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with user is invalid" });
			return;
		}

		const ecosystemQuestFound = await ecosystemQuest.findById(id);
		if (!ecosystemQuestFound) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with ecosystem quest is invalid" });
			return;
		}

		const ecosystemQuestToClaim = await ecosystemQuestCompleted.findOne({
			user: userId,
			ecosystemQuest: id,
		});
		if (!ecosystemQuestToClaim) {
			res
				.status(FORBIDDEN)
				.json({ error: "visit ecosystem dapp to proceed" });
			return;
		}

		if (ecosystemQuestToClaim.done) {
			res
				.status(FORBIDDEN)
				.json({ error: "ecosystem quest has been completed" });
			return;
		} 

		const now = new Date();

		if (now < ecosystemQuestToClaim.timer) {
			res.status(FORBIDDEN).json({
				error:
					"this operation cannot be performed by the user until the required time is met",
			});
			return;
		}

		ecosystemQuestUser.xp += ecosystemQuestFound.reward;

		ecosystemQuestToClaim.done = true;

		const level = await updateLevel(ecosystemQuestUser.xp, ecosystemQuestUser.badges, ecosystemQuestUser._id.toString());

		ecosystemQuestUser.level = level;

		await ecosystemQuestToClaim.save();
		await ecosystemQuestUser.save();

		res.status(OK).json({ message: "ecosystem quest claimed" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error claiming ecosystem quest" });
	}
};

export const setTimer = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const id = req.query.id;

		const questForEcosystem = await ecosystemQuest.findById(id);
		if (!questForEcosystem) {
			res
				.status(NOT_FOUND)
				.json({ error: "invalid id associated with ecosystem quest" });
			return;
		}

		const now = new Date();

		const timer = new Date(now.getTime() + 1 * 60 * 1000);

		const ecoQuest = await ecosystemQuestCompleted.findOne({
			user: req.id,
			ecosystemQuest: id,
		});

		if (!ecoQuest) {
			await ecosystemQuestCompleted.create({
				done: false,
				timer,
				ecosystemQuest: id,
				user: req.id,
			});

			res.status(OK).json({ message: "timer set" });
			return;
		}

		res.status(OK).json({ message: "timer already set" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error setting timer" });
	}
};

// for quests requiring input submission for validation before quest completion
export const submitQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const userId = req.id;

		const { submissionLink, questId, page, id, tag } = req.body;
		if (!submissionLink || !questId || !page || !id || !tag) {
			res.status(BAD_REQUEST).json({ error: "send required details" });
			return;
		}

		const userExists = await user.findById(userId);
		if (!userExists) {
			res.status(NOT_FOUND).json({ error: "id is invalid or does not exists" });
			return;
		}

		if (!userExists.socialProfiles?.x) {
			res.status(BAD_REQUEST).json({ error: "user x profile not linked" });
			return;
		}

		let notComplete;

		const submissionExists = await submission.findOne({ miniQuestId: id, user: userId, page });
		if (submissionExists) {
			res.status(BAD_REQUEST).json({ error: "quest already submitted" });
			return;
		}

		let questExists;

		if (page !== "campaign") {
			questExists = await miniQuest.findById(id);
			if (!questExists) {
				res.status(BAD_REQUEST).json({ error: "mini quest id is invalid" });
				return;
			}
			notComplete = await miniQuestCompleted.create({ miniQuest: id, quest: questId, user: userId });
		} else {
			questExists = await campaignQuest.findById(id);
			if (!questExists) {
				res.status(BAD_REQUEST).json({ error: "campaign quest id is invalid" });
				return;
			}
			notComplete = await campaignQuestCompleted.create({ campaign: questId, campaignQuest: id, user: userId });
		}

		await submission.create({ submissionLink, taskType: tag, username: userExists.socialProfiles?.x?.username, miniQuestId: id, user: userId, page, questCompleted: notComplete._id });

		res.status(OK).json({ message: "quest submitted" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error submitting quest" });
	}
};
