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
import { hub } from "@/models/hub.model";

const DISCORD_CAMPAIGN_TAGS = new Set([
	"join",
	"message",
	"join-discord",
	"message-discord",
	"acquire-role-discord",
	"send-message-discord",
]);

const PROOF_REQUIRED_CAMPAIGN_TAGS = new Set([
	"comment",
	"comment-x",
	"follow",
	"follow-x",
	"repost-x",
	"feedback",
	"create-post",
]);

// todo: add ecosystem completed to eco quests
export const fetchEcosystemDapps = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const ecosystemQuests = await ecosystemQuest.find().lean();
		const ecosystemQuestsCompleted = await ecosystemQuestCompleted.find({
			user: req.id,
		}).lean();

		const mergedEcosystemQuests: any[] = [];

		for (const ecoQuest of ecosystemQuests) {
			const ecoQuestCompleted = ecosystemQuestsCompleted.find(
				(completedEcoQuest) =>
					completedEcoQuest.ecosystemQuest?.toString() === ecoQuest._id.toString()
			);

			const mergedEcoQuest: Record<any, unknown> = ecoQuest;

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
		const allQuests = await quest.find().lean();
		const completedQuests = await questCompleted.find({
			user: new mongoose.Types.ObjectId(req.id),
		}).lean();

		const oneTimeQuestsInDB = allQuests.filter(
			(quest) => quest.category === "one-time"
		);

		const oneTimeQuests: any[] = [];

		for (const oneTimeQuest of oneTimeQuestsInDB) {
			const oneTimeQuestCompleted = completedQuests.find(
				(completedQuest) => completedQuest.quest?.toString() === oneTimeQuest._id.toString()
			);

			const mergedQuest: Record<any, unknown> = oneTimeQuest;

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

			const mergedQuest: Record<any, unknown> = weeklyQuest;

			mergedQuest.done = weeklyQuestCompleted ? weeklyQuestCompleted.done : false;
			mergedQuest.joined = !!weeklyQuestCompleted;

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

		const mainQuest = await quest.findById(id).lean();
		if (!mainQuest) {
			res.status(BAD_REQUEST).json({ error: "quest doesn't exist or in invalid" });
			return;
		}

		const miniQuestsInDB = await miniQuest.find({ quest: id }).lean();

		const miniQuestsCompleted = await miniQuestCompleted.find({
			quest: id,
			user: req.id,
		});

		const miniQuests: any[] = [];

		for (const miniquest of miniQuestsInDB) {
			const miniquestCompleted = miniQuestsCompleted.find(
				(completedQuest) => completedQuest.miniQuest?.toString() === miniquest._id.toString()
			);

			const mergedQuest: Record<any, unknown> = miniquest;

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

export const startQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const id = req.query.id as string;
		const { category, questId } = req.body;

		const questStarted = await questCompleted.exists({ quest: questId, user: req.id });
		if (questStarted) {
			res.status(BAD_REQUEST).json({ error: "quest already started" });
			return;
		}

		await questCompleted.create({ quest: questId, user: req.id, done: false, category });

		res.status(OK).json({ message: "quest started" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error starting quest" });
	}
}

export const fetchCampaignQuests = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const id = req.query.id as string;
		const userId = req.id!;

		const currentCampaign = await campaign.findById(id).lean();
		if (!currentCampaign) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}

		const currentHub = await hub.findById(currentCampaign.hub).lean();
		const hubInfo = {
			id: currentHub?._id?.toString?.() ?? "",
			name: currentHub?.name ?? currentCampaign.project_name ?? "",
			description: currentHub?.description ?? "",
			logo: currentHub?.logo ?? currentCampaign.project_image ?? "",
			website: currentHub?.website ?? "",
			xAccount: currentHub?.xAccount ?? "",
			discordServer: currentHub?.discordServer ?? "",
		};

		const quests = await campaignQuest.find({ campaign: id }).lean();

		const campaignQuestsCompleted = await campaignQuestCompleted.find({
			user: userId,
			campaign: id,
		}).lean();

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

			const mergedCampaignQuest: Record<any, unknown> = campaign_quest;

			mergedCampaignQuest.done = campaign_questCompleted ? campaign_questCompleted.done : false;
			mergedCampaignQuest.status = campaign_questCompleted ? campaign_questCompleted.status : "";

			campaignQuests.push(mergedCampaignQuest);
		}

		const joined = completedCampaign ? true : false;

		const campaignQuestsMarkedAsDone = campaignQuestsCompleted.filter((c_q: { done: boolean }) => c_q.done === true);

		if (currentCampaign.noOfQuests === campaignQuestsMarkedAsDone.length && completedCampaign && !completedCampaign.questsCompleted) {
			if (currentCampaign.trustClaimed < currentCampaign.totalTrustAvailable && currentCampaign.contractAddress) {
				await performIntuitionOnchainAction({
					action: "allow-claim",
					userId,
					contractAddress: currentCampaign.contractAddress,
				});
			}

			completedCampaign.questsCompleted = true;
			await completedCampaign.save();
		}

		const campaignNumber = padNumber(currentCampaign.campaignNumber);

		res.status(OK).json({
			message: "quests fetched!",
			campaignQuests,
			campaignCompleted: completedCampaign,
			hub: currentCampaign.hub,
			description: currentCampaign.description,
			address: currentCampaign?.contractAddress,
			title: currentCampaign.title,
			trustClaimed: currentCampaign.trustClaimed,
			reward: currentCampaign.reward,
			totalTrustAvailable: currentCampaign.totalTrustAvailable,
			maxParticipants: (currentCampaign as any).maxParticipants ?? currentCampaign.participants,
			project_name: currentCampaign.project_name,
			project_image: currentCampaign.project_image,
			hubDescription: currentHub?.description ?? "",
			hubInfo,
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

// todo: link ecosystem quest to hub
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

		const campaignQuestk = await campaignQuest.findById(id).lean();
		if (!campaignQuestk) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign quest is invalid" });
			return;
		}

		const normalizedTag = String(campaignQuestk.tag ?? "").trim().toLowerCase();
		const isDiscordQuest = DISCORD_CAMPAIGN_TAGS.has(normalizedTag);
		const requiresProof = PROOF_REQUIRED_CAMPAIGN_TAGS.has(normalizedTag);
		const normalizedCampaignId = String(campaignId ?? campaignQuestk.campaign ?? "").trim();

		let campaignDone = await campaignQuestCompleted.findOne({
			user: req.id,
			campaignQuest: id,
		});

		const failDiscordCompletion = async (errorMessage: string) => {
			if (campaignDone && campaignDone.done !== true) {
				campaignDone.status = "retry";
				await campaignDone.save();
			}

			res.status(FORBIDDEN).json({ error: errorMessage });
		};

		if (isDiscordQuest) {
			if (!normalizedCampaignId) {
				res.status(BAD_REQUEST).json({ error: "campaign id is required for discord task completion" });
				return;
			}

			const relatedCampaign = await campaign.findById(normalizedCampaignId).select("hub").lean();
			if (!relatedCampaign?.hub) {
				res.status(NOT_FOUND).json({ error: "campaign project not found for this discord task" });
				return;
			}

			const studioHub = await hub.findById(relatedCampaign.hub).select("discordConnected guildId").lean();
			const studioGuildId = String(studioHub?.guildId ?? "").trim();
			const questGuildId = String(campaignQuestk.guildId ?? "").trim();

			if (!studioHub?.discordConnected || !studioGuildId) {
				await failDiscordCompletion(
					"this project's Discord connection is not active in Studio. The campaign team needs to reconnect Discord before Discord tasks can be completed."
				);
				return;
			}

			if (questGuildId && studioGuildId !== questGuildId) {
				await failDiscordCompletion(
					"this campaign's Discord setup no longer matches the project's active Studio Discord connection."
				);
				return;
			}
		}

		if (!campaignDone) {
			if (isDiscordQuest) {
				res.status(FORBIDDEN).json({ error: "discord tasks must be verified before they can be completed" });
				return;
			}

			if (requiresProof) {
				res.status(FORBIDDEN).json({ error: "this task requires a submission for review before it can be completed" });
				return;
			}

			// Auto-create completion record for tasks that skip the submit step
			// (e.g. X follow/comment where verification is deferred)
			campaignDone = await campaignQuestCompleted.create({
				campaign: normalizedCampaignId,
				campaignQuest: id,
				user: req.id,
				done: true,
				status: "done",
			});
			res.status(OK).json({ message: "quest done" });
			return;
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

		await campaignDone.save();

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

		const mini_quest = await miniQuest.findById(id).lean();
		if (!mini_quest) {
			res.status(NOT_FOUND).json({ error: "mini quest id is invalid" });
			return;
		}

		const mainQuest = await quest.findById(questId).lean();
		if (!mainQuest) {
			res.status(NOT_FOUND).json({ error: "quest is invalid/doesn't exist" });
			return;
		}

		const claimer = await user.findById(req.id).lean();
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

		const questFound = await quest.findById(id).lean();
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

		const isQuestCompleted = await questCompleted.findOne({ quest: id, user: questUser._id }).lean();
		if (!isQuestCompleted) {
			res.status(FORBIDDEN).json({ error: "quest has not been started" });
			return;
		}

		if (isQuestCompleted.done) {
			res.status(FORBIDDEN).json({ error: "quest already claimed" });
			return;
		}

		questUser.questsCompleted += 1;

		questUser.xp += questFound.reward;

		await questCompleted.updateOne({ quest: id, user: questUser._id }, { expires: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), done: true });

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

		const ecosystemQuestFound = await ecosystemQuest.findById(id).lean();
		if (!ecosystemQuestFound) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with ecosystem quest is invalid" });
			return;
		}

		let ecosystemQuestToClaim = await ecosystemQuestCompleted.findOne({
			user: userId,
			ecosystemQuest: id,
		});

		if (ecosystemQuestToClaim?.done) {
			res
				.status(FORBIDDEN)
				.json({ error: "ecosystem quest has been completed" });
			return;
		}

		if (!ecosystemQuestToClaim) {
			ecosystemQuestToClaim = await ecosystemQuestCompleted.create({
				done: false,
				timer: new Date(),
				ecosystemQuest: id,
				user: userId,
			});
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

		const questForEcosystem = await ecosystemQuest.findById(id).lean();
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

		// Destructure as hubId to avoid collision with the "hub" model import
		const { submissionLink, questId, page, id, tag, hub: hubId } = req.body;
		if (!submissionLink || !questId || !page || !id || !tag) {
			res.status(BAD_REQUEST).json({ error: "send required details" });
			return;
		}

		const userExists = await user.findById(userId).lean();
		if (!userExists) {
			res.status(NOT_FOUND).json({ error: "id is invalid or does not exists" });
			return;
		}

		if (!userExists.socialProfiles?.x) {
			res.status(BAD_REQUEST).json({ error: "user x profile not linked" });
			return;
    }
		
    if (hubId) {
  		const hubExists = await hub.findById(hubId);
  		if (!hubExists) {
  			res.status(BAD_REQUEST).json({ error: "hub does not exist" });
  			return;
  		}
    }

		let notComplete;

		const submissionExists = await submission.findOne({ miniQuestId: id, user: userId, page, hub: hubId }).lean();
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

		await submission.create({ submissionLink, hub: hubId ?? "nexura-hub", taskType: tag, address: userExists.address, username: userExists.socialProfiles?.x?.username, miniQuestId: id, user: userId, page, questCompleted: notComplete._id });

		res.status(OK).json({ message: "quest submitted" });
	} catch (error: any) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: error?.message || "error submitting quest" });
	}
};
