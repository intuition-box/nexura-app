"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "wouter";
import { RefreshCw, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";

interface Quest {
  _id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  projectCoverImage?: string;
  reward?: { pool?: number };
  status?: string;
}

type PendingAction = { type: "delete" | "close"; id: string; title: string } | null;

// MOCK DATA (since backend removed)
const DUMMY_QUESTS: Quest[] = [
  {
    _id: "1",
    title: "Test Quest",
    description: "Engage with community",
    starts_at: new Date().toISOString(),
    ends_at: new Date().toISOString(),
    status: "Active",
    reward: { pool: 100 },
  },
];

export default function QuestsTab() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "upcoming" | "drafts" | "completed">("all");
  const [quests] = useState<Quest[]>(DUMMY_QUESTS);
  const [loading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const now = new Date();

  const isDraft = (c: Quest) => c.status === "Save";

const isCompleted = (c: Quest) =>
  c.status === "Ended" || new Date(c.ends_at) <= new Date();

const isActive = (c: Quest) =>
  !isDraft(c) && !isCompleted(c);

const filteredQuests = quests.filter((c) => {
  if (activeTab === "all") return true;
  if (activeTab === "active") return isActive(c);
  if (activeTab === "drafts") return isDraft(c);
  if (activeTab === "completed") return isCompleted(c);
  return true;
});

const tabs = [
  { id: "all", label: "All Quests", count: quests.length },
  { id: "active", label: "Active", count: quests.filter(isActive).length },
  { id: "drafts", label: "Drafts", count: quests.filter(isDraft).length },
  { id: "completed", label: "Completed", count: quests.filter(isCompleted).length },
];

  const confirmAction = () => {
    setPendingAction(null);
  };

  const QuestCard = ({ quest }: { quest: Quest }) => (
    <Card className="w-full bg-gray-900 text-white rounded-xl overflow-hidden flex flex-col">
      {quest.projectCoverImage ? (
        <img src={quest.projectCoverImage} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-gray-700 flex items-center justify-center">
          <span className="text-white/50 text-xs">No Image</span>
        </div>
      )}

      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-bold text-sm">{quest.description || quest.title}</h3>

        {Number(quest.reward?.pool ?? 0) > 0 && (
          <p className="text-purple-400 text-xs">Reward: {quest.reward?.pool} TRUST</p>
        )}

        <div className="flex gap-2 mt-2">
          <Button className="bg-[#8B3EFE] text-white text-xs w-full">
            View
          </Button>

          <Button
            variant="ghost"
            className="text-yellow-400"
            onClick={() =>
              setPendingAction({
                type: "close",
                id: quest._id,
                title: quest.description || quest.title,
              })
            }
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <div className="space-y-6 text-white">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quests</h1>
            <p className="text-white/60">Manage your quests</p>
          </div>

          <Button variant="ghost">
            <RefreshCw className={loading ? "animate-spin w-5 h-5" : "w-5 h-5"} />
          </Button>
        </div>

{/* TABS */}
<div className="flex gap-4 border-b border-white/20 pb-2">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id as any)}
      className={`text-sm pb-2 transition ${
        activeTab === tab.id
          ? "text-white border-b-2 border-purple-500"
          : "text-white/60 hover:text-white"
      }`}
    >
      {tab.label} ({tab.count})
    </button>
  ))}
</div>


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">

  {/* CREATE CARD (only on ALL tab) */}
  {activeTab === "all" && (
    <Link href="/user-dashboard/create-new-quest">
      <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-purple-500 rounded-xl bg-black/20 hover:bg-black/30 transition cursor-pointer">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xl font-bold">
          +
        </div>

        <p className="mt-2 text-sm font-semibold text-white text-center">
          Create New Quests
        </p>

        <p className="text-white/50 text-xs text-center">
          Launch new quest
        </p>
      </div>
    </Link>
  )}

  {/* QUEST CARDS */}
  {filteredQuests.map((q) => (
    <QuestCard key={q._id} quest={q} />
  ))}

</div>
</div>

      {/* CONFIRM MODAL */}
      <Dialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>{pendingAction?.type === "close" ? "Close Quest" : "Action"}</DialogTitle>
            <DialogDescription>
              {pendingAction?.title}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setPendingAction(null)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={confirmAction} className="bg-yellow-600">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}