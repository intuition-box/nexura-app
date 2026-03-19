import logger from "@/config/logger";
import { campaign, campaignCompleted } from "@/models/campaign.model";
import { hub } from "@/models/hub.model";
import { referredUsers } from "@/models/referrer.model";
import { user } from "@/models/user.model";
import { getCampaignContractStartDate, performIntuitionOnchainAction } from "@/utils/account";
import { normalizeCampaignDateInput, normalizeCampaignDatesForResponse, parseCampaignDate } from "@/utils/campaignDates";
import { uploadImg } from "@/utils/img.utils";
import {
	OK,
	INTERNAL_SERVER_ERROR,
	CREATED,
	BAD_REQUEST,
	NOT_FOUND,
	FORBIDDEN,
	UNAUTHORIZED,
  NO_CONTENT,
} from "@/utils/status.utils";
import { validateCampaignData, updateLevel, checkPayment } from "@/utils/utils";
import { campaignQuest } from "@/models/quests.model";
import { ethers } from "ethers";

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

const DISCORD_CAMPAIGN_TAGS = new Set([
	"discord",
	"join",
	"join-discord",
	"message",
	"message-discord",
	"acquire-role-discord",
	"send-message-discord",
]);

const isDiscordCampaignTask = (task: Record<string, any>) =>
	DISCORD_CAMPAIGN_TAGS.has(String(task?.tag ?? "").trim()) || String(task?.category ?? "").trim() === "discord";

const hasDiscordTasksInCampaign = async (campaignId: string) => {
	const quests = await campaignQuest.find({ campaign: campaignId }).select("tag category").lean();
	return quests.some((quest: any) => isDiscordCampaignTask(quest));
};

const getCampaignDiscordGuildIds = async (campaignId: string) => {
	const quests = await campaignQuest.find({ campaign: campaignId }).select("guildId tag category").lean();
	return Array.from(
		new Set(
			quests
				.filter((quest: any) => isDiscordCampaignTask(quest))
				.map((quest: any) => String(quest.guildId ?? "").trim())
				.filter(Boolean)
		)
	);
};

const resolveCampaignDiscordLaunchGuildId = async (campaignDoc: any) => {
	const storedGuildId = String(campaignDoc?.discordLaunchGuildId ?? "").trim();
	if (storedGuildId) return storedGuildId;

	const guildIds = await getCampaignDiscordGuildIds(String(campaignDoc?._id ?? "").trim());
	return guildIds[0] ?? "";
};

const normalizeJoinCampaignError = (error: any) => {
	const messages = [
		typeof error?.shortMessage === "string" ? error.shortMessage : "",
		typeof error?.message === "string" ? error.message : "",
		typeof error?.cause?.shortMessage === "string" ? error.cause.shortMessage : "",
		typeof error?.cause?.message === "string" ? error.cause.message : "",
	]
		.map((value) => value.trim())
		.filter(Boolean);

	const combined = messages.join(" ");
	if (/future on-chain start date|rewards start later on-chain/i.test(combined)) {
		return "Rewards start later on-chain. An admin must update or redeploy the contract.";
	}
	if (/returned no data|address is not a contract|does not have the function/i.test(combined)) {
		return "Rewards contract is invalid. An admin must redeploy it.";
	}
	if (/campaign participant limit reached/i.test(combined)) {
		return "Campaign participant limit reached.";
	}
	if (/campaign has not started yet/i.test(combined)) {
		return "Campaign has not started yet.";
	}
	if (/campaign has ended/i.test(combined)) {
		return "Campaign has ended.";
	}
	if (/already joined campaign|already joined/i.test(combined)) {
		return "Already joined campaign.";
	}

	const firstMessage = messages[0] ?? "";
	if (firstMessage && firstMessage.length <= 120) {
		return firstMessage;
	}

	return "error joining campaign!";
};

const getTemporalCampaignStatus = (campaignDoc: {
	status?: string;
	deletedAt?: string | Date | null;
	starts_at?: string | Date;
	ends_at?: string | Date;
}) => {
	if (campaignDoc.deletedAt || campaignDoc.status === "Deleted") return "Deleted";
	if (campaignDoc.status === "Save") return "Save";
	if (campaignDoc.status === "Ended") return "Ended";

	const now = new Date();
	const startsAt = parseCampaignDate(campaignDoc.starts_at);
	const endsAt = parseCampaignDate(campaignDoc.ends_at);

	if (endsAt && endsAt <= now) return "Ended";
	if (startsAt && startsAt > now) return "Scheduled";
	return "Active";
};

export const fetchCampaigns = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		// Hide only studio drafts (status: "Save"). All other campaigns
		// (Active, Scheduled, Ended, deleted-for-studio, or legacy campaigns with no status field)
		// remain visible so non-studio campaigns are unaffected.
		const campaigns = await campaign
			.find({ status: { $ne: "Save" } })
			.populate({
				path: "hub",
				select: "name description logo website xAccount discordServer guildId",
			})
			.lean();
		const statusUpdates: Array<{ _id: unknown; status: string }> = [];
		const normalizedCampaigns = campaigns.map((c) => {
			const normalizedStatus = getTemporalCampaignStatus(c);
			const publicStatus = normalizedStatus === "Deleted" ? "Ended" : normalizedStatus;
			if (normalizedStatus !== c.status && normalizedStatus !== "Deleted") {
				statusUpdates.push({ _id: c._id, status: normalizedStatus });
			}
			const hubInfo = (c as any).hub && typeof (c as any).hub === "object"
				? {
					id: (c as any).hub._id?.toString?.() ?? "",
					name: (c as any).hub.name ?? c.project_name ?? "",
					description: (c as any).hub.description ?? "",
					logo: (c as any).hub.logo ?? c.project_image ?? "",
					website: (c as any).hub.website ?? "",
					xAccount: (c as any).hub.xAccount ?? "",
					discordServer: (c as any).hub.discordServer ?? "",
					guildId: (c as any).hub.guildId ?? "",
				}
				: {
					id: "",
					name: c.project_name ?? "",
					description: "",
					logo: c.project_image ?? "",
					website: "",
					xAccount: "",
					discordServer: "",
					guildId: "",
				};

			return normalizeCampaignDatesForResponse({ ...c, status: publicStatus, hubInfo });
		});

		if (statusUpdates.length > 0) {
			await campaign.bulkWrite(
				statusUpdates.map(({ _id, status }) => ({
					updateOne: {
						filter: { _id },
						update: { $set: { status } },
					},
				}))
			);
		}

		const joinedCampaigns = await campaignCompleted.find({ user: req.id }).lean();

		const mergedCampaigns: any[] = [];

		for (const c of normalizedCampaigns) {
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

		const hubUserId = req.admin.hub;

		const createdHub = await hub.findById(hubUserId);
		if (!createdHub) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with createdHub is invalid" });
			return;
		}

		const xpAllocated = createdHub.xpAllocated;
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
				.json({ error: "hub cover image is required" });
			return;
		}

		const projectCoverImageUrl = await uploadImg({
			file: coverImageAsFile,
			filename: req.file?.originalname as string,
			folder: "cover-images",
			maxSize: 2 * 1024 ** 2, // 2 MB
		});

		const startsAt = parseCampaignDate(requestData.starts_at);
		const endsAt = parseCampaignDate(requestData.ends_at);
		if (startsAt) requestData.starts_at = startsAt;
		if (endsAt) requestData.ends_at = endsAt;

		requestData.creator = hubUserId as string;

		requestData.projectCoverImage = projectCoverImageUrl;

		requestData.project_image = createdHub.logo;

		const newCampaign = new campaign(requestData);

    newCampaign.totalXpAvailable = xpAllocated;
		
    newCampaign.hub = createdHub._id;

		newCampaign.status = "Active";

		createdHub.campaignsCreated += 1;
		createdHub.xpAllocated = 0;

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
		await createdHub.save();

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
		const {
			id,
			contractAddress,
			deploymentTxHash,
			fundedAmount,
			rewardPerParticipant,
			maxClaimableParticipants,
			authorizedAddress,
		}: {
			id: string;
			contractAddress: string;
			deploymentTxHash?: string;
			fundedAmount?: number;
			rewardPerParticipant?: number;
			maxClaimableParticipants?: number;
			authorizedAddress?: string;
		} = req.body;

		if (!id) {
			res.status(BAD_REQUEST).json({ error: "send campaign ID" });
			return;
		}
		if (!contractAddress || !ethers.isAddress(contractAddress)) {
			res.status(BAD_REQUEST).json({ error: "send a valid campaign contract address" });
			return;
		}

		const foundCampaign = await campaign.findById(id);
		if (!foundCampaign) {
			res
				.status(NOT_FOUND)
				.json({ error: "id associated with campaign is invalid" });
			return;
		}
		if (foundCampaign.hub?.toString() !== req.admin.hub?.toString()) {
			res.status(FORBIDDEN).json({ error: "you are not allowed to update this campaign" });
			return;
		}

		foundCampaign.contractAddress = contractAddress;
		const existingRewardsDeployment = { ...((foundCampaign as any).rewardsDeployment?.toObject?.() ?? (foundCampaign as any).rewardsDeployment ?? {}) };
		if (deploymentTxHash) {
			(foundCampaign as any).rewardsDeployment = {
				...existingRewardsDeployment,
				txHash: deploymentTxHash,
				fundedAmount: Number(fundedAmount ?? foundCampaign.reward?.pool ?? 0),
				rewardPerParticipant: Number(rewardPerParticipant ?? foundCampaign.reward?.trustTokens ?? 0),
				maxClaimableParticipants: Number(maxClaimableParticipants ?? (foundCampaign as any).maxParticipants ?? 0),
				authorizedAddress: authorizedAddress ?? existingRewardsDeployment.authorizedAddress,
			};
		}
		if (Number.isFinite(Number(fundedAmount)) && Number(fundedAmount) >= 0) {
			const normalizedFundedAmount = Number(fundedAmount);
			foundCampaign.totalTrustAvailable = normalizedFundedAmount;
			foundCampaign.reward = {
				...(foundCampaign.reward ?? {}),
				xp: Number(foundCampaign.reward?.xp ?? 0),
				pool: normalizedFundedAmount,
				trustTokens: Number(rewardPerParticipant ?? foundCampaign.reward?.trustTokens ?? 0),
			} as any;
		}
		if (Number.isFinite(Number(maxClaimableParticipants)) && Number(maxClaimableParticipants) > 0) {
			(foundCampaign as any).maxParticipants = Number(maxClaimableParticipants);
		}

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

		if (!id) {
      res.status(BAD_REQUEST).json({ error: "send campaign id" });
      return
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
		if (campaignToJoin.status === "Save") {
			res.status(FORBIDDEN).json({ error: "campaign has not been published yet" });
			return;
		}

		const now = new Date();
		const startsAt = parseCampaignDate(campaignToJoin.starts_at);
		const endsAt = parseCampaignDate(campaignToJoin.ends_at);
		if (startsAt && startsAt > now) {
			res.status(FORBIDDEN).json({ error: "campaign has not started yet" });
			return;
		}
		if (campaignToJoin.status === "Ended" || (endsAt && endsAt <= now)) {
			res.status(FORBIDDEN).json({ error: "campaign has ended" });
			return;
		}

		const maxParticipants = Number((campaignToJoin as any).maxParticipants ?? 0);
		if (maxParticipants > 0 && campaignToJoin.participants >= maxParticipants) {
			res.status(FORBIDDEN).json({ error: "campaign participant limit reached" });
			return;
		}

		const completedCampaign = await campaignCompleted.findOne({
			user: userId,
			campaign: id,
		});
		if (!completedCampaign) {
			const joined = new campaignCompleted({ user: userId, campaign: id });

			campaignToJoin.participants += 1;

			if (
				campaignToJoin.trustClaimed < campaignToJoin.totalTrustAvailable &&
				campaignToJoin.contractAddress
			) {
				const onchainStartDate = await getCampaignContractStartDate(campaignToJoin.contractAddress);
				if (Number.isFinite(onchainStartDate) && onchainStartDate * 1000 > now.getTime()) {
					res.status(FORBIDDEN).json({
						error: "Rewards start later on-chain. An admin must update or redeploy the contract.",
					});
					return;
				}

				await performIntuitionOnchainAction({
					action: "join",
					userId,
					contractAddress: campaignToJoin.contractAddress,
				});
			}

			await campaignToJoin.save();
			await joined.save();

			res.status(OK).json({ message: "campaign joined" });
			return;
		}

		res.status(BAD_REQUEST).json({ error: "already joined campaign" });
	} catch (error: any) {
		logger.error(error);
		const message = normalizeJoinCampaignError(error);
		res
			.status(message === "error joining campaign!" ? INTERNAL_SERVER_ERROR : FORBIDDEN)
			.json({ error: message });
	}
};

export const updateCampaign = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {

		const { id } = req.query as { id: string };
		if (!id) {
      res.status(BAD_REQUEST).json({ error: "send campaign id" });
      return;
		}

		const existingCampaign = await campaign.findById(id);
		if (!existingCampaign) {
			res.status(NOT_FOUND).json({ error: "campaign not found" });
			return;
		}
		if (String(existingCampaign.hub) !== String(req.admin.hub)) {
			res.status(FORBIDDEN).json({ error: "you are not allowed to update this campaign" });
			return;
		}

		req.body.starts_at = normalizeCampaignDateInput(req.body.starts_at);
		req.body.ends_at = normalizeCampaignDateInput(req.body.ends_at);

    const campaignUpdateData: Record<string, unknown> = {};

    const coverImageBuffer = req.file?.buffer;

		if (req.body.projectCoverImage && coverImageBuffer) {
			// remove previous cover image
      req.body.coverImage = await uploadImg({
        file: coverImageBuffer,
        filename: req.file?.filename,
        folder: "cover-images",
        maxSize: 2 * 1024 ** 2
      });
		}

		for (const field of ["description", "title", "ends_at", "starts_at", "projectCoverImage", "reward", "maxParticipants"]) {
			const value = req.body[field];
			campaignUpdateData[field] = value;
		}

		if (typeof campaignUpdateData.reward === "string") {
			try {
				campaignUpdateData.reward = JSON.parse(campaignUpdateData.reward as string);
			} catch {
				// leave as-is and let downstream validation fail naturally
			}
		}
		if (campaignUpdateData.maxParticipants !== undefined) {
			campaignUpdateData.maxParticipants = Number(campaignUpdateData.maxParticipants ?? 0);
		}
		if (campaignUpdateData.reward && typeof campaignUpdateData.reward === "object") {
			const rewardUpdate = campaignUpdateData.reward as Record<string, unknown>;
			const pool = Number(rewardUpdate.pool ?? 0);
			const xp = Number(rewardUpdate.xp ?? 0);
			campaignUpdateData.reward = {
				xp,
				pool,
				trustTokens: Number(rewardUpdate.trust ?? rewardUpdate.trustTokens ?? 0),
			};
			campaignUpdateData.totalXpAvailable = xp;
			campaignUpdateData.totalTrustAvailable = pool;
		}

		if (campaignUpdateData.description !== undefined) {
			campaignUpdateData.sub_title = String(campaignUpdateData.description ?? "").trim();
		}

		if (Object.keys(campaignUpdateData).length === 0) {
			res
				.status(BAD_REQUEST)
				.json({ error: "No valid fields provided for update" });
			return;
		}

		const existingPool = Number(existingCampaign.reward?.pool ?? 0);
		const existingMaxParticipants = Number((existingCampaign as any).maxParticipants ?? existingCampaign.participants ?? 0);
		const existingStartsAt = parseCampaignDate(existingCampaign.starts_at);
		const existingEndsAt = parseCampaignDate(existingCampaign.ends_at);
		const incomingPool = campaignUpdateData.reward
			? Number((campaignUpdateData.reward as Record<string, unknown>).pool ?? existingPool)
			: existingPool;
		const incomingMaxParticipants = campaignUpdateData.maxParticipants !== undefined
			? Number(campaignUpdateData.maxParticipants ?? existingMaxParticipants)
			: existingMaxParticipants;
		const incomingEndsAt = campaignUpdateData.ends_at ? parseCampaignDate(campaignUpdateData.ends_at) : existingEndsAt;
		const rewardsContractSettled = Boolean((existingCampaign as any).rewardsDeployment?.remainderWithdrawalTxHash);
		const campaignHasStarted = existingStartsAt ? existingStartsAt.getTime() <= Date.now() : false;

		if (existingCampaign.status !== "Save" && existingCampaign.contractAddress && existingPool > 0) {
			if (
				rewardsContractSettled &&
				existingEndsAt &&
				incomingEndsAt &&
				incomingEndsAt.getTime() > existingEndsAt.getTime()
			) {
				res.status(BAD_REQUEST).json({
					error: "this rewards campaign cannot be extended because its remaining funds have already been withdrawn",
				});
				return;
			}

			if (campaignHasStarted) {
				if (incomingPool < existingPool) {
					res.status(BAD_REQUEST).json({ error: "reward pool cannot be reduced after publishing" });
					return;
				}
				if (incomingMaxParticipants < existingMaxParticipants) {
					res.status(BAD_REQUEST).json({ error: "participant limit cannot be reduced after publishing" });
					return;
				}
			}

		}

		const updated = await campaign.findByIdAndUpdate(id, campaignUpdateData, { new: true });

		// Recalculate status when dates change on a live/scheduled campaign
		if (updated && (updated.status === "Active" || updated.status === "Scheduled")) {
			const now = new Date();
			const startsAt = parseCampaignDate(updated.starts_at);
			const endsAt = parseCampaignDate(updated.ends_at);

			if (endsAt && endsAt <= now) {
				updated.status = "Ended";
			} else if (startsAt && startsAt > now) {
				updated.status = "Scheduled";
			} else {
				updated.status = "Active";
			}
			await updated.save();
		}

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

		if (!id) {
      res.status(BAD_REQUEST).json({ error: "send campaign id" });
      return;
    }

		const foundCampaign = await campaign.findById(id);
		if (!foundCampaign) {
			res.status(NOT_FOUND).json({ error: "campaign id is invalid" });
			return;
		}
		if (String(foundCampaign.hub) !== String(req.admin.hub)) {
			res.status(FORBIDDEN).json({ error: "you are not allowed to close this campaign" });
			return;
		}
		if (foundCampaign.status === "Save") {
			res.status(BAD_REQUEST).json({ error: "draft campaigns cannot be closed" });
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

export const recordCampaignRewardsWithdrawal = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		const {
			id,
			withdrawalTxHash,
			withdrawnAmount,
		}: {
			id: string;
			withdrawalTxHash?: string;
			withdrawnAmount?: number;
		} = req.body;

		if (!id) {
			res.status(BAD_REQUEST).json({ error: "send campaign ID" });
			return;
		}

		const foundCampaign = await campaign.findById(id);
		if (!foundCampaign) {
			res.status(NOT_FOUND).json({ error: "id associated with campaign is invalid" });
			return;
		}
		if (foundCampaign.hub?.toString() !== req.admin.hub?.toString()) {
			res.status(FORBIDDEN).json({ error: "you are not allowed to update this campaign" });
			return;
		}
		if (!foundCampaign.contractAddress || !ethers.isAddress(foundCampaign.contractAddress)) {
			res.status(BAD_REQUEST).json({ error: "campaign rewards contract is not configured" });
			return;
		}
		if (!withdrawalTxHash || !withdrawalTxHash.trim()) {
			res.status(BAD_REQUEST).json({ error: "send the rewards withdrawal transaction hash" });
			return;
		}

		const normalizedWithdrawnAmount = Number(withdrawnAmount ?? 0);
		if (!Number.isFinite(normalizedWithdrawnAmount) || normalizedWithdrawnAmount < 0) {
			res.status(BAD_REQUEST).json({ error: "send a valid withdrawn amount" });
			return;
		}

		const existingRewardsDeployment = { ...((foundCampaign as any).rewardsDeployment?.toObject?.() ?? (foundCampaign as any).rewardsDeployment ?? {}) };
		(foundCampaign as any).rewardsDeployment = {
			...existingRewardsDeployment,
			remainderWithdrawalTxHash: withdrawalTxHash.trim(),
			remainderWithdrawnAmount: normalizedWithdrawnAmount,
			remainderWithdrawnAt: new Date(),
		};

		if (foundCampaign.status !== "Ended") {
			foundCampaign.status = "Ended";
		}

		await foundCampaign.save();

		res.status(OK).json({ message: "campaign rewards withdrawal recorded" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error recording campaign rewards withdrawal" });
	}
};

export const reopenCampaign = async (
	req: GlobalRequest,
	res: GlobalResponse
) => {
	try {
		res.status(FORBIDDEN).json({ error: "closed or ended campaigns cannot be republished" });
		return;

		const id = req.query.id as string;
		if (!id) {
			res.status(BAD_REQUEST).json({ error: "send campaign id" });
			return;
		}

		const foundCampaign = await campaign.findById(id);
		if (!foundCampaign) {
			res.status(NOT_FOUND).json({ error: "campaign id is invalid" });
			return;
		}
		if (String(foundCampaign.hub) !== String(req.admin.hub)) {
			res.status(FORBIDDEN).json({ error: "you are not allowed to reopen this campaign" });
			return;
		}
		if (foundCampaign.status !== "Ended") {
			res.status(BAD_REQUEST).json({ error: "only ended campaigns can be reopened" });
			return;
		}

		const now = new Date();
		const startsAt = parseCampaignDate(foundCampaign.starts_at);
		const endsAt = parseCampaignDate(foundCampaign.ends_at);
		const rewardsContractSettled = Boolean((foundCampaign as any).rewardsDeployment?.remainderWithdrawalTxHash);

		if (endsAt && endsAt <= now) {
			res.status(FORBIDDEN).json({ error: "campaign end date has passed and it cannot be reopened" });
			return;
		}
		if (foundCampaign.contractAddress && Number(foundCampaign.reward?.pool ?? 0) > 0 && rewardsContractSettled) {
			res.status(BAD_REQUEST).json({
				error: "this rewards campaign cannot be reopened because its remaining funds have already been withdrawn",
			});
			return;
		}

		const lockedDiscordGuildId = await resolveCampaignDiscordLaunchGuildId(foundCampaign);
		if (lockedDiscordGuildId) {
			const currentHub = await hub.findById(req.admin.hub).select("discordConnected guildId").lean();
			const currentHubGuildId = String(currentHub?.guildId ?? "").trim();

			if (!currentHub?.discordConnected || currentHubGuildId !== lockedDiscordGuildId) {
				res.status(FORBIDDEN).json({
					error: "Reconnect the same Discord server that was used to launch this campaign before reopening it.",
				});
				return;
			}

			if (!String((foundCampaign as any).discordLaunchGuildId ?? "").trim()) {
				(foundCampaign as any).discordLaunchGuildId = lockedDiscordGuildId;
			}
		}

		foundCampaign.status = startsAt && startsAt > now ? "Scheduled" : "Active";
		await foundCampaign.save();

		res.status(OK).json({ message: "campaign reopened!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "error reopening campaign!" });
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

export const fetchHubCampaigns = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
		const hubCampaigns = await campaign.find({ hub: req.admin.hub, status: { $ne: "Deleted" }, deletedAt: null }).lean();
		const statusUpdates: Array<{ _id: unknown; status: string }> = [];
		const normalizedCampaigns = hubCampaigns.map((c) => {
			const normalizedStatus = getTemporalCampaignStatus(c);
			if (normalizedStatus !== c.status) {
				statusUpdates.push({ _id: c._id, status: normalizedStatus });
			}
			return normalizeCampaignDatesForResponse({ ...c, status: normalizedStatus });
		});

		if (statusUpdates.length > 0) {
			await campaign.bulkWrite(
				statusUpdates.map(({ _id, status }) => ({
					updateOne: {
						filter: { _id },
						update: { $set: { status } },
					},
				}))
			);
		}

		res.status(OK).json({ hubCampaigns: normalizedCampaigns });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching hub campaigns" });
  }
}

export const publishCampaign = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { id } = req.query as { id: string };
		if (!id) {
			res.status(BAD_REQUEST).json({ error: "campaign id is required" });
			return;
		}

    const createdHub = await hub.findById(req.admin.hub);
    if (!createdHub) {
      res.status(NOT_FOUND).json({ error: "hub id attached to admin is invalid" });
      return;
    }

		// Trust the DB-stored pendingTxHash as proof of payment.
		// It was saved only after tx.wait() confirmed the transaction on the client,
		// so there is no need to re-verify the receipt on-chain here.
		// Also accept txHash from request body as fallback (e.g. if DB write was missed).
		const bodyHash = (req.body as any)?.txHash as string | undefined;
		const storedHash = ((createdHub as any).pendingTxHash as string | null | undefined) || bodyHash;
		if (!storedHash) {
			res.status(FORBIDDEN).json({ error: "No confirmed payment found. Please complete the launch fee payment first." });
			return;
		}
		// Persist body hash to DB if not already stored (catch-up for missed saves)
		if (!(createdHub as any).pendingTxHash && bodyHash) {
			(createdHub as any).pendingTxHash = bodyHash;
		}

		const campaignExists = await campaign.findById(id);
		if (!campaignExists) {
			return res.status(NOT_FOUND).json({ error: "campaign not found" });
		}

		if (campaignExists.status !== "Save") {
			return res.status(BAD_REQUEST).json({ error: "campaign is not in save status" });
		}
		const rewardPool = Number(campaignExists.reward?.pool ?? 0);
		const maxParticipants = Number((campaignExists as any).maxParticipants ?? 0);
		if (rewardPool > 0 && maxParticipants <= 0) {
			return res.status(BAD_REQUEST).json({
				error: "set a participant limit before publishing a reward campaign",
			});
		}
		if (rewardPool > 0 && !campaignExists.contractAddress) {
			return res.status(FORBIDDEN).json({
				error: "deploy and attach a rewards contract before publishing this campaign",
			});
		}

		const hasDiscordTasks = await hasDiscordTasksInCampaign(id);
		const currentHubGuildId = String((createdHub as any).guildId ?? "").trim();
		const lockedDiscordGuildId = await resolveCampaignDiscordLaunchGuildId(campaignExists);
		const requiredDiscordGuildId = lockedDiscordGuildId || currentHubGuildId;

		if (hasDiscordTasks || lockedDiscordGuildId) {
			if (!(createdHub as any).discordConnected || !currentHubGuildId) {
				return res.status(FORBIDDEN).json({
					error: "Connect Discord in Studio before publishing a campaign with Discord tasks.",
				});
			}

			if (currentHubGuildId !== requiredDiscordGuildId) {
				return res.status(FORBIDDEN).json({
					error: "This campaign is locked to a different Discord server. Reconnect the original Discord server that was used to launch it before publishing.",
				});
			}

			(campaignExists as any).discordLaunchGuildId = requiredDiscordGuildId;
			await campaignQuest.updateMany(
				{ campaign: id },
				[
					{
						$set: {
							guildId: {
								$cond: [
									{
										$or: [
											{ $eq: ["$category", "discord"] },
											{ $in: ["$tag", Array.from(DISCORD_CAMPAIGN_TAGS)] },
										],
									},
									requiredDiscordGuildId,
									"$guildId",
								],
							},
						},
					},
				]
			);
		}

		const startsAt = parseCampaignDate(campaignExists.starts_at);
		campaignExists.status = startsAt && startsAt > new Date() ? "Scheduled" : "Active";
		createdHub.campaignsCreated += 1;
		(createdHub as any).pendingTxHash = null;

		await campaignExists.save();
		await createdHub.save();

		res.status(OK).json({ message: "campaign published" });
	} catch (error: any) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: error?.message || "error publishing campaign" });
	}
};

export const deleteCampaign = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const id = req.query.id as string;
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "send campaign id" });
      return;
    }

    const campaignToBeDeleted = await campaign.findById(id);
    if (!campaignToBeDeleted) {
      res.status(NOT_FOUND).json({ error: "campaign not found, id is invalid" });
      return;
    }
		if (String(campaignToBeDeleted.hub) !== String(req.admin.hub)) {
			res.status(FORBIDDEN).json({ error: "you are not allowed to delete this campaign" });
			return;
		}
		if (campaignToBeDeleted.status === "Deleted" || campaignToBeDeleted.deletedAt) {
			res.status(NO_CONTENT).send();
			return;
		}

		campaignToBeDeleted.status = "Deleted";
		campaignToBeDeleted.deletedAt = new Date();
		await campaignToBeDeleted.save();

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting campaign" });
  }
}

