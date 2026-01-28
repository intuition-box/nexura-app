import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Play, CheckCircle2, RotateCcw } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import { getStoredAccessToken, apiRequestV2, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../lib/auth";

type Quest = {
  text: string;
  _id: string;
  done: boolean;
  tag: string;
  reward: string;
  link: string;
  status: string;
};

const questsInitial: Quest[] = [
  { done: false, tag: "", status: "", _id: "id-like", text: "Like this Nexura tweet", reward: "40 XP", link: "https://x.com/i.status/1997778439366115502" },
  { done: false, tag: "comment", status: "", _id: "id-comment", text: "Comment on this Nexura tweet", reward: "40 XP", link: "https://x.com/i.status/1997778439366115502" },
  { done: false, tag: "", status: "", _id: "id-repost", text: "Repost this Nexura tweet", reward: "40 XP", link: "https://x.com/i.status/1997778439366115502" },
  { done: false, tag: "", status: "", _id: "id-tribe", text: "Support or Oppose the #Tribe Claim on Intuition Portal", reward: "100 XP", link: "https://portal.intuition.systems/explore/triple/0xdce8ebb5bdb2668732d43cce5eca85d6a5119fd1bc92f36dd85998ab48ce7a63?tab=positions" },
  { done: false, tag: "", status: "", _id: "id-tns", text: "Support or Oppose the TNS Claim on Intuition Portal", reward: "140 XP", link: "https://portal.intuition.systems/explore/triple/0xd9c06c57fced2eafcc71a6b46ad9acd58e6b035e7ccc2dc6eebc00f8ba71172f?tab=positions" },
  { done: false, tag: "", status: "", _id: "id-sofia", text: "Support or Oppose the Sofia Claim on Intuition Portal", reward: "140 XP", link: "https://portal.intuition.systems/explore/triple/0x98ba47f4d18ceb7550c6c593ef92835864f0c0e09d6e56108feac8a8a6012038?tab=positions" },
];

export default function QuestEnvironment() {
  const [miniQuests, setMiniQuests] = useState<Quest[]>(questsInitial);
  const [totalXP, setTotalXP] = useState(0);
  const { user } = useAuth();
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [proofLinks, setProofLinks] = useState<Record<string, string>>({});

  const userId = user?._id || "";

  const [questNumber, setQuestNumber] = useState<string>("000");
  const [sub_title, setSubTitle] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);
  // const [miniQuestsCompleted, setMiniQuestsCompleted] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [visitedQuests, setVisitedQuests] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('nexura:quest:visited') || '{}')[userId] || [];
  });
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
  const [retryQuests, setRetryQuests] = useState<string[]>([]);
  const [pendingQuests, setPendingQuests] = useState<string[]>([]);
  const [failedQuests, setFailedQuests] = useState<string[]>([]);
  const completedQuestsCount = miniQuests.filter(
    (q) => q.done || claimedQuests.includes(q._id)
  ).length;

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
        questCompleted: comp
      } = await apiRequestV2("GET", `/api/quest/fetch-mini-quests?id=${questId}`);

      setCompleted(comp);
      // setMiniQuestsCompleted();
      setMiniQuests(quests);
      setTotalXP(totalXp);
      setQuestNumber(quest_no);
      setTitle(t);
      setSubTitle(st);
    })();
  }, []);

  useEffect(() => {
    if (!userId || !questId) return;

    const visited =
      JSON.parse(localStorage.getItem("nexura:quest:visited") || "{}")[userId] || [];

    setVisitedQuests(visited);
  }, [userId]);

  useEffect(() => {
    const value: Record<string, string[]> = {};
    value[userId] = visitedQuests;

    if (userId) {
      localStorage.setItem('nexura:quest:visited', JSON.stringify(value))
    }

  }, [visitedQuests, userId]);

  const miniQuestsCompleted = miniQuests.filter((m) => m.done === true).length === miniQuests.length;

  const claimQuestReward = async () => {
    try {
      await apiRequestV2("POST", `/api/quest/claim-quest?id=${questId}`);

      setCompleted(true);
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

      if (!getStoredAccessToken()) {
        toast({ title: "Error", description: "You must be logged in to claim rewards.", variant: "destructive" });
        return;
      }

      if (claimedQuests.includes(miniQuest._id)) {
        toast({ title: "Already Claimed", description: "Task already completed", variant: "destructive" });
        return;
      }

      if (miniQuest.tag === "comment") {
        toast({
          title: "Manual verification required",
          description: "Submit proof instead.",
          variant: "destructive",
        });
        return;
      }


      const id = getId(miniQuest.link);
      // const isSubmitProof = quest.tag === "comment";

      try {
        // if (["follow", "repost"].includes(miniQuest.tag)) {
        //   if (!user?.socialProfiles.x.connected) {
        //     throw new Error("x not connected yet, go to profile to connect.");
        //   }
        //   const { success } = await apiRequestV2("POST", "/api/check-x", { id, tag: miniQuest.tag, questId: miniQuest._id, page: "quest" });
        //   if (!success) {
        //     // alert(`Kindly ${miniQuest.tag !== "follow" ? miniQuest.tag + " the post" : "follow the account"}`);
        //     throw new Error(`Kindly ${miniQuest.tag !== "follow" ? miniQuest.tag + " the post" : "follow the account"}`);
        //   }
        // } else 
        if (["join", "message"].includes(miniQuest.tag)) {
          if (!user?.socialProfiles.discord.connected) {
            // toast({ title: "Error", description: "discord not connected yet, go to profile to connect", variant: "destructive" });
            throw new Error("discord not connected yet, go to profile to connect");
          }

          const { success } = await apiRequestV2("POST", "/api/check-discord", { channelId: id, tag: miniQuest.tag });
          if (!success) {
            // toast({ title: "Error", description: `Kindly ${miniQuest.tag} the discord channel`, variant: "destructive"});
            throw new Error(`Kindly ${miniQuest.tag} the discord channel`);
          }
        } else if (miniQuest.tag === "portal") {
          await apiRequestV2("POST", "/api/quest/check-portal-task", { termId: id, id: miniQuest._id, questId, page: "quest" });
        }
      } catch (error: any) {
        console.error(error);
        // toast({title: "Error", description: error.message, variant: "destructive" });
        throw new Error(error.message);
      }

      const res = await apiRequest("POST", `/api/quest/claim-mini-quest`, { id: miniQuest._id, questId });
      if (!res.ok) return;

      setClaimedQuests((prev) => [...prev, miniQuest._id]);

      setMiniQuests((prev) =>
        prev.map((q) =>
          q._id === miniQuest._id ? { ...q, done: true } : q
        )
      );

      // window.location.reload();
    } catch (error: any) {
      console.error(error);
      setMiniQuests(prev => prev.map(q => q._id === miniQuest._id ? { ...q, status: "retry" } : q));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const retryQuest = async (quest: Quest) => {
    try {
      const link = proofLinks[quest._id];
      if (!link) {
        toast({
          title: "Missing link or username",
          description: "Please paste your comment link or twitter username.",
          variant: "destructive",
        });
        return;
      }

      await apiRequestV2("POST", "/api/quest/update-submission", { submissionLink: link, miniQuestId: quest._id });

      setExpandedQuestId(null);
      setPendingQuests([...pendingQuests, quest._id]);

      toast({
        title: "Submitted",
        description: "Your proof has been submitted for review.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const visitQuest = (quest: Quest) => {
    if (!visitedQuests.includes(quest._id)) setVisitedQuests([...visitedQuests, quest._id]);
    if (quest.link) window.open(quest.link, "_blank");

    if (quest.status === "retry") {
      setRetryQuests([...retryQuests, quest._id]);
      setMiniQuests(prev => prev.map(q => q._id === quest._id ? { ...q, status: "" } : q));
    }
  };

  const submitCommentProof = async (quest: Quest) => {
    const link = proofLinks[quest._id];

    if (!link) {
      toast({
        title: "Missing link or username",
        description: "Please paste your comment link or twitter username.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!user?.socialProfiles.x.connected) {
        throw new Error("X not connected yet, go to profile to connect.");
      }

      await apiRequestV2("POST", "/api/quest/submit-quest", {
        questId,
        id: quest._id,
        submissionLink: link,
        page: "quest",
        tag: quest.tag,
      });

      toast({
        title: "Submitted",
        description: "Your proof has been submitted for review.",
      });

      setExpandedQuestId(null);
      setPendingQuests([...pendingQuests, quest._id]);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };


  const renderQuestRow = (quest: Quest, index: number) => {
    const visited = visitedQuests.includes(quest._id);
    const claimed = quest.done || claimedQuests.includes(quest._id);
    const pending = quest.status === "pending" || pendingQuests.includes(quest._id);
    const isRetry = quest.status === "retry";
    const isSubmitProof = ["comment", "follow"].includes(quest.tag);
    const isExpanded = expandedQuestId === quest._id;

    return (
      <div
        key={index}
        className="w-full flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-4 transition"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="font-medium text-sm md:text-base">{quest.text}</p>

          {!visited && !claimed && (
            <button
              onClick={() => visitQuest(quest)}
              className="px-5 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-sm font-semibold"
            >
              Start Task
            </button>
          )}

          {visited && !claimed && !isSubmitProof && (
            <button
              onClick={() => claimReward(quest)}
              className="px-5 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-sm font-semibold"
            >
              Claim
            </button>
          )}

          {visited && isSubmitProof && !claimed && !pending && (
            <button
              onClick={() =>
                setExpandedQuestId(isExpanded ? null : quest._id)
              }
              className="px-5 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-sm font-semibold"
            >
              Submit Proof
            </button>
          )}

          {claimed && (
            <span className="text-sm text-green-400 font-semibold">Completed</span>
          )}
          {!claimed && pending && (
            <span className="text-sm text-white font-semibold">Pending Verification</span>
          )}

          {isRetry && !claimed && (
            <button
              onClick={() => visitQuest(quest)}
              className="px-5 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-sm font-semibold"
            >
              Retry
            </button>
          )}

          {/* {pending && <button disabled={true} className="text-sm text-white bg-white/10 font-semibold">Pending</button>} */}
        </div>

        {/* DROPDOWN PROOF INPUT */}
        {isExpanded && (
          <div className="mt-3 bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-white/70">
              ⚠️ It may take 10 minutes to 24 hours to validate your submission.
            </p>
            <input
              type="url"
              placeholder="Paste your comment link or twitter username here"
              value={proofLinks[quest._id] || ""}
              onChange={(e) =>
                setProofLinks({
                  ...proofLinks,
                  [quest._id]: e.target.value,
                })
              }
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-purple-500"
            />

            <button
              onClick={() => retryQuests.includes(quest._id) ? retryQuest(quest) : submitCommentProof(quest)}
              className="w-full bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 
                 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800
                 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Submit For Review
            </button>
          </div>
        )}
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
                disabled={!miniQuestsCompleted || completed}
                className={`w-full font-semibold rounded-xl py-3 mt-6 
                  ${miniQuestsCompleted || !completed || claimedQuests.length === miniQuests.length
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-600 cursor-not-allowed text-gray-300"
                  }`
                }
              >
                {!completed ? "Claim Rewards" : "Completed"}
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