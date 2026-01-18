"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Play, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnimatedBackground from "../components/AnimatedBackground";
import { apiRequestV2, getStoredAccessToken } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../lib/auth";

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

const TASKS_CARD: Quest = {
  _id: "tasks-card",
  title: "Start Tasks",
  done: false,
  sub_title: "Complete tasks to earn XP and unlock new features",
  description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
  project_name: "Intuition Ecosystem",
  reward: "500 XP",
  project_image: "/quest-1.png",
  starts_at: new Date().toISOString(),
  ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(),
  category: "weekly",
  status: "open"
};

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
    refetchInterval: 60000,     // send request every 1m
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = visitedTasks;

    localStorage.setItem('nexura:one-time-quest:visited', JSON.stringify(value))
  }, [visitedTasks]);

  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = claimedTasks;

    localStorage.setItem('nexura:one-time-quest:claimed', JSON.stringify(value))
  }, [claimedTasks]);

  const now = new Date();

  const allQuests: Quest[] = [
    TASKS_CARD,
    ...(quests?.oneTimeQuests ?? []),
    ...(quests?.weeklyQuests ?? []),
    ...(quests?.featuredQuests ?? []),
  ];

  const activeQuests = allQuests.filter((q) => q.status === "active");

  const upcomingQuests = allQuests.filter((q) => q.status === "upcoming");

  // todo: add verifier for other one-time quests

  const visitTask = (quest: Quest) => {
    if (!visitedTasks.includes(quest._id)) setVisitedTasks([...visitedTasks, quest._id]);
    // if (quest.url || quest.link) window.open(quest.url ?? quest.link, "_blank");
    setLocation("/profile/edit");
  };

  const claimAndAwardXp = async (quest: Quest) => {
    if (!getStoredAccessToken()) {
      toast({ title: "Error", description: "You must be logged in to claim rewards.", variant: "destructive" });
      return;
    }

    if (quest.tag === "connect-x") {
      if (!user?.socialProfiles?.x?.connected) {
        toast({ title: "Error", description: "X not connected", variant: "destructive" });
        return
      }
    } else if (quest.tag === "connect-discord") {
      if (!user?.socialProfiles?.discord?.connected) {
        toast({ title: "Error", description: "Discord not connected", variant: "destructive" });
        return
      }
    }

    if (!claimedTasks.includes(quest._id)) {
      setClaimedTasks([...claimedTasks, quest._id]);
    }

    await apiRequestV2("POST", `/api/quest/claim-quest?id=${quest._id}`);
  };

  const renderQuestCard = (quest: Quest, isActive: boolean = true) => {
    const metadata = quest.category ? { category: quest.category } : {};

    return (
      <Card
        key={quest._id}
        className="bg-[#0d1117] border border-white/5 rounded-xl overflow-hidden transition hover:shadow-lg"
      >
        <div className="relative h-52 sm:h-44 bg-black">
          {/* {quest.project_image && ( */}
          <img
            src="/quest-1.png"
            alt={quest.title}
            className="w-full h-full object-cover"
          />
          {/* )} */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute top-2 right-2">
            <Badge className="text-xs">
              {isActive ? "Active" : "Soon"}
            </Badge>
          </div>

          <div className="absolute top-3 left-3 text-xs text-white/80 font-medium">
            {metadata.category}
          </div>
        </div>

        <div className="p-6 sm:p-5 space-y-4 sm:space-y-3">
          <h2 className="text-xl sm:text-lg font-semibold text-white">
            {quest.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
            {quest.sub_title}
          </p>

          {quest.project_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Project:</span>
              <span className="text-white">{quest.project_name ?? "Nexura"}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rewards:</span>
            <span className="text-white flex items-center space-x-1">
              {quest.reward} XP
            </span>
          </div>

          <Button
            className="w-full bg-[#1f6feb] hover:bg-[#388bfd] text-white font-medium rounded-lg mt-2"
            onClick={() =>
              isActive &&
              setLocation(`/quest/${quest._id}`)
            }
          >
            {isActive ? (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Start Tasks
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Coming Soon
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0718] via-[#0a0615] to-black text-white p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="mx-auto space-y-8 relative z-10 max-w-full sm:max-w-6xl px-1 sm:px-0">
        <div>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading quests...</div>
          ) : activeQuests.length === 0 ? (
            <Card className="glass glass-hover rounded-3xl p-8 text-center">
              <p className="text-white/60">No active quests at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeQuests.map((quest) => renderQuestCard(quest))}
            </div>
          )}
        </div>

        {/* Upcoming Quests */}
        {upcomingQuests.length > 0 && (
          <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">Upcoming Quest(s)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingQuests.map((quest) => renderQuestCard(quest, false))}
            </div>
          </div>
        )}

        {/* ONE TIME QUESTS - Updated Design */}
        {/* <div className="mt-10">
          <h2 className="text-white text-lg font-semibold">One-Time Quests</h2>
          {quests?.oneTimeQuests?.length ?? 0 > 0 ?
            <>
              <p className="text-sm text-white/60 mt-1">
                Complete these essential quests to unlock the full NEXURA experience
              </p>

              <div className="mt-4 space-y-3">
                {quests?.oneTimeQuests.map((quest) => {
                  const visited = visitedTasks.includes(quest._id);
                  const claimed = quest.done || claimedTasks.includes(quest._id);

                  let buttonText = quest.actionLabel || "Start Task";
                  if (visited && !claimed) buttonText = `Claim ${quest.reward} XP`;
                  if (claimed) buttonText = "Completed";

                  return (
                    <div
                      key={quest._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          {claimed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-medium">{quest.title}</div>
                          <div className="text-xs text-white/50">
                            {quest.reward} XP
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={claimed}
                        onClick={() => {
                          !visited ? visitTask(quest) : claimAndAwardXp(quest);
                        }}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold ${claimed ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
                          }`}
                      >
                        {buttonText}
                      </button>
                    </div>
                  );
                })}
              </div>
            </> : <p>No one time quest available</p>
          }
        </div> */}

      </div>
    </div>
  );
}
