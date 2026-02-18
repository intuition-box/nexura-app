import { OTP } from '@/models/otp.model';
import { project, projectAdmin } from '@/models/project.model';
import { addProjectAdminEmail } from '@/utils/sendMail';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, OK, NO_CONTENT, NOT_FOUND } from '@/utils/status.utils';
import { generateOTP, getMissingFields, validateCampaignData, validateCampaignQuestData, validateSaveCampaignData } from '@/utils/utils';
import logger from '@/config/logger';
import { submission } from '@/models/submission.model';
import { miniQuestCompleted, campaignQuestCompleted } from '@/models/questsCompleted.models';
import { campaign } from '@/models/campaign.model';
import { campaignQuest, quest } from '@/models/quests.model';
import { uploadImg } from "@/utils/img.utils";

export const addProjectAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { email } = req.body;
		if (!email) {
			res.status(BAD_REQUEST).json({ error: "admin email is required" });
			return;
    }

    const code = generateOTP();

    await OTP.create({ email, code, project: req.id });

    await addProjectAdminEmail(email, code);

    res.status(OK).json({ message: "otp sent" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to add project admin' });
  }
};

export const updateProject = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const logoBuffer = req.file?.buffer;

    const { name, logo } = req.body;

    if (logoBuffer) {
      req.body.logo = await uploadImg({ file: logoBuffer, filename: req.file?.originalname, folder: "project-logo" });
    }

    const nameExists = await project.exists({
      name,
      _id: { $ne: req.id }
    });
    
    if (nameExists) {
      res.status(400).json({ error: "Project name already exists" });
      return;
    }
    
    const updatedProject = await project.findByIdAndUpdate(req.id, req.body, { new: true });
    res.status(OK).json(updatedProject);
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req;

    await project.findByIdAndDelete(id);

    res.status(NO_CONTENT).send();
  } catch (error) {
    logger.error(error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete project' });
  }
};

export const removeProjectAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req.query as { id: string };
    if (!id) {
      res.status(BAD_REQUEST).json({ error: "admin id is required" });
      return;
    }
    
    await projectAdmin.findByIdAndDelete(id);
    
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
    const { error } = validateSaveCampaignData(req.body);
    if (error) {
      const emptyFields = getMissingFields(error);
      res.status(BAD_REQUEST).json({ error: `Missing required fields: ${emptyFields}` });
      return;
    }

    const coverImageBuffer = req.file?.buffer;
    const { projectCoverImage } = req.body;

    if (projectCoverImage && coverImageBuffer) {
      // remove previous cover image
      req.body.coverImage = await uploadImg({
        file: coverImageBuffer,
        filename: req.file?.originalname,
        folder: "cover-images",
        maxSize: 2 * 1024 ** 2
      });
    } else if (coverImageBuffer && !projectCoverImage) {
      req.body.coverImage = await uploadImg({
        file: coverImageBuffer,
        filename: req.file?.originalname,
        folder: "cover-images",
        maxSize: 2 * 1024 ** 2
      });
    }

    const { id } = req.query as { id: string };
    if (!id) {
      const savedCampaign = await campaign.create(req.body);

      res.status(CREATED).json({ message: 'Campaign saved successfully', campaignId: savedCampaign._id });
      return;
    }

    const campaignFound = await campaign.findById(id).lean();
    if (!campaignFound) {
      res.status(NOT_FOUND).json({ error: "campaign not found" });
      return;
    }

    await campaign.findByIdAndUpdate(id, req.body, { new: true }).lean();

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
