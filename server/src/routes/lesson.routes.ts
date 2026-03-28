import { Router } from "express";
import { authenticateUser, authenticateUser2 } from "@/middlewares/auth.middleware";
import {
	getMiniLessonAndQuestions,
	startLesson,
	getLessons,
	rewardLessonXp,
	answerQuestion
} from "@/controllers/lesson.controller";

const router = Router();

router
	.get("/get-lesson-details", authenticateUser2, getMiniLessonAndQuestions)
	.get("/get-lessons", authenticateUser2, getLessons)
	.post("/start-lesson", authenticateUser, startLesson)
	.post("/reward-lesson-xp", authenticateUser, rewardLessonXp)
	.post("/answer-question", authenticateUser, answerQuestion)

export default router;
