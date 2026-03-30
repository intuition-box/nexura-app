import logger from "@/config/logger";
import { lesson, lessonCompleted, miniLesson, question, questionCompleted } from "@/models/lesson.model";
import { user } from "@/models/user.model";
import { BAD_REQUEST, OK, NOT_FOUND, INTERNAL_SERVER_ERROR, CREATED, FORBIDDEN } from "@/utils/status.utils";
import { validateCreateLesson, validateCreateQuestion } from "@/utils/utils";

export const createLesson = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { success } = validateCreateLesson(req.body);
    if (!success) {
      res.status(BAD_REQUEST).json({ error: "Send the required values. Required values are: title, description and reward" });
      return;
    }

    await lesson.create(req.body);

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

    await question.create(req.body);

    await lesson.updateOne({ _id: req.body.lesson }, { $inc: { noOfQuestions: 1 } });

    res.status(CREATED).json({ message: "question created" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error creating lesson question" });
  }
}

export const updateQuestion = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const { questionId, question: questionText, options, solution } = req.body as {
      questionId?: string;
      question?: string;
      options?: string[];
      solution?: string;
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

    await miniLesson.create(req.body);

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

    const lessonExists = await lesson.findById(lessonId).lean().select("reward noOfQuestions");
    if (!lessonExists) {
      res.status(NOT_FOUND).json({ error: "lesson does not exist" });
      return;
    }

    const questionsAnswered = await questionCompleted.countDocuments({ done: true, user: id, lesson: lessonId });

    if (lessonExists.noOfQuestions !== questionsAnswered) {
      res.status(FORBIDDEN).json({ error: "answer all questions before reward can be claimed" });
      return;
    }

    const notCompletedLesson = await lessonCompleted.findOne({ status: "in-progress", lesson: lessonId, done: false, user: id });
    if (!notCompletedLesson) {
      res.status(BAD_REQUEST).json({ error: "lesson has been completed or does not exist" });
      return;
    }

    notCompletedLesson.status = "completed";
    notCompletedLesson.done = true;

    await user.updateOne({ _id: id }, { $inc: { xp: lessonExists.reward } });
    await notCompletedLesson.save();

    res.status(OK).json({ message: "xp reward claimed" });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error rewarding lesson xp" });
  }
}

export const getLessons = async (req: GlobalRequest, res: GlobalResponse) => {
  try {
    const lessons = await lesson.find().lean();
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
    const lessons = await lesson.find().lean();
    res.status(OK).json({ message: "lessons fetched!", lessons });
  } catch (error) {
    logger.error(error);
    res.status(INTERNAL_SERVER_ERROR).json({ error: "error getting lessons" });
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

    const miniLessons = await miniLesson.find({ lesson: lessonId }).sort({ createdAt: 1 }).lean();
    const questions = await question.find({ lesson: lessonId }).sort({ createdAt: 1 }).lean();

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

    const miniLessons = await miniLesson.find({ lesson: lessonId }).lean();

    const questions = await question.find({ lesson: lessonId }).select("options question lesson").lean();
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

    const questionAlreadyAnswered = await questionCompleted.findOne({ question: questionId, lesson: lessonId, user: id });
    if (!questionAlreadyAnswered) {
      if (lowerAnswer !== questionExists.solution) {
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

    if (lowerAnswer !== questionExists.solution) {
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

