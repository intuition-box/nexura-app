import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getStoredAccessToken, apiRequestV2 } from "../lib/queryClient";

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
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
  const [visitedQuests, setVisitedQuests] = useState<string[]>([]);
  
  const { questId } = useParams();

  useEffect(() => {
    (async () => {
      console.log({ questId });

      const quests = await apiRequestV2("GET", `/api/quest/fetch-mini-quests?id=${questId}`);

      setMiniQuests(quests.miniQuests);
      setTotalXP(quests.totalXp);
    })();
  }, []);

  const claimReward = async (miniQuestId: string) => {
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
      alert("You must be logged in to claim rewards.");
      return;
    }

    if (!claimedQuests.includes(miniQuestId)) {
      setClaimedQuests([...claimedQuests, miniQuestId]);
    }

    await apiRequestV2("POST", `/api/quest/claim-mini-quest`, { id: miniQuestId, questId });
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
            <p className="uppercase text-xs opacity-60">Get Started</p>
            <p className="text-xl font-semibold">Join the Guild</p>
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
                <p className="text-xl font-bold leading-tight">Quest 001:<br />Join the Guild</p>

                <div className="mt-4">
                  <p className="uppercase text-xs opacity-50">Start Quest</p>
                  <p className="text-sm opacity-80 leading-relaxed mt-1">
                    Complete simple quests in the Nexura ecosystem and earn rewards.
                  </p>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs opacity-50 uppercase">Rewards</p>
                  <p className="text-sm">`${totalXP} XP`</p>
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 mt-6">
                Complete Quests
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
