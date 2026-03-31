"use client";

import { useLocation } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import learnIcon from "/learn-icon.png";
import xpRewardIcon from "/xp-reward.png";
import { useEffect, useState } from "react";
import { useWallet } from "../hooks/use-wallet"; 
import { useAuth } from "../lib/auth";

const lessons = [
  {
    id: "intro-to-web3",
    title: "Introduction to Web3",
    description:
    "Learn how the internet evolved into Web3, how blockchain enables ownership and transparency and how trust is verified through decentralized layer.",
    progress: "1/9",
    progressWidth: "11%",
    image: "/learn-image.png",
    icon: "/intro.png",
    xp: "/xp-500.png",
  },
];

export default function Learn() {

  const { address, isConnected, connectWallet } = useWallet();
const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const walletAddress = "0x123";
  const storageKey = `learn-progress-${walletAddress}`;
  const [progressData, setProgressData] = useState({});
  const [xpClaimed, setXpClaimed] = useState(false);

useEffect(() => {
  const loadProgress = () => {
    const stored = JSON.parse(localStorage.getItem(storageKey)) || {};
    setProgressData(stored);
  };

  loadProgress();

  window.addEventListener("progress-update", loadProgress);

  return () => {
    window.removeEventListener("progress-update", loadProgress);
  };
}, [storageKey]);

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {lessons.map((lesson) => {
              const progress = progressData[lesson.id]?.progress || 0;
              const quizCompleted = progressData[lesson.id]?.quizCompleted === true;
              const isCompleted = progress === 9 && quizCompleted;

const isInProgress = progress > 0 && !isCompleted;
const isNotStarted = progress === 0;
              const percent = (progress / 9) * 100;

              return (
              <div
              onClick={() => setLocation(`/learn/intro-to-web3`)}
                key={lesson.id}
                className="rounded-2xl overflow-hidden bg-[#1C0E3480] border border-white/10 cursor-pointer hover:scale-[1.02] transition"
              >

                {/* Image */}
                <div className="relative">
                  <img
                    src={lesson.image}
                    alt="Lesson"
                    className="w-full h-36 object-cover"
                  />

<div
  className="absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold"
  style={{
    color: "#00CCF933",
    background: "#000000A6",
    boxShadow: "0px 3px 10px 0px rgba(0, 0, 0, 0.5)",
  }}
>
  {isCompleted
    ? "COMPLETED"
    : isInProgress
    ? "IN PROGRESS"
    : "NOT STARTED"}
</div>

                  <img
                    src={lesson.icon}
                    alt="Intro"
                    className="absolute bottom-2 left-2 w-6 h-6 object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">

                  <h3 className="text-sm font-bold text-white">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-white/70 leading-relaxed">
                    {lesson.description}
                  </p>

                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>PROGRESS</span>
                    <span>{progress}/9 LESSONS</span>
                  </div>

<div className="w-full h-1 bg-white rounded-3xl overflow-hidden">
  <div
    className="h-full rounded-3xl"
    style={{
      width: `${percent}%`,
      background: "linear-gradient(90deg, #94E2FF, #8A3FFC)",
    }}
  />
</div>


<div className="flex justify-between items-center pt-1">
  {/* XP Image */}
  <img
    src={isCompleted ? "/xp-claimed.png" : lesson.xp}
    alt="XP"
    className="w-16 object-contain"
  />


<button
  onClick={async (e) => {
    e.stopPropagation();

    if (!isConnected) {
      // Prompt wallet connection first
      await connectWallet();
      return;
    }

    if (!user) {
      alert("You must sign in to start this lesson."); 
      return;
    }

    const url = isCompleted
      ? `/learn/${lesson.id}?review=1`
      : `/learn/${lesson.id}`;
    setLocation(url);
  }}
  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#8B3EFE] text-white text-xs transition-all duration-200 hover:scale-105 hover:bg-[#7A2FE0]"
>
  {isCompleted ? "REVIEW →" : isInProgress ? "CONTINUE →" : "START →"}
</button>
                  </div>

                </div>

              </div>
            )}
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
