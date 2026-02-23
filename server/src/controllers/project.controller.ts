import { OTP } from '@/models/otp.model';
import { project, projectAdmin } from '@/models/project.model';
import { addProjectAdminEmail } from '@/utils/sendMail';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK, NO_CONTENT } from '@/utils/status.utils';
import { generateOTP } from '@/utils/utils';
import logger from '@/config/logger';

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
    const { name, description } = req.body;
    
    const updatedProject = await project.findByIdAndUpdate(req.id, { name, description }, { new: true });
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
