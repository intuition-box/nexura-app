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
import { performIntuitionOnchainAction } from "@/utils/account";
import {
	INTERNAL_SERVER_ERROR,
	OK,
	BAD_REQUEST,
	FORBIDDEN,
	NOT_FOUND,
	CREATED,
} from "@/utils/status.utils";
import { validateCampaignQuestData, padNumber, validateEcosystemQuestData, validateMiniQuestData } from "@/utils/utils";
import mongoose from "mongoose";

// todo: add ecosystem completed to eco quests
export const fetchEcosystemDapps = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const ecosystemQuests = await ecosystemQuest.find();

		res.status(OK).json({ message: "quests fetched!", ecosystemQuests });
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

			if (oneTimeQuestCompleted) {
				mergedQuest.done = oneTimeQuestCompleted.done;
			} else {
				mergedQuest.done = false;
			}

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

			if (weeklyQuestCompleted) {
				mergedQuest.done = weeklyQuestCompleted.done;
			} else {
				mergedQuest.done = false;
			}

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
			quest: new mongoose.Types.ObjectId(id),
			user: new mongoose.Types.ObjectId(req.id),
		});

		const miniQuests: any[] = [];

		for (const miniquest of miniQuestsInDB) {
			const miniQuestCompleted = miniQuestsCompleted.find(
				(completedQuest) => completedQuest.miniQuest?.toString() === miniquest._id.toString()
			);

			const mergedQuest: Record<any, unknown> = miniquest.toJSON();

			if (miniQuestCompleted) {
				mergedQuest.done = miniQuestCompleted.done;
			} else {
				mergedQuest.done = false;
			}

			miniQuests.push(mergedQuest);
		}

		const questNumber = padNumber(mainQuest.questNumber!);

		res.status(OK).json({ message: "mini quests fetched", miniQuests, totalXp: mainQuest.reward, questNumber, sub_title: mainQuest?.sub_title, title: mainQuest.title });
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
			campaign: id,
		});

		const completedCampaign = await campaignCompleted.findOne({
			user: userId,
			campaign: id,
		});

		const campaignQuests: any[] = [];

		for (const quest of quests) {
			const questCompleted = campaignQuestsCompleted.find(
				(completedCampaignQuest) =>
					completedCampaignQuest.campaignQuest === quest._id
			);

			const mergedCampaignQuest: Record<any, unknown> = quest.toJSON();
			if (questCompleted) {
				mergedCampaignQuest.done = questCompleted.done;
			} else {
				mergedCampaignQuest.done = false;
			}

			campaignQuests.push(mergedCampaignQuest);
		}

		if (currentCampaign.noOfQuests === campaignQuestsCompleted.length) {

			await performIntuitionOnchainAction({
				action: "allow-claim",
				userId,
				contractAddress: currentCampaign.contractAddress!,
			});

			await campaignCompleted.create({ questsCompleted: true, campaign: id, user: userId });
		}

		const campaignNumber = padNumber(currentCampaign.campaignNumber);

		res.status(OK).json({
			message: "quests fetched!",
			campaignQuests,
			campaignCompleted: completedCampaign,
			description: currentCampaign.description,
			title: currentCampaign.title,
			reward: currentCampaign.reward,
			sub_title: currentCampaign.sub_title,
			project_name: currentCampaign.project_name,
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
		const id = req.query.id;

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
			// todo: validate quest to be sure user performed it
			await campaignQuestCompleted.create({
				done: true,
				user: req.id,
				CampaignQuest: id,
			});

			res.status(OK).json({ error: "campaign quest done!" });
			return;
		}

		res
			.status(FORBIDDEN)
			.json({ error: "already performed this campaign quest" });
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

		const miniQuestExists = await miniQuestCompleted.findOne({ miniQuest: id });
		if (!miniQuestExists) {
			await miniQuestCompleted.create({ done: true, miniQuest: id, quest: questId, user: req.id });

			res.status(OK).json({ message: "mini quest claimed" });
			return
		}

		res.status(FORBIDDEN).json({ error: "quest already claimed" });
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

		questUser.questsCompleted += 1;

		questUser.xp += questFound.reward;

		const category = questFound.category;
		if (category != "one-time") {
			await questCompleted.create({
				done: true,
				quest: id,
				user: questUser._id,
				category,
				expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
			});
		} else {
			await questCompleted.create({
				done: true,
				quest: id,
				user: questUser._id,
				category,
			});
		}

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
				.json({ error: "this operation cannot be performed" });
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

		ecosystemQuestUser.xp += ecosystemQuestFound.rewards?.xp as number;
		ecosystemQuestUser.trustEarned += ecosystemQuestFound.rewards
			?.trust as number;

		ecosystemQuestToClaim.done = true;

		await ecosystemQuestToClaim.save();
		await ecosystemQuestUser.save();

		res.status(OK).json({ message: "error claiming ecosystem quest" });
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

		const timer = new Date(now.getTime() + questForEcosystem.timer * 60 * 1000);

		await ecosystemQuestCompleted.create({
			done: false,
			timer,
			ecosystemQuest: id,
			user: req.id,
		});

		res.status(OK).json({ message: "timer set" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error setting timer" });
	}
};

// for quests requiring input submission for validation before quest completion
export const submitQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		res.status(OK).json({ message: "quest submitted" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error submitting quest" });
	}
};
