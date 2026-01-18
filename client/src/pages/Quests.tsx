"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ExternalLink, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnimatedBackground from "../components/AnimatedBackground";
import { apiRequestV2, getStoredAccessToken } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";

interface Quest {
  _id: string;
  title: string;
  sub_title: string;
  project_name?: string;
  description?: string;
  done: boolean;
  project_image?: string;
  starts_at?: string;
  ends_at?: string;
  link?: string;
  category: string;
  reward: string;
  url?: string;
  actionLabel?: string;
  status: string;
  tag?: string;
}

const DUMMY_QUESTS: Quest[] = [
  {
    _id: "tasks-card",
    title: "Start Tasks",
    sub_title: "Complete tasks to earn XP and unlock new features",
    done: false,
    description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
    project_name: "Intuition Ecosystem",
    reward: "500",
    project_image: "/quest-1.png",
    starts_at: new Date().toISOString(),
    ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    category: "Weekly",
    status: "active"
  },
  {
    _id: "social-card",
    title: "Social Boost",
    sub_title: "Engage on social platforms to earn rewards",
    done: false,
    description: "Like, share, and comment to earn XP",
    project_name: "Nexura Social",
    reward: "300",
    project_image: "/quest-2.png",
    starts_at: new Date().toISOString(),
    ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 180).toISOString(),
    category: "Daily",
    status: "active"
  },
  {
    _id: "referral-card",
    title: "Referral Sprint",
    sub_title: "Invite friends and climb the leaderboard",
    done: false,
    description: "Earn XP for each successful referral",
    project_name: "Nexura Referral",
    reward: "800",
    project_image: "/quest-3.png",
    starts_at: new Date().toISOString(),
    ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    category: "Weekly",
    status: "active"
  }
];

export default function Quests() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const userId = user?._id || "";

  const [visitedTasks, setVisitedTasks] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:one-time-quest:visited') || '[]')[userId] || [];
  });
  const [claimedTasks, setClaimedTasks] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:one-time-quest:claimed') || '[]')[userId] || [];
  });

  const { toast } = useToast();

  const { data: quests, isLoading } = useQuery<{
    oneTimeQuests: Quest[];
    weeklyQuests: Quest[];
    featuredQuests: Quest[];
  }>({
    queryKey: ["/api/quests"],
    queryFn: async () => {
      const res = await apiRequestV2("GET", "/api/quests");
      return res;
    },
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = visitedTasks;
    localStorage.setItem('nexura:one-time-quest:visited', JSON.stringify(value));
  }, [visitedTasks]);

  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = claimedTasks;
    localStorage.setItem('nexura:one-time-quest:claimed', JSON.stringify(value));
  }, [claimedTasks]);

  const allQuests: Quest[] = DUMMY_QUESTS;

  const activeQuests = allQuests.filter((q) => q.status === "active");
  const upcomingQuests = allQuests.filter((q) => q.status === "upcoming");

  const renderQuestCard = (quest: Quest, isActive: boolean = true, index: number = 0) => {
    return (
      <motion.div
        key={quest._id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      >
        <Card className="bg-[#0d1117] border border-white/5 rounded-xl overflow-hidden transition hover:shadow-lg flex flex-col">
          {/* Image / Badge Section */}
          <div className="relative w-full h-44 sm:h-40 flex-shrink-0">
            <img
              src={quest.project_image ?? "/quest-1.png"}
              alt={quest.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute top-2 right-2">
              <Badge className="text-xs">{isActive ? "Active" : "Soon"}</Badge>
            </div>
            <div className="absolute top-3 left-3 text-xs text-white/80 font-medium">
              {quest.category}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white line-clamp-2">
              {quest.title}
            </h2>

            <p className="text-xs sm:text-sm text-white/90 line-clamp-2">
              {quest.sub_title}
            </p>

            {quest.project_name && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Project:</span>
                <span className="text-white">{quest.project_name}</span>
              </div>
            )}

            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Reward:</span>
              <span className="text-white font-semibold">{quest.reward} XP</span>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 
                         hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800
                         text-white font-medium rounded-lg mt-2 py-2 flex items-center justify-center space-x-2 
                         active:scale-[0.98] transition-all"
              onClick={() => isActive && setLocation(`/quest/${quest._id}`)}
            >
              {isActive ? (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Start Task</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Coming Soon</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0718] via-[#0a0615] to-black text-white p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="mx-auto space-y-6 relative z-10 max-w-full sm:max-w-6xl px-1 sm:px-0">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Quests</h1>
          <p className="text-white/90 mt-1 sm:mt-2">
            Complete these quests to earn rewards
          </p>
        </div>

        {/* Active Quests */}
        {isLoading ? (
          <div className="text-center py-12 text-white/60">Loading quests...</div>
        ) : activeQuests.length === 0 ? (
          <Card className="glass glass-hover rounded-3xl p-8 text-center">
            <p className="text-white/60">No active quests at the moment. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeQuests.map((quest, i) => renderQuestCard(quest, true, i))}
          </div>
        )}

        {/* Upcoming Quests */}
        {upcomingQuests.length > 0 && (
          <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">Upcoming Quest(s)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingQuests.map((quest, i) => renderQuestCard(quest, false, i))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
