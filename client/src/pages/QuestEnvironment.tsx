import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, RotateCcw } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getStoredAccessToken, apiRequestV2, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../lib/auth";

type Quest = {
  text: string;
  _id: string;
  done: boolean;
  tag: string;
  reward: string;
  link: string;
};

const questsInitial: Quest[] = [
  { done: false, _id: "id-like", text: "Like this Nexura tweet", reward: "40 XP", link: "#" },
  { done: false, _id: "id-comment", text: "Comment on this Nexura tweet", reward: "40 XP", link: "#" },
  { done: false, _id: "id-repost", text: "Repost this Nexura tweet", reward: "40 XP", link: "#" },
  { done: false, _id: "id-tribe", text: "Support or Oppose the #Tribe Claim on Intuition Portal", reward: "100 XP", link: "#" },
  { done: false, _id: "id-tns", text: "Support or Oppose the TNS Claim on Intuition Portal", reward: "140 XP", link: "#" },
  { done: false, _id: "id-sofia", text: "Support or Oppose the Sofia Claim on Intuition Portal", reward: "140 XP", link: "#" },
];


export default function QuestEnvironment() {
  const [miniQuests, setMiniQuests] = useState<Quest[]>(questsInitial);
  const [totalXP, setTotalXP] = useState(0);
  const { user } = useAuth();

  const userId = user?._id || "";

  const [questNumber, setQuestNumber] = useState<string>("000");
  const [sub_title, setSubTitle] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);
  // const [miniQuestsCompleted, setMiniQuestsCompleted] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [visitedQuests, setVisitedQuests] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:quest:visited') || '[]')[userId] || [];
  });
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:quest:claimed') || '[]')[userId] || [];
  });
  const [questCompleted, setQuestCompleted] = useState<boolean>(() => {
    try { return Boolean(JSON.parse(localStorage.getItem('nexura:quest:completed') || "")[userId]); } catch (error) { return false }
  });
  const [failedQuests, setFailedQuests] = useState<string[]>([]);
  const completedQuestsCount = miniQuests.filter((q) => q.done || claimedQuests.includes(q._id)).length;

  const progressPercentage = miniQuests.length
    ? Math.round((completedQuestsCount / miniQuests.length) * 100)
    : 0;

  const { questId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const {
        miniQuests: quests,
        totalXp,
        title: t,
        questNumber: quest_no,
        sub_title: st,
        questCompleted
      } = await apiRequestV2("GET", `/api/quest/fetch-mini-quests?id=${questId}`);

      setCompleted(questCompleted);
      // setMiniQuestsCompleted();
      setMiniQuests(quests);
      setTotalXP(totalXp);
      setQuestNumber(quest_no);
      setTitle(t);
      setSubTitle(st);
    })();
  }, []);

  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = visitedQuests;

    localStorage.setItem('nexura:quest:visited', JSON.stringify(value))
  }, [visitedQuests]);
  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = claimedQuests;

    localStorage.setItem('nexura:quest:claimed', JSON.stringify(value))
  }, [claimedQuests]);
  useEffect(() => {
    const value: Record<string, boolean> = {};
    value[userId] = questCompleted;

    localStorage.setItem('nexura:quest:completed', JSON.stringify(value))
  }, [questCompleted]);

  const miniQuestsCompleted = miniQuests.filter((m) => m.done === true).length === miniQuests.length;

  const claimQuestReward = async () => {
    try {
      await apiRequestV2("POST", `/api/quest/claim-quest?id=${questId}`);

      setQuestCompleted(true);
      // window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const getId = (url: string) => {
    return url.split("/").pop(); // return the last item in the array
  }

  const claimReward = async (miniQuest: Quest) => {
    try {
      // const quest = quests[index];

      // if (quest.status === "notStarted") {
      //   // Open quest link
      //   window.open(quest.link, "_blank");
      //   setQuests(prev => prev.map((t, i) => i === index ? { ...t, status: "inProgress" } : t));
      // } else if (quest.status === "inProgress") {
      //   // Claim reward
      //   setQuests(prev => prev.map((t, i) => i === index ? { ...t, status: "completed" } : t));
      //   setTotalXP(prev => prev + parseInt(quest.reward));
      // }

      if (!getStoredAccessToken()) {
        toast({ title: "Error", description: "You must be logged in to claim rewards.", variant: "destructive" });
        return;
      }

      if (!claimedQuests.includes(miniQuest._id)) {
        setClaimedQuests([...claimedQuests, miniQuest._id]);
      } else {
        toast({ title: "Already Claimed", description: "Task already completed", variant: "destructive" });
        return;
      }

      const id = getId(miniQuest.link);

      try {
        if (["like", "follow", "comment", "repost"].includes(miniQuest.tag)) {
          if (!user?.socialProfiles.x.connected) {
            throw new Error("x not connected yet, go to profile to connect.");
          }
          const { success } = await apiRequestV2("POST", "/api/check-x", { id, tag: miniQuest.tag, questId: miniQuest._id });
          if (!success) {
            // alert(`Kindly ${miniQuest.tag !== "follow" ? miniQuest.tag + " the post" : "follow the account"}`);
            throw new Error(`Kindly ${miniQuest.tag !== "follow" ? miniQuest.tag + " the post" : "follow the account"}`);
          }
        } else if (["join", "message"].includes(miniQuest.tag)) {
          if (!user?.socialProfiles.discord.connected) {
            // toast({ title: "Error", description: "discord not connected yet, go to profile to connect", variant: "destructive" });
            throw new Error("discord not connected yet, go to profile to connect");
          }

          const { success } = await apiRequestV2("POST", "/api/check-discord", { channelId: id, tag: miniQuest.tag });
          if (!success) {
            // toast({ title: "Error", description: `Kindly ${miniQuest.tag} the discord channel`, variant: "destructive"});
            throw new Error(`Kindly ${miniQuest.tag} the discord channel`);
          }
        }
      } catch (error: any) {
        console.error(error);
        // toast({title: "Error", description: error.message, variant: "destructive" });
        throw new Error(error.message);
      }

      const res = await apiRequest("POST", `/api/quest/claim-mini-quest`, { id: miniQuest._id, questId });
      if (!res.ok) return;

      // window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const visitQuest = (quest: Quest) => {
    if (!visitedQuests.includes(quest._id)) setVisitedQuests([...visitedQuests, quest._id]);
    if (quest.link) window.open(quest.link, "_blank");
  };

  const renderQuestRow = (quest: Quest, index: number) => {
    const visited = visitedQuests.includes(quest._id);
    const claimed = claimedQuests.includes(quest._id);
    const failed = failedQuests.includes(quest._id);

    let buttonText = "Start Quest";
    if (visited) buttonText = "Claim";
    if (claimed) buttonText = "Completed";

    return (
      <div
        key={index}
        className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 hover:bg-white/10 transition">
        <p className="font-medium text-sm md:text-base leading-snug">
          {quest.text}
        </p>

        <button
          onClick={() => !visited ? visitQuest(quest) : claimReward(quest)}
          className={`w-full md:w-auto px-5 py-2.5 rounded-full text-sm font-semibold ${quest.done || claimedQuests.includes(quest._id)
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-800"
            }`}
        >
          {buttonText}
        </button>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-[#0a0615] text-white relative p-6">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-10">

        {/* Banner with Progress */}
        <div className="w-full bg-gradient-to-r from-purple-700/40 to-purple-900/40 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="uppercase text-[0.6rem] sm:text-xs opacity-60">{title}</p>
              <p className="text-lg sm:text-xl font-semibold">{sub_title}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <p className="text-[0.65rem] sm:text-sm opacity-70 uppercase">Total XP</p>
              <div className="bg-purple-600/30 border border-purple-500/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm">{totalXP} XP</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-white/10 h-2 sm:h-3 rounded-full overflow-hidden mt-2 sm:mt-3">
            <div
              className="h-2 sm:h-3 bg-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[0.65rem] sm:text-sm opacity-60 mt-1">{progressPercentage}% completed</p>
        </div>



        {/* Main Quest Card */}
        <Card className="rounded-2xl bg-white/5 border-white/10 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-48 md:h-full">
              <img
                src="/campaign.png"
                alt="Quest"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 md:p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs opacity-50 uppercase mb-1">Nexura</p>
                <p className="text-lg md:text-xl font-bold leading-tight">Quest {questNumber}:<br />{sub_title}</p>

                <div className="mt-4">
                  <p className="uppercase text-xs opacity-50">Start Quest</p>
                  <p className="text-sm opacity-80 leading-relaxed mt-1">
                    Complete simple quests in the Nexura ecosystem and earn rewards.
                  </p>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs opacity-50 uppercase">Rewards</p>
                  <p className="text-sm">{totalXP} XP</p>
                </div>
              </div>

              <Button
                onClick={() => claimQuestReward()}
                disabled={!miniQuestsCompleted || completed || !(claimedQuests.length === miniQuests.length) || questCompleted}
                className={`w-full font-semibold rounded-xl py-3 mt-6 
                  ${miniQuestsCompleted || !completed || claimedQuests.length === miniQuests.length || !questCompleted
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-600 cursor-not-allowed text-gray-300"
                  }`
                }
              >
                {!completed || !questCompleted ? "Claim Rewards" : "Completed"}
              </Button>
            </div>
          </div>
        </Card>

        <h2 className="text-lg font-semibold opacity-90">Get {totalXP} XP</h2>
        {miniQuests.map((quest, i) => renderQuestRow(quest, i))}
      </div>
    </div>
  );
};