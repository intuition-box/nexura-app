import { OTP } from '@/models/otp.model';
import { hub, hubAdmin } from '@/models/hub.model';
import { addHubAdminEmail } from '@/utils/sendMail';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, OK, NO_CONTENT, NOT_FOUND } from '@/utils/status.utils';
import { generateOTP, validateHubData, getMissingFields, validateCampaignData, validateCampaignQuestData, validateSaveCampaignData } from '@/utils/utils';
import logger from '@/config/logger';
import { submission } from '@/models/submission.model';
import { miniQuestCompleted, campaignQuestCompleted } from '@/models/questsCompleted.models';
import { campaign } from '@/models/campaign.model';
import { campaignQuest } from '@/models/quests.model';
import { uploadImg } from "@/utils/img.utils";

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

    const projectLogoAsFile = req.file?.buffer;
		if (!projectLogoAsFile) {
			res.status(BAD_REQUEST).json({ error: "hub logo is required" });
			return;
    }

    const projectLogo = await uploadImg({ file: projectLogoAsFile, filename: req.file?.originalname, folder: "hub-logos" });

    req.body.logo = projectLogo;
    req.body.name = name;
    req.body.superAdmin = req.id;

    const createdProject = await hub.create(req.body);

    req.admin.hub = createdProject._id;

    await req.admin.save();

		res.status(CREATED).json({ message: "hub created!" });
	} catch (error) {
		logger.error(error);
		res
			.status(INTERNAL_SERVER_ERROR)
			.json({ error: "Error creating hub" });
	}
};

export const addHubAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { email } = req.body;
		if (!email) {
			res.status(BAD_REQUEST).json({ error: "admin email is required" });
			return;
    }

    if (!req.admin.hub) {
      res.status(BAD_REQUEST).json({ error: "create a hub to continue" });
      return;
    }

    const code = generateOTP();

    await OTP.create({ email, code, hubId: req.admin.hub });

    await addHubAdminEmail(email, code);

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

    const updatedHub = await hub.findByIdAndUpdate(req.admin.hub, req.body, { new: true });
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

    await hubAdmin.findByIdAndDelete(id);

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error removing admin" })
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
        project_image:       projectDoc?.logo               ?? "pending",
        project_name:        projectDoc?.name               ?? req.body.nameOfProject ?? "",
        sub_title:           req.body.description           ?? "",
        totalXpAvailable:    reward.xp                      ?? 0,
        totalTrustAvailable: reward.trust                   ?? 0,
        campaignNumber:      campaignCount + 1,
        projectCoverImage:   req.body.coverImage            ?? "pending",
        creator:             req.id,
        reward: {
          xp:          reward.xp    ?? 0,
          pool:        reward.pool  ?? 0,
          trustTokens: reward.trust ?? 0,
        },
      };
      const savedCampaign = await campaign.create(body);
      const savedCampaignId = savedCampaign._id;

      // Save quests
      if (questsToSave !== null) {
        await campaignQuest.deleteMany({ campaign: savedCampaignId });
        if (questsToSave.length > 0) {
          await campaignQuest.insertMany(
            questsToSave.map((q: any) => ({ ...q, campaign: savedCampaignId }))
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

    await campaign.findByIdAndUpdate(id, req.body, { new: true }).lean();

    // Update quests
    if (questsToSave !== null) {
      await campaignQuest.deleteMany({ campaign: id });
      if (questsToSave.length > 0) {
        await campaignQuest.insertMany(
          questsToSave.map((q: any) => ({ ...q, campaign: id }))
        );
      }
      await campaign.findByIdAndUpdate(id, { noOfQuests: questsToSave.length });
    }

    res.status(OK).json({ campaignId: id });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to save campaign' });
  }
}

export const saveCampaignWithQuests = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { error } = validateCampaignData(req.body);
    if (error) {
      const emptyFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `Missing required fields: ${emptyFields}` });
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
        newQuests.push({ ...qd })
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
