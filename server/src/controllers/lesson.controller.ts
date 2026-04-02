import logger from "@/config/logger";
import { lesson, lessonCompleted, miniLesson, question, questionCompleted } from "@/models/lesson.model";
import { user } from "@/models/user.model";
import { BAD_REQUEST, OK, NOT_FOUND, INTERNAL_SERVER_ERROR, CREATED, FORBIDDEN } from "@/utils/status.utils";
import { uploadImg } from "@/utils/img.utils";
import { validateCreateLesson, validateCreateQuestion } from "@/utils/utils";

const getUploadedLessonImage = async (
  req: GlobalRequest,
  fieldName: "coverImage" | "profileImage",
  folder: string,
) => {
  const files = req.files as Record<string, Array<{ buffer: Buffer; originalname?: string }>> | undefined;
  const uploadedFile = files?.[fieldName]?.[0];

  if (!uploadedFile?.buffer) {
    return undefined;
  }

  return uploadImg({
    file: uploadedFile.buffer,
    filename: uploadedFile.originalname || `${fieldName}.jpg`,
    folder,
    maxSize: 2 * 1024 ** 2,
  });
};

export const createLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const coverImage = await getUploadedLessonImage(req, "coverImage", "lesson-covers");
    const profileImage = await getUploadedLessonImage(req, "profileImage", "lesson-profiles");

    if (coverImage) req.body.coverImage = coverImage;
    if (profileImage) req.body.profileImage = profileImage;

    const { success } = validateCreateLesson(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "Send the required values. Required values are: title, description and reward" });
      return;
    }

    const maxOrderDoc = await lesson.findOne().sort({ order: -1, createdAt: -1 }).select("order").lean();
    const nextOrder = maxOrderDoc ? (Number(maxOrderDoc.order) || 0) + 1 : 0;

    await lesson.create({ ...req.body, order: nextOrder });

    res.status(CREATED).json({ message: "lesson created" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating lesson" });
  }
}

export const updateLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { lessonId, title, description, reward } = req.body as {
      lessonId?: string;
      title?: string;
      description?: string;
      reward?: number;
    };

    if (!lessonId) {
      res.status(BAD_REQUEST).json({ error: "lessonId is required" });
      return;
    }

    const lessonExists = await lesson.findById(lessonId);
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }

    if (typeof title === "string" && title.trim()) {
      lessonExists.title = title.trim();
    }

    if (typeof description === "string" && description.trim()) {
      lessonExists.description = description.trim();
    }

    if (reward !== undefined) {
      const normalizedReward = Number(reward);
      if (!Number.isFinite(normalizedReward) || normalizedReward < 0) {
        res.status(BAD_REQUEST).json({ error: "reward must be a valid number" });
        return;
      }
      lessonExists.reward = normalizedReward;
    }

    const coverImage = await getUploadedLessonImage(req, "coverImage", "lesson-covers");
    const profileImage = await getUploadedLessonImage(req, "profileImage", "lesson-profiles");

    if (coverImage) {
      lessonExists.coverImage = coverImage;
    }

    if (profileImage) {
      lessonExists.profileImage = profileImage;
    }

    await lessonExists.save();

    res.status(OK).json({ message: "lesson updated" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating lesson" });
  }
};

export const createQuestion = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateCreateQuestion(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "Send the required values. Required values are: lesson id as 'lesson', question, options as array and solution" });
      return;
    }

    const maxOrderDoc = await question.findOne({ lesson: req.body.lesson }).sort({ order: -1 }).select("order").lean();
    const nextOrder = maxOrderDoc ? (Number(maxOrderDoc.order) || 0) + 1 : 0;

    await question.create({ ...req.body, order: nextOrder });

    await lesson.updateOne({ _id: req.body.lesson }, { $inc: { noOfQuestions: 1 } });

    res.status(CREATED).json({ message: "question created" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating lesson question" });
  }
}

export const updateQuestion = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { questionId, question: questionText, options, solution, introText, introTrophy } = req.body as {
      questionId?: string;
      question?: string;
      options?: string[];
      solution?: string;
      introText?: string;
      introTrophy?: string;
    };

    if (!questionId) {
      res.status(BAD_REQUEST).json({ error: "questionId is required" });
      return;
    }

    const questionExists = await question.findById(questionId);
    if (!questionExists) {
      res.status(NOT_FOUND).json({ error: "question does not exist" });
      return;
    }

    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => option.trim()).filter(Boolean)
      : questionExists.options;

    const normalizedSolution = typeof solution === "string" ? solution.trim() : questionExists.solution;

    if (normalizedOptions.length < 2) {
      res.status(BAD_REQUEST).json({ error: "at least two options are required" });
      return;
    }

    if (!normalizedOptions.includes(normalizedSolution)) {
      res.status(BAD_REQUEST).json({ error: "solution must match one of the options" });
      return;
    }

    if (typeof questionText === "string" && questionText.trim()) {
      questionExists.question = questionText.trim();
    }

    questionExists.options = normalizedOptions;
    questionExists.solution = normalizedSolution;
    if (typeof introText === "string") questionExists.introText = introText;
    if (typeof introTrophy === "string") questionExists.introTrophy = introTrophy;

    await questionExists.save();

    res.status(OK).json({ message: "question updated" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating lesson question" });
  }
};

export const createMiniLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { text, lesson: lessonId } = req.body;
    if (!text || !lessonId) {
      res.status(BAD_REQUEST).json({ error: "Send the required values. Required values are: lesson id as 'lesson' and text" });
      return;
    }

    const maxOrderDoc = await miniLesson.findOne({ lesson: lessonId }).sort({ order: -1 }).select("order").lean();
    const nextOrder = maxOrderDoc ? (Number(maxOrderDoc.order) || 0) + 1 : 0;

    await miniLesson.create({ ...req.body, order: nextOrder });

    res.status(CREATED).json({ message: "mini lesson created" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating mini lesson" });
  }
}

export const updateMiniLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { miniLessonId, text } = req.body as { miniLessonId?: string; text?: string };
    if (!miniLessonId || !text?.trim()) {
      res.status(BAD_REQUEST).json({ error: "miniLessonId and text are required" });
      return;
    }

    const miniLessonExists = await miniLesson.findById(miniLessonId);
    if (!miniLessonExists) {
      res.status(NOT_FOUND).json({ error: "mini lesson does not exist" });
      return;
    }

    miniLessonExists.text = text.trim();
    await miniLessonExists.save();

    res.status(OK).json({ message: "mini lesson updated" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating mini lesson" });
  }
};

export const rewardLessonXp = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id: lessonId } = req.query as { id: string };
    const { id } = req;

    const lessonExists = await lesson.findById(lessonId).lean().select("reward");
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }

    const existingLessonProgress = await lessonCompleted.findOne({ lesson: lessonId, user: id });
    if (!existingLessonProgress) {
      res.status(BAD_REQUEST).json({ error: "lesson has not been started" });
      return;
    }

    if (existingLessonProgress.done) {
      res.status(BAD_REQUEST).json({ error: "xp has already been claimed for this lesson" });
      return;
    }

    const [totalQuestions, questionsAnswered] = await Promise.all([
      question.countDocuments({ lesson: lessonId }),
      questionCompleted.countDocuments({ done: true, user: id, lesson: lessonId }),
    ]);
    if (totalQuestions > 0 && questionsAnswered < totalQuestions) {
      res.status(FORBIDDEN).json({ error: "answer all questions before reward can be claimed" });
      return;
    }

    const rewardAmount = Number(lessonExists.reward || 0);

    existingLessonProgress.status = "completed";
    existingLessonProgress.done = true;

    await user.updateOne({ _id: id }, { $inc: { xp: rewardAmount, lessonsCompleted: 1 } });
    await existingLessonProgress.save();
    res.status(OK).json({ message: "xp reward claimed", reward: rewardAmount });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error rewarding lesson xp" });
  }
}

export const getLessons = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const lessons = await lesson.find({ status: "published" }).sort({ order: 1, createdAt: 1 }).lean();
    const lessonsCompleted = await lessonCompleted.find({ user: req.id }).lean();

    const mergedLessons: any[] = [];

    for (const singleLesson of lessons) {
      const singleLessonCompleted = lessonsCompleted.find(
        (completedSingleLesson) =>
          completedSingleLesson.lesson?.toString() === singleLesson._id.toString()
      );

      const mergedSingleLesson: Record<any, unknown> = singleLesson;

      mergedSingleLesson.done = singleLessonCompleted ? singleLessonCompleted.done : false;
      mergedLessons.push(mergedSingleLesson);
    }

    res.status(OK).json({ message: "lessons fetched!", lessons: mergedLessons });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting lesson" });
  }
};

export const getAllLessons = async (_req: GlobalRequest, res: GlobalResponse) => {
  try {
    const lessons = await lesson.find().sort({ order: 1, createdAt: 1 }).lean();
    res.status(OK).json({ message: "lessons fetched!", lessons });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting lessons" });
  }
};

export const publishLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { lessonId } = req.body as { lessonId?: string };
    if (!lessonId) {
      res.status(BAD_REQUEST).json({ error: "lessonId is required" });
      return;
    }
    const lessonExists = await lesson.findById(lessonId);
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }
    lessonExists.status = "published";
    await lessonExists.save();
    res.status(OK).json({ message: "lesson published" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error publishing lesson" });
  }
};

export const unpublishLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { lessonId } = req.body as { lessonId?: string };
    if (!lessonId) {
      res.status(BAD_REQUEST).json({ error: "lessonId is required" });
      return;
    }
    const lessonExists = await lesson.findById(lessonId);
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }
    lessonExists.status = "draft";
    await lessonExists.save();
    res.status(OK).json({ message: "lesson saved as draft" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error saving lesson as draft" });
  }
};

export const updateQuestionIntro = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { questionId, introText, introTrophy } = req.body as {
      questionId?: string;
      introText?: string;
      introTrophy?: string;
    };
    if (!questionId) {
      res.status(BAD_REQUEST).json({ error: "questionId is required" });
      return;
    }
    const questionExists = await question.findById(questionId);
    if (!questionExists) {
      res.status(NOT_FOUND).json({ error: "question does not exist" });
      return;
    }
    questionExists.introText = introText ?? "";
    questionExists.introTrophy = introTrophy ?? "";
    await questionExists.save();
    res.status(OK).json({ message: "question intro updated" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error updating question intro" });
  }
};

export const getLessonDetailsForAdmin = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id: lessonId } = req.query as { id: string };
    if (!lessonId) {
      res.status(BAD_REQUEST).json({ error: "lesson id is required" });
      return;
    }

    const lessonExists = await lesson.exists({ _id: lessonId });
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }

    const miniLessons = await miniLesson.find({ lesson: lessonId }).sort({ order: 1, createdAt: 1 }).lean();
    const questions = await question.find({ lesson: lessonId }).sort({ order: 1, createdAt: 1 }).lean();

    res.status(OK).json({ message: "lesson details fetched", miniLessons, questions });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting lesson details" });
  }
};

export const getMiniLessonAndQuestions = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id } = req;
    const { id: lessonId } = req.query as { id: string };
    if (!lessonId) {
      res.status(BAD_REQUEST).json({ error: "lesson id is required" });
      return;
    }

    const lessonExists = await lesson.findById(lessonId).select("status").lean();
    if (!lessonExists || lessonExists.status !== "published") {
      res.status(NOT_FOUND).json({ error: "lesson not found" });
      return;
    }

    const miniLessons = await miniLesson.find({ lesson: lessonId }).sort({ order: 1, createdAt: 1 }).lean();

    const questions = await question.find({ lesson: lessonId }).select("options question lesson solution order createdAt introText introTrophy").sort({ order: 1, createdAt: 1 }).lean();
    const questionsCompleted = id
      ? await questionCompleted.find({ user: id, lesson: lessonId }).lean()
      : [];

    const mergedLessonsQuestions: any = [];

    for (const singleQuestion of questions) {
      const singleQuestionCompleted = questionsCompleted.find(
        (completedSingleQuestion) =>
          completedSingleQuestion.question?.toString() === singleQuestion._id.toString()
      );

      const mergedSingleQuestion: Record<any, unknown> = singleQuestion;

      mergedSingleQuestion.done = singleQuestionCompleted ? singleQuestionCompleted.done : false;
      mergedSingleQuestion.answer = singleQuestionCompleted ? singleQuestionCompleted.answer : "";

      mergedLessonsQuestions.push(mergedSingleQuestion);
    }

    res.status(OK).json({ message: "mini lessons and questions fetched", miniLessons, questions: mergedLessonsQuestions });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting mini lesson and questions" });
  }
}

export const answerQuestion = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
		const { id } = req;
    const { question: questionId, answer, lesson: lessonId } = req.body;

    const lowerAnswer = answer.toLowerCase();

    if (!questionId || !answer || !lessonId) {
			res.status(BAD_REQUEST).json({ error: "Send the required values. The values are question id as 'question', lesson id as 'lesson' and the answer" });
			return;
    }

    const questionExists = await question.findById(questionId);
    if (!questionExists) {
      res.status(NOT_FOUND).json({ error: "question id is invalid" });
      return;
    }

    const lowerSolution = (questionExists.solution || "").toLowerCase();

    const questionAlreadyAnswered = await questionCompleted.findOne({ question: questionId, lesson: lessonId, user: id });
    if (!questionAlreadyAnswered) {
      if (lowerAnswer !== lowerSolution) {
        await questionCompleted.create({ user: id, answer: lowerAnswer, lesson: lessonId, question: questionId });

        res.status(BAD_REQUEST).json({ error: "wrong answer" });
        return;
      }

      await questionCompleted.create({ done: true, answer: lowerAnswer, lesson: lessonId, user: id, question: questionId });

      res.status(OK).json({ message: "correct answer" });
      return;
    }

    if (questionAlreadyAnswered.done === true) {
      res.status(FORBIDDEN).json({ error: "question already answered" });
      return;
    }

    if (lowerAnswer !== lowerSolution) {
      if (lowerAnswer !== questionAlreadyAnswered.answer) {
        questionAlreadyAnswered.answer = lowerAnswer;

        await questionAlreadyAnswered.save(); 
      }

      res.status(BAD_REQUEST).json({ message: "wrong answer" });
      return;
    }

    questionAlreadyAnswered.answer = lowerAnswer;
    questionAlreadyAnswered.done = true;

    await questionAlreadyAnswered.save();

    res.status(OK).json({ message: "correct answer" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error answering question" });
  }
}

export const startLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const id = req.id as string;
    const lessonId = req.query.lessonId as string;

    const lessonExists = await lesson.exists({ _id: lessonId });
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson id in invalid" });
      return;
    }
    const lessonStarted = await lessonCompleted.exists({ user: id, lesson: lessonId });
    if (lessonStarted) {
      res.status(BAD_REQUEST).json({ error: "lesson already started or completed" });
      return;
    }

    await lessonCompleted.create({ lesson: lessonId, user: id });

    res.status(OK).json({ message: "lesson started!" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error starting lesson" });
  }
}

export const deleteLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id: lessonId } = req.query as { id: string };

    if (!lessonId) {
      res.status(BAD_REQUEST).json({ error: "lesson id is required" });
      return;
    }


    await Promise.all([
      lesson.deleteOne({ _id: lessonId }),
      miniLesson.deleteMany({ lesson: lessonId }),
      question.deleteMany({ lesson: lessonId }),
      lessonCompleted.deleteMany({ lesson: lessonId }),
      questionCompleted.deleteMany({ lesson: lessonId }),
    ]);

    res.status(OK).json({ message: "lesson deleted" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting lesson" });
  }
};

export const deleteMiniLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id: miniLessonId } = req.query as { id: string };
    if (!miniLessonId) {
      res.status(BAD_REQUEST).json({ error: "mini lesson id is required" });
      return;
    }
    await miniLesson.deleteOne({ _id: miniLessonId });
    res.status(OK).json({ message: "mini lesson deleted" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting mini lesson" });
  }
};

export const deleteQuestion = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { id: questionId } = req.query as { id: string };
    if (!questionId) {
      res.status(BAD_REQUEST).json({ error: "question id is required" });
      return;
    }
    await Promise.all([
      question.deleteOne({ _id: questionId }),
      questionCompleted.deleteMany({ question: questionId }),
    ]);
    res.status(OK).json({ message: "question deleted" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error deleting question" });
  }
};

export const reorderLessonContent = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { lessonId, items } = req.body as {
      lessonId?: string;
      items?: Array<{ id: string; kind: "mini" | "question"; order: number }>;
    };

    if (!lessonId || !Array.isArray(items) || items.length === 0) {
      res.status(BAD_REQUEST).json({ error: "lessonId and items array are required" });
      return;
    }

    const lessonExists = await lesson.exists({ _id: lessonId });
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }

    await Promise.all(
      items.map((item) => {
        if (item.kind === "mini") {
          return miniLesson.updateOne({ _id: item.id, lesson: lessonId }, { $set: { order: item.order } });
        }
        return question.updateOne({ _id: item.id, lesson: lessonId }, { $set: { order: item.order } });
      })
    );

    res.status(OK).json({ message: "order updated" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error reordering lesson content" });
  }
};

