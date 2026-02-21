"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Link, useLocation } from "wouter";
import StudioSidebar from "../../pages/studio/StudioSidebar";
import { projectApiRequest } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";
import { RefreshCw, Trash2, XCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

interface Campaign {
  _id: string;
  title: string;
  nameOfProject?: string;
  projectCoverImage?: string;
  starts_at: string;
  ends_at: string;
  status?: string;
  isDraft?: boolean;
  reward?: { xp?: number; pool?: number; trust?: number };
}

type PendingAction = { type: "delete" | "close"; id: string; title: string } | null;

export default function CampaignsTab() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "drafts" | "completed">("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectApiRequest<{ projectCampaigns?: Campaign[] }>({
        method: "GET",
        endpoint: "/project/get-campaigns",
      });
      setCampaigns(res.projectCampaigns ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load campaigns.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setPendingAction(null);
    try {
      await projectApiRequest({ method: "DELETE", endpoint: "/project/delete-campaign", params: { id } });
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      toast({ title: "Campaign deleted", description: "The campaign has been removed." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete campaign.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleClose = async (id: string) => {
    setClosingId(id);
    setPendingAction(null);
    try {
      await projectApiRequest({ method: "PATCH", endpoint: "/project/close-campaign", params: { id } });
      toast({ title: "Campaign closed", description: "The campaign has been closed successfully." });
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to close campaign.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setClosingId(null);
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "delete") handleDelete(pendingAction.id);
    else handleClose(pendingAction.id);
  };

  const now = new Date();

  const isDraft = (c: Campaign) => c.status === "Save" || !c.status;

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !isDraft(c) && new Date(c.ends_at) > now;
    if (activeTab === "completed") return !isDraft(c) && new Date(c.ends_at) <= now;
    if (activeTab === "drafts") return isDraft(c);
    return true;
  });

  const tabs = [
    { id: "all", label: "All Campaigns", count: campaigns.length },
    { id: "active", label: "Active", count: campaigns.filter(c => !isDraft(c) && new Date(c.ends_at) > now).length },
    { id: "drafts", label: "Drafts", count: campaigns.filter(c => isDraft(c)).length },
    { id: "completed", label: "Completed", count: campaigns.filter(c => !isDraft(c) && new Date(c.ends_at) <= now).length },
  ];

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const draft = isDraft(campaign);
    let status = "Published";
    let statusColor = "bg-green-500";

    if (draft) {
      status = "Draft";
      statusColor = "bg-yellow-500";
    } else if (new Date(campaign.ends_at) <= now) {
      status = "Completed";
      statusColor = "bg-gray-500";
    }

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const isActive = !draft && new Date(campaign.ends_at) > now;

    return (
      <Card className="w-full bg-gray-900 text-white rounded-2xl overflow-hidden shadow-lg flex flex-col">
        {campaign.projectCoverImage ? (
          <img src={campaign.projectCoverImage} alt={campaign.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
            <span className="text-white/50 text-sm">No Image</span>
          </div>
        )}

        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-bold text-lg">{campaign.title}</h3>
          <p className="text-white/70 text-sm">
            {formatDate(campaign.starts_at)} – {formatDate(campaign.ends_at)}
          </p>
          {campaign.reward?.pool !== undefined && (
            <p className="text-purple-400 font-medium">Reward Pool: {campaign.reward.pool} TRUST</p>
          )}

          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              className="flex-1 px-3 py-2 text-sm bg-purple-600 rounded-lg hover:bg-purple-700 transition"
              onClick={() => setLocation(`/studio-dashboard/create-new-campaign?edit=${campaign._id}`)}
            >
              View Details
            </button>
            {isActive && (
              <button
                title="Close campaign"
                className="px-3 py-2 text-sm bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPendingAction({ type: "close", id: campaign._id, title: campaign.title })}
                disabled={closingId === campaign._id || deletingId === campaign._id}
              >
                {closingId === campaign._id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <XCircle className="w-4 h-4" />}
              </button>
            )}
            <button
              title="Delete campaign"
              className="px-3 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPendingAction({ type: "delete", id: campaign._id, title: campaign.title })}
              disabled={deletingId === campaign._id || closingId === campaign._id}
            >
              {deletingId === campaign._id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />}
            </button>
          </div>

          <span className={`px-2 py-1 text-xs rounded mt-2 self-start ${statusColor}`}>{status}</span>
        </div>
      </Card>
    );
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-screen flex">
        <StudioSidebar
          activeTab="campaignsTab"
          setActiveTab={(tab) => {
            if (tab === "campaignSubmissions") setLocation("/studio-dashboard");
            if (tab === "campaignsTab") setLocation("/studio-dashboard/create-new-campaign");
            if (tab === "adminManagement") setLocation("/studio-dashboard");
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-[18rem] p-4 md:p-6 space-y-6 pt-16 md:pt-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Nexura Studio</h1>
            <p className="text-white/60 text-lg">Track and manage your community engagement campaigns</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white"
            onClick={fetchCampaigns}
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 gap-4 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-purple-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/60">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading campaigns...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* "Create New Campaign" Card (only on "all" tab) */}
            {activeTab === "all" && (
              <Link
                href="/studio-dashboard/create-new-campaign"
                className="w-full p-6 flex flex-col items-center justify-center gap-3
                           border-2 border-dashed border-purple-500 rounded-2xl
                           bg-white/10 backdrop-blur-md hover:bg-white/15 hover:border-purple-400
                           transition cursor-pointer no-underline"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-2xl font-bold">+</div>
                <p className="font-semibold text-white text-center text-lg">Create New Campaign</p>
                <p className="text-white/60 text-center text-sm">Launch a New Campaign now</p>
              </Link>
            )}

            {filteredCampaigns.length === 0 ? (
              <p className="text-white/60 col-span-full">No campaigns found.</p>
            ) : (
              filteredCampaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <DialogContent className="bg-gray-900 border border-white/10 text-white rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className={pendingAction?.type === "delete" ? "text-red-400" : "text-yellow-400"}>
              {pendingAction?.type === "delete" ? "Delete Campaign" : "Close Campaign"}
            </DialogTitle>
            <DialogDescription className="text-white/60 pt-1">
              {pendingAction?.type === "delete"
                ? (<>This will <span className="text-red-400 font-semibold">permanently delete</span> <span className="text-white font-medium">"{pendingAction?.title}"</span>. This action cannot be undone.</>)
                : (<>This will close <span className="text-white font-medium">"{pendingAction?.title}"</span>. It will no longer accept submissions.</>)
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white"
              onClick={() => setPendingAction(null)}
            >
              Cancel
            </Button>
            <Button
              className={pendingAction?.type === "delete"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"}
              onClick={confirmAction}
            >
              {pendingAction?.type === "delete" ? "Delete" : "Close Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
