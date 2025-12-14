import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, ExternalLink, CheckCircle } from "lucide-react";
import { Play, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnimatedBackground from "@/components/AnimatedBackground";

interface Quest {
  id: string;
  title: string;
  description: string;
  project_name?: string;
  project_image?: string;
  starts_at?: string;
  ends_at?: string;
  metadata?: string;
  reward?: string | { amount: number; currency: string };
  url?: string;
  actionLabel?: string;
  kind?: string;
}

// Only the special tasks card is here
const TASKS_CARD: Quest = {
  id: "tasks-card",
  title: "Start Tasks",
  description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
  project_name: "Intuition Ecosystem",
  reward: "500 XP",
  project_image: "/quest-1.png",
  starts_at: new Date().toISOString(),
  ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(),
  metadata: JSON.stringify({ category: "Tasks" }),
};

// One-time quests
const ONE_TIME_QUESTS: Quest[] = [
  { id: 'onetime-discord-join', title: 'Connect Discord', description: 'Link your Discord account', reward: '50 XP', kind: 'one-time', url: 'https://discord.gg/caK9kATBya', actionLabel: 'Connect Discord', starts_at: new Date().toISOString(), ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toISOString() },
  { id: 'onetime-join-discord', title: 'Join Discord', description: 'Join our Discord server to chat with the community', reward: '50 XP', kind: 'one-time', url: 'https://discord.gg/caK9kATBya', actionLabel: 'Join Discord', starts_at: new Date().toISOString(), ends_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toISOString() },
];

export default function Quests() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [, setLocation] = useLocation();
  const [visitedTasks, setVisitedTasks] = useState<string[]>([]);
  const [claimedTasks, setClaimedTasks] = useState<string[]>([]);

  const { data: quests, isLoading } = useQuery<{
    oneTimeQuests: Quest[];
    dailyQuests: Quest[];
    featuredQuests: Quest[];
  }>({
    queryKey: ["/api/quests"],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/quests`);
      if (!res.ok) throw new Error("Failed to fetch quests");
      return res.json();
    },
  });

  const now = new Date();
  const allQuests: Quest[] = [
    TASKS_CARD,
    ...(quests?.oneTimeQuests?.filter(q => q.id !== "onetime-x-follow" && q.id !== "onetime-discord-join") ?? []),
    ...(quests?.dailyQuests?.filter(q => q.id !== "daily-comment-post") ?? []),
    ...(quests?.featuredQuests?.filter(q => q.id !== "feat-support-claim") ?? []),
  ];

  const activeQuests = allQuests.filter((q) => {
    if (!q.starts_at || !q.ends_at) return true;
    const start = new Date(q.starts_at);
    const end = new Date(q.ends_at);
    return start <= now && now <= end;
  });

  const claimAndAwardXp = (quest: Quest) => {
    if (!claimedTasks.includes(quest.id)) {
      setClaimedTasks([...claimedTasks, quest.id]);
    }
  };

  const visitTask = (quest: Quest) => {
    if (!visitedTasks.includes(quest.id)) setVisitedTasks([...visitedTasks, quest.id]);
    if (quest.url) window.open(quest.url, "_blank");
  };

  const renderQuestCard = (quest: Quest) => {
    let metadata: any = {};
    try {
      metadata = quest.metadata ? JSON.parse(quest.metadata) : {};
    } catch {
      metadata = {};
    }

    const isActive = activeQuests.some((q) => q.id === quest.id);
    const status = isActive ? "Active" : "Coming Soon";

    return (
      <Card
        key={quest.id}
        className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition"
      >
        <div className="relative h-44 bg-black">
          {quest.project_image && (
            <img
              src={quest.project_image}
              alt={quest.title}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3">
            <Badge
              className={
                isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }
            >
              {status}
            </Badge>
          </div>

          {metadata.category && (
            <div className="absolute top-3 left-3 text-xs text-white/80 font-medium">
              {metadata.category}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h2 className="text-lg font-semibold text-white">{quest.title}</h2>
          <p className="text-sm text-gray-400">{quest.description}</p>

          {quest.project_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Project:</span>
              <span className="text-white">{quest.project_name}</span>
            </div>
          )}

          {quest.reward && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rewards:</span>
              <span className="text-white flex items-center space-x-1">
                {typeof quest.reward === "string" ? quest.reward : `${quest.reward.amount} ${quest.reward.currency}`}
              </span>
            </div>
          )}

          <Button
            className="w-full bg-[#1f6feb] hover:bg-[#388bfd] text-white font-medium rounded-xl mt-3"
            onClick={() =>
              isActive &&
              setLocation(
                quest.id === "tasks-card" ? `/quests/${quest.id}` : `/quests/${quest.id}`
              )
            }
          >
            {quest.id === "tasks-card" ? (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Start Tasks
              </>
            ) : isActive ? (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Do Task
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
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quests</h1>
          <p className="text-muted-foreground">
            Complete unique tasks and earn rewards in the Nexura ecosystem.
          </p>
        </div>

        <div className="space-y-6">
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

{/* ONE TIME QUESTS - Updated Design */}
<div className="mt-10">
  <h2 className="text-white text-lg font-semibold">One-Time Quests</h2>
  <p className="text-neutral-400 text-sm mt-1">
    Complete these essential quests to unlock the full NEXURA experience
  </p>

  <div className="mt-6 space-y-4">
    {ONE_TIME_QUESTS.map((quest, index) => {
      const visited = visitedTasks.includes(quest.id);
      const claimed = claimedTasks.includes(quest.id);

      let buttonText = quest.actionLabel || "Start Task";
      if (visited && !claimed) buttonText = `Claim Reward: ${quest.reward}`;
      if (claimed) buttonText = "Completed";

      return (
        <div
          key={quest.id}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-white">
              {claimed ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </div>
            <span className="font-medium">{quest.title}</span>
          </div>

          <button
            onClick={() => {
              if (!visited) visitTask(quest);
              else if (visited && !claimed) claimAndAwardXp(quest);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              claimed ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            {buttonText}
          </button>
        </div>
      );
    })}
  </div>
</div>

      </div>
    </div>
  );
}
