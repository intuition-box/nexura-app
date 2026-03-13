import { OTP } from '@/models/otp.model';
import { hub, hubAdmin } from '@/models/hub.model';
import { addHubAdminEmail } from '@/utils/sendMail';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, OK, NO_CONTENT, NOT_FOUND } from '@/utils/status.utils';
import { CLIENT_URL, STUDIO_FEE_CONTRACT } from '@/utils/env.utils';
import { generateOTP, validateHubData, getMissingFields, validateCampaignData, validateCampaignQuestData, validateSaveCampaignData } from '@/utils/utils';
import logger from '@/config/logger';
import { submission } from '@/models/submission.model';
import { miniQuestCompleted, campaignQuestCompleted } from '@/models/questsCompleted.models';
import { campaign } from '@/models/campaign.model';
import { campaignQuest } from '@/models/quests.model';
import { uploadImg } from "@/utils/img.utils";
import { ethers } from "ethers";
import chain from "@/utils/chain.utils";

export const createHub = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { error } = validateHubData(req.body);
    if (error) {
      const emptyFields = getMissingFields(error);

      res
        .status(BAD_REQUEST)
        .json({ error: `these field(s) are required: ${emptyFields}` });
      return;
    }

    const name = req.body.name.toLowerCase().trim();

    const nameExists = await hub.exists({ name });
    if (nameExists) {
      res.status(BAD_REQUEST).json({ error: "name is already in use" });
      return;
    }

    const hubLogoAsFile = req.file?.buffer;
    if (!hubLogoAsFile) {
      res.status(BAD_REQUEST).json({ error: "hub logo is required" });
      return;
    }

    const hubLogo = await uploadImg({ file: hubLogoAsFile, filename: req.file?.originalname, folder: "hub-logos" });

    const createdHub = await hub.create({
      name,
      description: req.body.description ?? "",
      logo: hubLogo,
      superAdmin: req.id,
      xpAllocated: 200,
    });

    const adminDoc = req.admin as any;
    await hubAdmin.findByIdAndUpdate(req.id, { hub: createdHub._id, pendingTxHash: null });

    // Migrate any pending payment hash from admins to hub
    if (adminDoc?.pendingTxHash) {
      await hub.findByIdAndUpdate(createdHub._id, { pendingTxHash: adminDoc.pendingTxHash });
    }

    res.status(CREATED).json({ message: "hub created!" });
  } catch (error: any) {
    logger.error(error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ error: error?.message || "Error creating hub" });
  }
};

export const getHub = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const hubFound = await hub.findById(req.admin.hub).lean() as any;
    // If hub exists but pendingTxHash isn't on it, fall back to admin's stored hash
    const adminHash = (req.admin as any).pendingTxHash ?? null;
    const pendingTxHash = hubFound?.pendingTxHash ?? adminHash;
    const adminInfo = { _id: req.id, name: req.admin.name, email: req.admin.email, role: req.admin.role };
    res.status(OK).json({ hub: hubFound ? { ...hubFound, pendingTxHash } : { pendingTxHash }, admin: adminInfo });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Error getting hub" });
  }
};

export const savePaymentHash = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { txHash } = req.body;
    if (req.admin.hub) {
      // Hub exists — save on hub
      await hub.findByIdAndUpdate(req.admin.hub, { pendingTxHash: txHash ?? null });
    } else {
      // Hub not created yet — save on admin as fallback
      await hubAdmin.findByIdAndUpdate(req.id, { pendingTxHash: txHash ?? null });
    }
    res.status(OK).json({ message: "payment hash saved" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Error saving payment hash" });
  }
};

export const recoverPaymentByWallet = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      res.status(BAD_REQUEST).json({ error: "Valid wallet address is required" });
      return;
    }

    const feeContract = STUDIO_FEE_CONTRACT?.trim();
    if (!feeContract) {
      res.status(INTERNAL_SERVER_ERROR).json({ error: "Studio fee contract not configured" });
      return;
    }

    const provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0]);
    const feeInterface = new ethers.Interface(["event FeePaid(uint256 totalCampaigns)"]);

    // Scan in chunks of 5000 blocks to stay within typical RPC getLogs limits
    const latestBlock = await provider.getBlockNumber();
    const CHUNK = 5000;
    const HISTORY = 50000;
    const fromBlock = Math.max(0, latestBlock - HISTORY);

    let allLogs: ethers.Log[] = [];
    for (let start = latestBlock; start > fromBlock; start -= CHUNK) {
      const end = start;
      const chunkStart = Math.max(fromBlock, start - CHUNK + 1);
      try {
        const chunk = await provider.getLogs({
          address: feeContract,
          topics: [ethers.id("FeePaid(uint256)")],
          fromBlock: chunkStart,
          toBlock: end,
        });
        allLogs = [...chunk, ...allLogs];
      } catch {
        // RPC may reject chunk — skip and continue
      }
    }

    // Reverse so newest logs are first, deduplicate by txHash
    const seen = new Set<string>();
    const uniqueLogs = [...allLogs].reverse().filter(l => {
      if (seen.has(l.transactionHash)) return false;
      seen.add(l.transactionHash);
      return true;
    });

    // Batch-fetch transactions in parallel (groups of 5) to avoid sequential timeout
    let foundTxHash: string | null = null;
    const BATCH = 5;
    for (let i = 0; i < uniqueLogs.length && !foundTxHash; i += BATCH) {
      const batch = uniqueLogs.slice(i, i + BATCH);
      const txs = await Promise.all(batch.map(l => provider.getTransaction(l.transactionHash).catch(() => null)));
      for (let j = 0; j < txs.length; j++) {
        const tx = txs[j];
        if (tx && tx.from.toLowerCase() === walletAddress.toLowerCase()) {
          const receipt = await provider.getTransactionReceipt(tx.hash).catch(() => null);
          if (receipt && receipt.status === 1) {
            const hasEvent = receipt.logs.some(l => {
              try { return feeInterface.parseLog(l)?.name === "FeePaid"; } catch { return false; }
            });
            if (hasEvent) {
              foundTxHash = tx.hash;
              break;
            }
          }
        }
      }
    }

    if (!foundTxHash) {
      res.status(NOT_FOUND).json({ error: "No successful studio fee payment found for this wallet on-chain. If you have your transaction hash, use the manual restore option instead." });
      return;
    }

    // Persist recovered hash
    if (req.admin.hub) {
      await hub.findByIdAndUpdate(req.admin.hub, { pendingTxHash: foundTxHash });
    } else {
      await hubAdmin.findByIdAndUpdate(req.id, { pendingTxHash: foundTxHash });
    }

    res.status(OK).json({ txHash: foundTxHash, message: "Payment recovered" });
  } catch (error: any) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: error?.message || "Error recovering payment" });
  }
};

export const restoreByTxHash = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { txHash } = req.body;

    if (!txHash || typeof txHash !== "string" || !txHash.trim().startsWith("0x")) {
      res.status(BAD_REQUEST).json({ error: "A valid transaction hash (starting with 0x) is required" });
      return;
    }

    const hash = txHash.trim();

    // Verify the tx on-chain — checkPayment throws if not valid
    const { checkPayment } = await import("@/utils/utils");
    await checkPayment(hash);

    // Save
    if (req.admin.hub) {
      await hub.findByIdAndUpdate(req.admin.hub, { pendingTxHash: hash });
    } else {
      await hubAdmin.findByIdAndUpdate(req.id, { pendingTxHash: hash });
    }

    res.status(OK).json({ txHash: hash, message: "Payment restored" });
  } catch (error: any) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: error?.message || "Error restoring payment" });
  }
};

export const updateIds = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { verifiedId, guildId } = req.body;

    await hub.findByIdAndUpdate(req.admin.hub, { verifiedId, guildId, discordConnected: true });

    res.status(OK).json({ message: "ids updated successfully" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Error updating ids" });
  }
}

export const addHubAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { email, role, clientUrl } = req.body;
    if (!email) {
      res.status(BAD_REQUEST).json({ error: "admin email is required" });
      return;
    }

    if (!req.admin.hub) {
      res.status(BAD_REQUEST).json({ error: "create a hub to continue" });
      return;
    }

    const validRole = role === "superadmin" ? "superadmin" : "admin";

    const code = generateOTP();

    await OTP.create({ email, code, hubId: req.admin.hub, role: validRole });

    // Use the client's origin for the invite link so it works in dev/prod
    const origin = clientUrl || CLIENT_URL;
    await addHubAdminEmail(email, code, origin);

    res.status(OK).json({ message: "otp sent" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to add hub admin' });
  }
};

export const updateHub = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const logoBuffer = req.file?.buffer;

    const { name, logo } = req.body;

    if (logoBuffer && logo) {
      // remove previous logo
      req.body.logo = await uploadImg({ file: logoBuffer, filename: req.file?.originalname, folder: "hub-logo" });
    } else if (logoBuffer && !logo) {
      req.body.logo = await uploadImg({ file: logoBuffer, filename: req.file?.originalname, folder: "hub-logo" });
    }

    const nameExists = await hub.exists({
      name,
      _id: { $ne: req.admin.hub }
    });

    if (nameExists) {
      res.status(400).json({ error: "hub name already exists" });
      return;
    }

    const { xpAllocated: _xp, ...safeBody } = req.body;
    const updatedHub = await hub.findByIdAndUpdate(req.admin.hub, safeBody, { new: true });
    res.status(OK).json(updatedHub);
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to update hub' });
  }
};

export const deleteHub = async (req: GlobalRequest, res: GlobalResponse) => {
  try {

    await hub.findByIdAndDelete(req.admin.hub);

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete hub' });
  }
};

export const removeHubAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.query as { id: string };
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "admin id is required" });
      return;
    }

    if (id === req.id) {
      res.status(BAD_REQUEST).json({ error: "you cannot remove yourself" });
      return;
    }

    // Only allow removing admins from the same hub
    const target = await hubAdmin.findById(id).lean();
    if (!target || String(target.hub) !== String(req.admin.hub)) {
      res.status(NOT_FOUND).json({ error: "admin not found in your hub" });
      return;
    }

    await hubAdmin.findByIdAndDelete(id);

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error removing admin" })
  }
};

export const getHubAdmins = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    if (!req.admin.hub) {
      res.status(BAD_REQUEST).json({ error: "no hub found" });
      return;
    }

    const admins = await hubAdmin.find({ hub: req.admin.hub }).select("_id name email role createdAt").lean();

    // Also fetch pending invites for this hub
    const pendingInvites = await OTP.find({ hubId: String(req.admin.hub) }).select("_id email role createdAt expiresAt").lean();

    res.status(OK).json({ admins, pendingInvites });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching hub admins" });
  }
};

export const resendInvite = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { inviteId, clientUrl } = req.body;
    if (!inviteId) {
      res.status(BAD_REQUEST).json({ error: "inviteId is required" });
      return;
    }

    const existingOtp = await OTP.findById(inviteId);
    if (!existingOtp || String(existingOtp.hubId) !== String(req.admin.hub)) {
      res.status(NOT_FOUND).json({ error: "invite not found" });
      return;
    }

    // Generate a fresh code and reset expiry
    const newCode = generateOTP();
    existingOtp.code = newCode;
    existingOtp.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await existingOtp.save();

    const origin = clientUrl || CLIENT_URL;
    await addHubAdminEmail(existingOtp.email, newCode, origin);

    res.status(OK).json({ message: "invite resent" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to resend invite" });
  }
};

export const deleteInvite = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "invite id is required" });
      return;
    }

    const invite = await OTP.findById(id);
    if (!invite || String(invite.hubId) !== String(req.admin.hub)) {
      res.status(NOT_FOUND).json({ error: "invite not found" });
      return;
    }

    await OTP.findByIdAndDelete(id);
    res.status(OK).json({ message: "invite deleted" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to delete invite" });
  }
};

export const updateHubAdminRole = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { adminId, newRole } = req.body;
    if (!adminId || !newRole) {
      res.status(BAD_REQUEST).json({ error: "adminId and newRole are required" });
      return;
    }

    if (!["admin", "superadmin"].includes(newRole)) {
      res.status(BAD_REQUEST).json({ error: "role must be admin or superadmin" });
      return;
    }

    if (adminId === req.id) {
      res.status(BAD_REQUEST).json({ error: "you cannot change your own role" });
      return;
    }

    const target = await hubAdmin.findById(adminId).lean();
    if (!target || String(target.hub) !== String(req.admin.hub)) {
      res.status(NOT_FOUND).json({ error: "admin not found in your hub" });
      return;
    }

    await hubAdmin.findByIdAndUpdate(adminId, { role: newRole });

    res.status(OK).json({ message: `admin role updated to ${newRole}` });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating admin role" });
  }
};

export const validateCampaignSubmissions = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { submissionId, action }: { submissionId: string; action: "reject" | "accept" } = req.body;

    const userSubmission = await submission.findById(submissionId);
    if (!userSubmission) {
      res.status(BAD_REQUEST).json({ error: "submission not found" });
      return;
    }

    let model;

    if (userSubmission.page === "quest") {
      model = await miniQuestCompleted.findOne({ _id: userSubmission.questCompleted, status: { $in: ["pending", "retry"] } });
      if (!model) {
        res.status(NOT_FOUND).json({ error: "mini quest already completed or id is invalid" });
        return
      }
    } else {
      model = await campaignQuestCompleted.findOne({ _id: userSubmission.questCompleted, status: { $in: ["pending", "retry"] } });
      if (!model) {
        res.status(NOT_FOUND).json({ error: "campaign quest already completed or id is invalid" });
        return
      }
    }

    if (action === "accept") {
      userSubmission.status = "done";
      userSubmission.validatedBy = req.adminName;
      model.done = true;
      model.status = "done";
    } else if (action === "reject") {
      userSubmission.status = "retry";
      userSubmission.validatedBy = req.adminName;
      userSubmission.rejectedCount = (userSubmission.rejectedCount || 0) + 1;
      model.status = "retry";
    }

    await userSubmission.save();
    await model.save();

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to validate campaign submissions' });
  }
};

export const getCampaignSubmissions = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    // Return all submissions tied to this hub (studio campaigns only)
    const pendingTasks = await submission.find({ hub: req.admin.hub }).lean().sort({ createdAt: 1 });
    res.status(OK).json({ message: "submissions fetched", pendingTasks });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch campaign submissions" });
  }
};

export const getCampaign = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.query as { id: string };
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "send campaign id" });
      return;
    }

    const campaignFound = await campaign.findById(id).lean();
    if (!campaignFound) {
      res.status(NOT_FOUND).json({ error: "campaign not found" });
      return;
    }

    const campaignQuests = await campaignQuest.find({ campaign: id }).lean();

    res.status(OK).json({ campaignQuests, campaignFound });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error fetching campaign" });
  }
}

export const saveCampaign = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    // FormData sends JSON fields as strings — parse them before validation
    if (typeof req.body.reward === "string") {
      try { req.body.reward = JSON.parse(req.body.reward); } catch { /* leave as-is */ }
    }

    const hubFound = await hub.findById(req.admin.hub).lean();
    if (!hubFound) {
      res.status(BAD_REQUEST).json({ error: "create a hub to continue" });
      return;
    }

    // Parse campaignQuests if provided
    let questsToSave: any[] | null = null;
    if (req.body.campaignQuests !== undefined) {
      try {
        questsToSave = typeof req.body.campaignQuests === "string"
          ? JSON.parse(req.body.campaignQuests)
          : req.body.campaignQuests;
      } catch { /* ignore */ }
    }

    const { error } = validateSaveCampaignData(req.body);
    if (error) {
      const emptyFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `Missing required fields: ${emptyFields}` });
      return;
    }

    const coverImageBuffer = req.file?.buffer;
    const { hubCoverImage } = req.body;

    if (hubCoverImage && coverImageBuffer) {
      // remove previous cover image
      req.body.coverImage = await uploadImg({
        file: coverImageBuffer,
        filename: req.file?.originalname,
        folder: "cover-images",
        maxSize: 2 * 1024 ** 2
      });
    } else if (coverImageBuffer && !hubCoverImage) {
      req.body.coverImage = await uploadImg({
        file: coverImageBuffer,
        filename: req.file?.originalname,
        folder: "cover-images",
        maxSize: 2 * 1024 ** 2
      });
    }

    const { id } = req.query as { id: string };
    if (!id) {
      // Fill in defaults for required model fields not yet provided in a draft
      const [campaignCount, projectDoc] = await Promise.all([
        campaign.countDocuments({ creator: req.id }),
        hub.findById(req.admin.hub).lean(),
      ]);
      const reward = req.body.reward ?? {};
      const body = {
        ...req.body,
        project_image: projectDoc?.logo ?? "pending",
        project_name: projectDoc?.name ?? req.body.nameOfProject ?? "",
        sub_title: req.body.description ?? "",
        totalXpAvailable: reward.xp ?? 0,
        totalTrustAvailable: reward.pool ?? 0,
        campaignNumber: campaignCount + 1,
        projectCoverImage: req.body.coverImage ?? "pending",
        creator: req.id,
        hub: req.admin.hub,
        reward: {
          xp: reward.xp ?? 0,
          pool: reward.pool ?? 0,
          trustTokens: reward.trust ?? 0,
        },
      };
      body.hub = req.admin.hub;
      const savedCampaign = await campaign.create(body);
      const savedCampaignId = savedCampaign._id;

      // Save quests
      if (questsToSave !== null) {
        await campaignQuest.deleteMany({ campaign: savedCampaignId });
        if (questsToSave.length > 0) {
          await campaignQuest.insertMany(
            questsToSave.map((q: any) => (
              (q.tag === "discord" || q.tag === "join-discord") ? { ...q, campaign: savedCampaignId, guildId: hubFound.guildId } :
              { ...q, campaign: savedCampaignId }))
          );
        }
        await campaign.findByIdAndUpdate(savedCampaignId, { noOfQuests: questsToSave.length });
      }

      res.status(CREATED).json({ message: 'Campaign saved successfully', campaignId: savedCampaign._id });
      return;
    }

    const campaignFound = await campaign.findById(id).lean();
    if (!campaignFound) {
      res.status(NOT_FOUND).json({ error: "campaign not found" });
      return;
    }

    const { campaignQuests: _cq, isDraft: _d, existingCoverImage: _e, hubCoverImage: _h, nameOfProject: _n, ...updateFields } = req.body;
    await campaign.findByIdAndUpdate(id, updateFields, { new: true }).lean();

    // Update quests without destroying existing IDs/submissions
    if (questsToSave !== null) {
      const existingQuests = await campaignQuest.find({ campaign: id }).select("_id").lean();
      const existingQuestIds = existingQuests.map((q: any) => q._id.toString());
      const incomingQuestIds = questsToSave
        .map((q: any) => q._id?.toString())
        .filter(Boolean);

      const questsToUpdate = questsToSave.filter((q: any) => q._id);
      const questsToInsert = questsToSave.filter((q: any) => !q._id);

      if (questsToUpdate.length > 0) {
        await campaignQuest.bulkWrite(
          questsToUpdate.map((q: any) => {
            const { _id, ...rest } = q;
            const updatePayload = (q.tag === "discord" || q.tag === "join-discord")
              ? { ...rest, campaign: id, guildId: hubFound.guildId }
              : { ...rest, campaign: id };

            return {
              updateOne: {
                filter: { _id, campaign: id },
                update: { $set: updatePayload },
              }
            };
          })
        );
      }

      if (questsToInsert.length > 0) {
        await campaignQuest.insertMany(
          questsToInsert.map((q: any) => (
            (q.tag === "discord" || q.tag === "join-discord")
              ? { ...q, campaign: id, guildId: hubFound.guildId }
              : { ...q, campaign: id }
          ))
        );
      }

      const questIdsToDelete = existingQuestIds.filter((existingId) => !incomingQuestIds.includes(existingId));
      if (questIdsToDelete.length > 0) {
        await campaignQuest.deleteMany({ _id: { $in: questIdsToDelete }, campaign: id });
      }

      await campaign.findByIdAndUpdate(id, { noOfQuests: questsToSave.length });
    }

    res.status(OK).json({ campaignId: id });
  } catch (error: any) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: error?.message || 'Failed to save campaign' });
  }
}

export const saveCampaignWithQuests = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    if (typeof req.body.reward === "string") try { req.body.reward = JSON.parse(req.body.reward); } catch { /* leave */ }
    if (typeof req.body.campaignQuests === "string") try { req.body.campaignQuests = JSON.parse(req.body.campaignQuests); } catch { /* leave */ }

    const { error } = validateCampaignData(req.body);
    if (error) {
      const emptyFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `Missing required fields: ${emptyFields}` });
      return;
    }

    const hubFound = await hub.findById(req.admin.hub).lean();
    if (!hubFound) {
      res.status(BAD_REQUEST).json({ error: "create a hub to continue" });
      return;
    }

    const { id } = req.query as { id: string };

    let campaignId = id;
    if (!campaignId) {
      const coverImageBuffer = req.file?.buffer;

      if (!coverImageBuffer) {
        res.status(BAD_REQUEST).json({ error: "cover image is required" });
        return;
      }

      req.body.projectCoverImage = await uploadImg({
        file: coverImageBuffer,
        filename: req.file?.originalname,
        folder: "cover-images",
        maxSize: 2 * 1024 ** 2
      });
      const savedCampaign = await campaign.create(req.body);

      campaignId = savedCampaign._id.toString();
    } else {
      const campaignFound = await campaign.findById(campaignId).lean();
      if (!campaignFound) {
        res.status(NOT_FOUND).json({ error: "campaign not found" });
        return;
      }

      await campaign.findByIdAndUpdate(id, req.body.campaignData, { new: true });
    }

    const { error: questError } = validateCampaignQuestData(req.body.questData);
    if (questError) {
      const emptyFields = getMissingFields(questError);
      res.status(BAD_REQUEST).json({ error: `Missing required fields: ${emptyFields}` });
      return;
    }

    const createdQuests = [];

    const newQuests = [];

    for (const qd of req.body.questData) {
      if (qd.campaign && qd._id) {
        createdQuests.push({
          updateOne: {
            filter: { _id: qd._id },
            update: {
              $set: {
                ...qd,
              }
            }
          }
        });
      } else {
        qd.campaign = campaignId;
        qd.guildId = qd.tag === "discord" ? hubFound.guildId  : undefined;
        newQuests.push({ ...qd,  })
      }
    }

    if (createdQuests.length && !newQuests.length) {
      await campaignQuest.bulkWrite(createdQuests);
    } else if (!createdQuests.length && newQuests.length) {
      await campaignQuest.insertMany(newQuests);
    } else {
      await campaignQuest.bulkWrite(createdQuests);
      await campaignQuest.insertMany(newQuests);
    }

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to save campaign and quests' });
  }
}

export const deleteCampaignQuest = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.query as { id: string };
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "send the quest id" });
      return;
    }

    const questToBeDeleted = await campaignQuest.findById(id).lean();
    if (!questToBeDeleted) {
      res.status(BAD_REQUEST).json({ error: "quest id is invalid" });
      return;
    }

    await campaignQuest.findByIdAndDelete(id);

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting campaign quest" });
  }
}

export const updateCamapaignQuest = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.query as { id: string };
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "send quest id" });
      return;
    }

    const exists = await campaignQuest.findById(id);
    if (!exists) {
      res.status(NOT_FOUND).json({ error: "quest not found, id is invalid" });
      return;
    }

    await campaignQuest.findByIdAndUpdate(id, req.body);

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating quest" });
  }
}
