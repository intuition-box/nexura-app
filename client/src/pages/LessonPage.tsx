import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { apiRequestV2 } from "../lib/queryClient";
import { useWallet } from "../hooks/use-wallet";

type LessonSummary = {
  _id: string;
  title: string;
  description: string;
  reward: number;
  noOfQuestions: number;
  done: boolean;
};

type MiniLesson = {
  _id: string;
  text: string;
  lesson: string;
};

type LessonQuestion = {
  _id: string;
  question: string;
  options: string[];
  lesson: string;
  done: boolean;
  answer?: string;
};

const normalizeApiMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lessonId = params.id;
  const [, setLocation] = useLocation();
  const { isConnected, connectWallet } = useWallet();
  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<LessonSummary | null>(null);
  const [miniLessons, setMiniLessons] = useState<MiniLesson[]>([]);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const completedQuestions = useMemo(
    () => questions.filter((question) => question.done).length,
    [questions]
  );
  const allQuestionsDone = questions.length > 0 && completedQuestions === questions.length;
  const progressPercent = questions.length > 0 ? (completedQuestions / questions.length) * 100 : 0;

  const loadLesson = async () => {
    if (!lessonId) return;

    setLoading(true);
    setPageError("");

    try {
      const [lessonsResponse, detailsResponse] = await Promise.all([
        apiRequestV2("GET", "/api/lesson/get-lessons"),
        apiRequestV2("GET", `/api/lesson/get-lesson-details?id=${lessonId}`),
      ]);

      const lessonMatch = (lessonsResponse.lessons || []).find(
        (entry: LessonSummary) => entry._id === lessonId
      );

      setLesson(lessonMatch || null);
      setMiniLessons(detailsResponse.miniLessons || []);
      setQuestions(detailsResponse.questions || []);
      setSelectedAnswers({});
    } catch (error) {
      setPageError(normalizeApiMessage(error, "Failed to load lesson"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadLesson();
    }
  }, [authLoading, lessonId]);

  const ensureReadyForProtectedAction = async () => {
    if (!isConnected) {
      await connectWallet();
      return false;
    }

    if (!user) {
      setActionMessage("Sign in with your wallet before continuing this lesson.");
      return false;
    }

    return true;
  };

  const startLesson = async () => {
    if (!lessonId) return false;

    const canContinue = await ensureReadyForProtectedAction();
    if (!canContinue) return false;

    setStarting(true);
    setActionMessage("");

    try {
      await apiRequestV2("POST", `/api/lesson/start-lesson?lessonId=${lessonId}`);
      return true;
    } catch (error) {
      const message = normalizeApiMessage(error, "Unable to start lesson");

      if (!message.toLowerCase().includes("already started")) {
        setActionMessage(message);
        return false;
      }

      return true;
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    const answer = selectedAnswers[questionId];
    if (!answer || !lessonId) return;

    const started = await startLesson();
    if (!started) return;

    setSubmittingQuestionId(questionId);
    setActionMessage("");

    try {
      const response = await apiRequestV2("POST", "/api/lesson/answer-question", {
        question: questionId,
        lesson: lessonId,
        answer,
      });

      setActionMessage(response.message || "Correct answer saved.");
      await loadLesson();
    } catch (error) {
      setActionMessage(normalizeApiMessage(error, "Unable to submit answer"));
    } finally {
      setSubmittingQuestionId(null);
    }
  };

  const claimXp = async () => {
    if (!lessonId) return;

    const canContinue = await ensureReadyForProtectedAction();
    if (!canContinue) return;

    setClaiming(true);
    setActionMessage("");

    try {
      const response = await apiRequestV2("POST", `/api/lesson/reward-lesson-xp?id=${lessonId}`);
      setActionMessage(response.message || "XP reward claimed.");
      await loadLesson();
    } catch (error) {
      setActionMessage(normalizeApiMessage(error, "Unable to claim XP"));
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <button onClick={() => setLocation("/learn")} className="text-sm text-purple-300 hover:text-white">
            Back to lessons
          </button>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-300">{pageError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <button onClick={() => setLocation("/learn")} className="text-sm text-purple-300 hover:text-white">
            Back to lessons
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
              Learn
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {lesson?.title || "Lesson"}
          </h1>
          <p className="text-white/70 max-w-2xl">
            {lesson?.description || "Complete each section and answer every question to unlock your XP reward."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-white/50">Progress</p>
              <p className="text-lg font-semibold">{completedQuestions}/{questions.length} questions completed</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-white/50">Reward</p>
              <p className="text-lg font-semibold text-yellow-400">+{lesson?.reward ?? 0} XP</p>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {actionMessage ? (
            <p className="text-sm text-purple-200">{actionMessage}</p>
          ) : null}
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold whitespace-nowrap">Lesson Content</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {miniLessons.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              No lesson content has been added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {miniLessons.map((entry, index) => (
                <article key={entry._id} className="rounded-2xl border border-white/10 bg-[#1C0E3480] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                    Section {index + 1}
                  </p>
                  <p className="mt-3 text-white/85 leading-7 whitespace-pre-wrap">{entry.text}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold whitespace-nowrap">Knowledge Check</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {questions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              No questions have been added to this lesson yet.
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((question, index) => {
                const currentAnswer = selectedAnswers[question._id] ?? question.answer ?? "";
                const isSubmitting = submittingQuestionId === question._id;

                return (
                  <div key={question._id} className="rounded-2xl border border-white/10 bg-[#120B20] p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                          Question {index + 1}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">{question.question}</h3>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          question.done ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/60"
                        }`}
                      >
                        {question.done ? "Completed" : "Pending"}
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = currentAnswer === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={question.done}
                            onClick={() =>
                              setSelectedAnswers((current) => ({
                                ...current,
                                [question._id]: option,
                              }))
                            }
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                              isSelected
                                ? "border-purple-400 bg-purple-500/15 text-white"
                                : "border-white/10 bg-white/5 text-white/80 hover:border-white/20"
                            } ${question.done ? "cursor-default opacity-80" : ""}`}
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-xs font-bold">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {!question.done ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={!selectedAnswers[question._id] || isSubmitting || starting}
                          onClick={() => submitAnswer(question._id)}
                          className="rounded-full bg-[#8B3EFE] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#7A2FE0] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSubmitting ? "Checking..." : "Submit answer"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-300">Correct answer recorded.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#22103F] to-[#12081F] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Claim your reward</h2>
              <p className="text-white/65">
                Finish every question, then claim the lesson reward through the backend lesson API.
              </p>
            </div>
            <button
              type="button"
              disabled={!allQuestionsDone || claiming || lesson?.done}
              onClick={claimXp}
              className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lesson?.done ? "XP Claimed" : claiming ? "Claiming..." : `Claim +${lesson?.reward ?? 0} XP`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
