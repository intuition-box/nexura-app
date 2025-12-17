import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getStoredAccessToken, apiRequestV2, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Quest = {
  text: string;
  _id: string;
  done: boolean;
  reward: string;
  link: string;
};

const questsInitial: Quest[] = [
  { done: false, _id: "id-id", text: "Like and Comment on this Nexura tweet", reward: "100 XP", link: "#" },
  { done: false, _id: "id-id", text: "Support or Oppose the #Tribe Claim on Intuition Portal", reward: "100 XP", link: "#" },
  { done: false, _id: "id-id", text: "Support or Oppose the TNS Claim on Intuition Portal", reward: "100 XP", link: "#" },
  { done: false, _id: "id-id", text: "Support or Oppose the Sofia on Intuition Portal", reward: "100 XP", link: "#" },
];

export default function QuestEnvironment() {
  const [miniQuests, setMiniQuests] = useState<Quest[]>(questsInitial);
  const [totalXP, setTotalXP] = useState(0);
  const [questNumber, setQuestNumber] = useState<string>("000");
  const [sub_title, setSubTitle] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
  const [visitedQuests, setVisitedQuests] = useState<string[]>([]);

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
      setMiniQuests(quests);
      setTotalXP(totalXp);
      setQuestNumber(quest_no);
      setTitle(t);
      setSubTitle(st);
    })();
  }, []);

  const claimQuestReward = async () => {
    try {
      await apiRequestV2("POST", `/api/quest/claim-quest?id=${questId}`);

      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error({ title: "Error", description: "Error claiming quest reward", variant: "destructive" });
    }
  }

  const claimReward = async (miniQuestId: string) => {
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
        toast.error({ title: "Error", description: "You must be logged in to claim rewards.", variant: "destructive" });
        return;
      }

      if (!claimedQuests.includes(miniQuestId)) {
        setClaimedQuests([...claimedQuests, miniQuestId]);
      }

      const res = await apiRequest("POST", `/api/quest/claim-mini-quest`, { id: miniQuestId, questId });
      if (!res.ok) return;

      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error({ title: "Error", description: "Failed to claim reward. Please try again.", variant: "destructive" });
    }
  };

  const visitQuest = (quest: Quest) => {
    if (!visitedQuests.includes(quest._id)) setVisitedQuests([...visitedQuests, quest._id]);
    if (quest.link) window.open(quest.link, "_blank");
  };

  const renderQuestRow = (quest: Quest, index: number) => {
    const visited = visitedQuests.includes(quest._id);

    let buttonText = "Start Quest";
    if (visited) buttonText = `Claim`;
    if (quest.done) buttonText = "Completed";

    return (
      <div
        key={index}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
      >
        <p className="font-medium">{quest.text}</p>

        <button
          onClick={() => !visited ? visitQuest(quest) : claimReward(quest._id)}
          className={`px-5 py-2 rounded-full text-sm font-semibold ${
            quest.done ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
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

        {/* Banner */}
        <div className="w-full bg-gradient-to-r from-purple-700/40 to-purple-900/40 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
          <div>
            <p className="uppercase text-xs opacity-60">{title}</p>
            <p className="text-xl font-semibold">{sub_title}</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm opacity-70 uppercase">Total XP</p>
            <div className="bg-purple-600/30 border border-purple-500/40 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="font-bold">{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Main Quest Card */}
        <Card className="rounded-2xl bg-white/5 border-white/10 overflow-hidden shadow-xl">
          <div className="grid grid-cols-2">
            <div className="h-full">
              <img
                src="/campaign.png"
                alt="Quest"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs opacity-50 uppercase mb-1">Nexura</p>
                <p className="text-xl font-bold leading-tight">Quest {questNumber}:<br />{sub_title}</p>

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
                disabled={completed} 
                className={`w-full font-semibold rounded-xl py-3 mt-6 
                  ${completed 
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-600 cursor-not-allowed text-gray-300"
                  }`
                }
              >
                {!completed ? "Claim Rewards" : "Quest Completed"}
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
