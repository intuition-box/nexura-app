import logger from "@/config/logger";
import { quest } from "@/models/quests.model";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "@/utils/status.utils";
import { validateQuestData } from "@/utils/utils";

export const createQuest = async (req: GlobalRequest, res: GlobalResponse) => {
	try {
		const { success } = validateQuestData(req.body);
		if (!success) {
			res
				.status(BAD_REQUEST)
				.json({ error: "send the correct data required to create a quest" });
			return;
		}

		const newQuest = new quest(req.body);
		if (newQuest.category !== "weekly") {
			await newQuest.save();
		} else {
			// new Date(new Date(Date.now() + 86400000).setHours(0, 60, 0, 0)); (if quests expire at 12am UTC. For now, it expires 1 day after creation)
			newQuest.expires = new Date(Date.now() + 86400000);
			await newQuest.save();
		}

		res.status(OK).json({ message: "quest quest created!" });
	} catch (error) {
		logger.error(error);
		res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating quest" });
	}
};
