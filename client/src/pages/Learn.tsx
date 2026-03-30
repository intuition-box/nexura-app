"use client";

import { useLocation } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import learnIcon from "/learn-icon.png";
import xpRewardIcon from "/xp-reward.png";
import { useEffect, useState } from "react";
import { useWallet } from "../hooks/use-wallet"; 
import { useAuth } from "../lib/auth";
import { apiRequestV2 } from "../lib/queryClient";
import { Loader2 } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  reward: number;
  noOfQuestions: number;
  done: boolean;
  createdAt: string;
}

export default function Learn() {
  const { isConnected, connectWallet } = useWallet();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const json = await apiRequestV2("GET", "/api/lesson/get-lessons");
        if (json.lessons) {
          setLessons(json.lessons);
        }
      } catch (err: any) {
        console.error("Error fetching lessons:", err);
        setError(err.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchLessons();
    }
  }, [authLoading]);

  const handleStartLesson = async (lessonId: string, isDone: boolean) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!user) {
      alert("You must sign in to start this lesson.");
      return;
    }

    const url = isDone ? `/learn/${lessonId}?review=1` : `/learn/${lessonId}`;
    setLocation(url);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
              Learn
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-slide-up delay-100">
            Learn
          </h1>

          <p className="text-sm text-white/50 leading-relaxed animate-slide-up delay-200">
            Educational content and tutorials about Web3, blockchain, and the Intuition ecosystem.
          </p>
        </div>

        {/* Top Card */}
        <Card
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-4 animate-slide-up delay-300"
          style={{
            background: "linear-gradient(135deg, #2A085E 0%, #3D0F8A 100%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

              <div className="flex-1 space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Explore Learning Hub
                </h2>

                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  Access interactive tutorials, video guides, and structured learning paths, build knowledge, track your progress, and earn XP as you complete lessons.
                </p>

                <button>
                  <img
                    src={xpRewardIcon}
                    alt="XP Rewards"
                    className="w-32 sm:w-32 object-contain"
                  />
                </button>
              </div>

              <div className="flex-shrink-0">
                <img
                  src={learnIcon}
                  alt="Learn Icon"
                  className="w-32 sm:w-40 object-contain"
                />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Available Lessons */}
        <div className="space-y-6">

          <div className="flex items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white whitespace-nowrap">
              Available Lessons
            </h2>
            <div className="flex-1 h-[1px] bg-[#FFFFFF33]"></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : error ? (
            <Card className="rounded-2xl p-6 bg-red-500/10 border-red-500/20">
              <p className="text-red-400 text-center">{error}</p>
            </Card>
          ) : lessons.length === 0 ? (
            <Card className="rounded-2xl p-8 bg-white/5 border-white/10">
              <p className="text-white/60 text-center">No lessons available yet. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  onClick={() => handleStartLesson(lesson._id, lesson.done)}
                  className="rounded-2xl overflow-hidden bg-[#1C0E3480] border border-white/10 cursor-pointer hover:scale-[1.02] transition"
                >

                  {/* Image Placeholder */}
                  <div className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 h-36 flex items-center justify-center">
                    <div
                      className="absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold"
                      style={{
                        color: lesson.done ? "#00FF88" : "#00CCF933",
                        background: "#000000A6",
                        boxShadow: "0px 3px 10px 0px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {lesson.done ? "COMPLETED" : "NOT STARTED"}
                    </div>
                    <span className="text-4xl">📚</span>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-3">

                    <h3 className="text-sm font-bold text-white">
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                      {lesson.description}
                    </p>

                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>QUESTIONS</span>
                      <span>{lesson.noOfQuestions} QUESTIONS</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      {/* XP Badge */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-400 font-semibold">+{lesson.reward} XP</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartLesson(lesson._id, lesson.done);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#8B3EFE] text-white text-xs transition-all duration-200 hover:scale-105 hover:bg-[#7A2FE0]"
                      >
                        {lesson.done ? "REVIEW →" : "START →"}
                      </button>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}