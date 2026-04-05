// @ts-nocheck
"use client";

import { useLocation } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import learnIcon from "/learn-icon.png";
import xpRewardIcon from "/xp-reward.png";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "../hooks/use-wallet";
import { useAuth } from "../lib/auth";
import { apiRequestV2 } from "../lib/queryClient";

type LessonCard = {
  _id: string;
  title: string;
  description: string;
  reward: number;
  noOfQuestions: number;
  done?: boolean;
  status?: "draft" | "published";
  coverImage?: string;
  profileImage?: string;
  createdAt?: string;
};

type StoredLessonProgress = {
  progress?: number;
  totalQuestions?: number;
  quizCompleted?: boolean;
  stepIndex?: number;
};

const getProgressStorageKey = (walletAddress?: string | null) =>
  `learn-progress-${walletAddress?.toLowerCase() || "guest"}`;

const getStatusLabel = (isCompleted: boolean, hasStarted: boolean) => {
  if (isCompleted) return "COMPLETED";
  if (hasStarted) return "IN PROGRESS";
  return "NOT STARTED";
};

const sortLessons = (items: LessonCard[]) => [...items].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));

export default function Learn() {
  const { address, isConnected, connectWallet } = useWallet();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const storageKey = useMemo(() => getProgressStorageKey(address), [address]);

  const [lessons, setLessons] = useState<LessonCard[]>([]);
  const [progressData, setProgressData] = useState<Record<string, StoredLessonProgress>>({});
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const loadProgress = () => {
      let stored: Record<string, StoredLessonProgress> = JSON.parse(localStorage.getItem(storageKey) || "{}");
      // If wallet-specific key has no data, fallback to guest key
      if (Object.keys(stored).length === 0 && storageKey !== "learn-progress-guest") {
        const guestStored: Record<string, StoredLessonProgress> = JSON.parse(localStorage.getItem("learn-progress-guest") || "{}");
        if (Object.keys(guestStored).length > 0) {
          stored = { ...guestStored };
        }
      }
      // Also read step positions from wallet-namespaced and old shared keys as fallback signals
      const walletStepKey = `tenor-lesson-steps-${address?.toLowerCase() || "guest"}`;
      const stepSources = [walletStepKey, "tenor-lesson-steps"];
      for (const key of stepSources) {
        const stepData: Record<string, { stepIndex?: number }> = JSON.parse(localStorage.getItem(key) || "{}");
        for (const lessonId of Object.keys(stepData)) {
          const stepEntry = stepData[lessonId];
          if (stepEntry?.stepIndex != null && stepEntry.stepIndex > 0) {
            stored[lessonId] = {
              ...(stored[lessonId] || {}),
              stepIndex: Math.max(stepEntry.stepIndex, stored[lessonId]?.stepIndex ?? 0),
            };
          }
        }
      }
      setProgressData(stored);
    };

    loadProgress();
    window.addEventListener("storage", loadProgress);
    window.addEventListener("progress-update", loadProgress);
    return () => {
      window.removeEventListener("storage", loadProgress);
      window.removeEventListener("progress-update", loadProgress);
    };
  }, [storageKey, address]);

  useEffect(() => {
    const loadLessons = async () => {
      setLoadingLessons(true);
      setPageError("");

      try {
        const response = await apiRequestV2("GET", "/api/lesson/get-lessons");
        const normalizedLessons = sortLessons(
          (response?.lessons || []).filter((lesson: LessonCard) => lesson.status === "published")
        );
        setLessons(normalizedLessons);
      } catch (error) {
        setPageError(error?.message || "Failed to load lessons.");
        setLessons([]);
      } finally {
        setLoadingLessons(false);
      }
    };

    void loadLessons();
  }, []);

  return (
    <div className="min-h-screen overflow-auto bg-black p-6 text-white relative">
      <AnimatedBackground />

      <div className="relative z-10 w-full space-y-12">
        <div className="space-y-1">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">Learn</span>
          </div>

          <h1 className="mb-2 text-3xl font-extrabold text-transparent sm:mb-4 sm:text-4xl bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text animate-slide-up delay-100">
            Learn
          </h1>

          <p className="animate-slide-up delay-200 text-sm leading-relaxed text-white/50">
            Educational content and tutorials about Web3, blockchain, and the Intuition ecosystem.
          </p>
        </div>

        <Card
          className="rounded-2xl p-4 sm:rounded-3xl animate-slide-up delay-300"
          style={{
            background: "linear-gradient(135deg, #2A085E 0%, #3D0F8A 100%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Explore Learning Hub</h2>

                <p className="text-sm leading-relaxed text-white/90 sm:text-base">
                  Access interactive tutorials, video guides, and structured learning paths, build knowledge,
                  track your progress, and earn XP as you complete lessons.
                </p>

                <button type="button">
                  <img src={xpRewardIcon} alt="XP Rewards" className="w-32 object-contain sm:w-32" />
                </button>
              </div>

              <div className="flex-shrink-0">
                <img src={learnIcon} alt="Learn Icon" className="w-32 object-contain sm:w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="whitespace-nowrap text-lg font-semibold text-white sm:text-xl">Available Lessons</h2>
            <div className="h-[1px] flex-1 bg-[#FFFFFF33]" />
          </div>

          {pageError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {pageError}
            </div>
          ) : null}

          {loadingLessons ? (
            <div className="rounded-2xl border border-white/10 bg-[#1C0E3480] p-6 text-sm text-white/60">
              Loading lessons...
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#1C0E3480] p-6 text-sm text-white/60">
              No lessons are available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => {
                const storedProgress = progressData[lesson._id] || {};
                const totalQuestions = Math.max(
                  Number(storedProgress.totalQuestions || lesson.noOfQuestions || 0),
                  Number(lesson.noOfQuestions || 0),
                  1
                );
                const progress = lesson.done
                  ? totalQuestions
                  : Math.min(Number(storedProgress.progress || 0), totalQuestions);
                const isCompleted = Boolean(lesson.done || storedProgress.quizCompleted);
                // Treat stepIndex > 0 as "started" even if no questions are completed yet
                const hasStarted = progress > 0 || (storedProgress.stepIndex ?? 0) > 0;
                const percent = totalQuestions > 0 ? (progress / totalQuestions) * 100 : 0;
                const buttonLabel = isCompleted ? "LEARN →" : hasStarted ? "CONTINUE →" : "START →";

                return (
                  <div
                    key={lesson._id}
                    onClick={() => setLocation(`/learn/${lesson._id}${isCompleted ? "?review=1" : ""}`)}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#1C0E3480] transition hover:scale-[1.02] flex flex-col"
                  >
                    <div className="relative">
                      <img
                        src={lesson.coverImage || "/learn-image.png"}
                        alt={lesson.title}
                        className="h-36 w-full object-cover"
                      />

                      <div
                        className="absolute right-2 top-2 px-2 py-1 text-[10px] font-semibold"
                        style={{
                            color: "#00CCF9",
                            background: "#00CCF933",
                          boxShadow: "0px 3px 10px 0px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        {getStatusLabel(isCompleted, hasStarted)}
                      </div>

                      <img
                        src={lesson.profileImage || "/intro.png"}
                        alt={`${lesson.title} profile`}
                        className="absolute bottom-2 left-2 h-8 w-8 rounded-md object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-3 p-3 flex-1">
                      <h3 className="text-sm font-bold text-white">{lesson.title}</h3>

                      <p className="line-clamp-3 text-xs leading-relaxed text-white/70">{lesson.description}</p>

                      <div className="mt-auto">
                        <div className="flex justify-between text-[10px] text-white/60">
                          <span>PROGRESS</span>
                          <span>
                            {progress}/{totalQuestions} LESSONS
                          </span>
                        </div>

                        <div className="h-1 w-full overflow-hidden rounded-3xl bg-white mt-2">
                          <div
                            className="h-full rounded-3xl"
                            style={{
                              width: `${percent}%`,
                              background: "linear-gradient(90deg, #94E2FF, #8A3FFC)",
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {isCompleted ? (
                          <div className="rounded-full border border-[#8B3EFE66] bg-[#8B3EFE33] px-3 py-1 text-[11px] font-semibold text-[#E7D8FF] shadow-[0_0_20px_rgba(139,62,254,0.18)]">
                            {lesson.reward} XP Claimed
                          </div>
                        ) : (
                            <div className="rounded-full border border-[#8B3EFE66] bg-[#8B3EFE33] px-3 py-1 text-[11px] font-semibold text-[#E7D8FF] shadow-[0_0_20px_rgba(139,62,254,0.18)]">
                            +{lesson.reward} XP
                          </div>
                        )}

                        <button
                          onClick={async (event) => {
                            event.stopPropagation();

                            if (!isConnected) {
                              await connectWallet();
                              return;
                            }

                            if (!user) {
                              alert("You must sign in to start this lesson.");
                              return;
                            }

                            setLocation(`/learn/${lesson._id}${isCompleted ? "?review=1" : ""}`);
                          }}
                          className="flex items-center gap-1 rounded-full bg-[#8B3EFE] px-3 py-1 text-xs text-white transition-all duration-200 hover:scale-105 hover:bg-[#7A2FE0]"
                        >
                          {buttonLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
