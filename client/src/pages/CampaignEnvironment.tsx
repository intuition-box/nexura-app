import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { apiRequestV2, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Quest = {
  quest: string;
  reward: number;
  _id: string;
  link: string;
  done: boolean;
};

const campaignQuestsInitial: Quest[] = [
  { _id: "quest-id", done: false, quest: "Follow Nexura on X", reward: 100, link: "https://x.com/NexuraXYZ" },
  { _id: "quest-id", done: false, quest: "Join Nexura Discord", reward: 100, link: "https://discord.gg/caK9kATBya" },
  { _id: "quest-id", done: false, quest: "Drop a message on Discord", reward: 100, link: "https://discord.gg/caK9kATBya" },
  { _id: "quest-id", done: false, quest: "Support or Oppose the #Intuitionbilly Claim on Intuition Portal", reward: 100, link: "#" },
  { _id: "quest-id", done: false, quest: "Support or oppose the Nexura claim on Intuition Portal", reward: 100, link: "#" },
  { _id: "quest-id", done: false, quest: "Like and Comment on Nexura Pinned post", reward: 100, link: "#" },
];

export default function CampaignEnvironment() {
  const [quests, setQuests] = useState<Quest[]>(campaignQuestsInitial);
  const [visitedQuests, setVisitedQuests] = useState<String[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:campaign:visited') || '[]');
  });
  const [claimedQuests, setClaimedQuests] = useState<String[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:campaign:claimed') || '[]');
  });
  const [campaignCompleted, setCampaignCompleted] = useState<boolean>(() => {
    return Boolean(JSON.parse(localStorage.getItem('nexura:campaign:completed') || ""));
  });
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [sub_title, setSubTitle] = useState("");
  const [project_name, setProjectName] = useState("");
  const [campaignNumber, setCampaignNumber] = useState("000");
  const [completed, setCompleted] = useState<{questsCompleted: boolean, campaignCompleted: boolean} | null>({ questsCompleted: false, campaignCompleted: false });
  const [reward, setReward] = useState<{trustTokens: number, xp: number}>({ trustTokens: 0, xp: 0 });

  const { campaignId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const {
        campaignQuests,
        campaignCompleted,
        description: desc,
        title: t,
        sub_title: st,
        reward: rwd,
        project_name: p_name,
        campaignNumber: campaignNo
      } = await apiRequestV2("GET", `/api/campaign/quests?id=${campaignId}`);

      setQuests(campaignQuests);
      setCompleted(campaignCompleted);
      setDescription(desc);
      setTitle(t);
      setReward(rwd);
      setSubTitle(st);
      setProjectName(p_name);
      setCampaignNumber(campaignNo);

      if (campaignCompleted) {
        for (const key of ['nexura:campaign:visited', 'nexura:campaign:claimed', 'nexura:campaign:completed']) {
          localStorage.removeItem(key);
        }
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexura:campaign:visited', JSON.stringify(visitedQuests))
  }, [visitedQuests]);
  useEffect(() => {
    localStorage.setItem('nexura:campaign:claimed', JSON.stringify(claimedQuests))
  }, [claimedQuests]);
  useEffect(() => {
    localStorage.setItem('nexura:campaign:completed', JSON.stringify(campaignCompleted))
  }, [campaignCompleted]);

  const claimQuest = async (questId: string) => {
    try {
      // setQuests(prev => {
      //   const quest = prev[index];
      //   let newStatus: Quest["status"] = quest.status;

      //   if (quest.status === "notStarted") {
      //     window.open(quest.link, "_blank");
      //     newStatus = "inProgress";
      //   } else if (quest.status === "inProgress") {
      //     newStatus = "completed";
      //   }

      //   return prev.map((t, i) => i === index ? { ...t, status: newStatus } : t);
      // });

      const res = await apiRequest("POST", `/api/quest/perform-campaign-quest`, { id: questId, campaignId });
      if (!res.ok) return;

      setClaimedQuests([...claimedQuests, questId]);

      // window.location.reload();
    } catch (error: any) {
      toast.error({ title: "Error", description: error.message, variant: "destructive" })
    }
  };

  const claimCampaignReward = async () => {
    try {
      await apiRequestV2("POST", `/api/campaign/complete-campaign?id=${campaignId}`);

      setCampaignCompleted(true);

      // window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const markQuestAsVisted = (quest: Quest) => {
    window.open(quest.link, "_blank");
    setVisitedQuests([...visitedQuests, quest._id]);
  }

  const completedQuests = quests.filter(q => q.done === true).length;
  const progressPercentage = Math.round((completedQuests / quests.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0615] text-white relative p-6">
      <AnimatedBackground />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10">

        {/* Banner with Progress */}
        <div className="w-full bg-gradient-to-r from-purple-700/40 to-purple-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="uppercase text-xs opacity-60">{title}</p>
              <p className="text-xl font-semibold">{sub_title}</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm opacity-70 uppercase">Total XP</p>
              <div className="bg-purple-600/30 border border-purple-500/40 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="font-bold">
                  {reward.xp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mt-3">
            <div
              className="h-3 bg-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm opacity-60 mt-1">{progressPercentage}% completed</p>
        </div>

        {/* Main Quest Card */}
        <Card className="rounded-2xl bg-white/5 border-white/10 overflow-hidden shadow-xl">
          <div className="grid grid-cols-2">
            <div className="h-full">
              <img src="/campaign.png" alt="Quest" className="w-full h-full object-cover" />
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs opacity-50 uppercase mb-1">{project_name}</p>
                <p className="text-xl font-bold leading-tight">Campaign {campaignNumber}:<br />{sub_title}</p>
                <div className="mt-4">
                  <p className="uppercase text-xs opacity-50">Start Campaign Quest</p>
                  <p className="text-sm opacity-80 leading-relaxed mt-1">
                    {description}.
                  </p>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs opacity-50 uppercase">Rewards</p>
                  <p className="text-sm">{reward.trustTokens} TRUST + {reward.xp} XP</p>
                </div>
              </div>

              <Button
                onClick={() => claimCampaignReward()}
                disabled={!completed?.questsCompleted || !(claimedQuests.length === quests.length) || completed?.campaignCompleted || campaignCompleted}
                className={`w-full font-semibold rounded-xl py-3 mt-6 
                  ${completed?.questsCompleted || claimedQuests.length === quests.length || !completed?.campaignCompleted || !campaignCompleted
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-600 cursor-not-allowed text-gray-300"
                  }`
                }
              >
                {completed?.questsCompleted || claimedQuests.length === quests.length
                  ? completed?.campaignCompleted || campaignCompleted
                    ? "Completed"
                    : "Claim Rewards"
                  : "Complete Quests"
                }
              </Button>
            </div>
          </div>
        </Card>

        {/* Quests List */}
        <div className="space-y-6">
          {quests.map((quest, index) => {
            const visited = visitedQuests.includes(quest._id);

            let buttonText = "Start Quest";
            if (visited) buttonText = `Claim`;
            if (quest.done || claimedQuests.includes(quest._id)) buttonText = "Completed";

            return (
              <div
                key={index}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-white">
                    {quest.done ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4" />}
                  </div>
                  <span className="font-medium">{quest.quest}</span>
                </div>

                <button
                  disabled={quest.done || claimedQuests.includes(quest._id)}
                  onClick={() => !visited ? markQuestAsVisted(quest) : claimQuest(quest._id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    quest.done || claimedQuests.includes(quest._id) ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
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
  );
}