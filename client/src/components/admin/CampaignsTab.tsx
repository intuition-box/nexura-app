"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Link, useLocation } from "wouter";
import { projectApiRequest, getStoredProjectInfo } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";
import { useWallet } from "../../hooks/use-wallet";
import { ArrowDownToLine, RefreshCw, Trash2, XCircle, Loader2, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { apiRequestV2 } from "../../lib/queryClient";
import { closeRewardCampaign, getRewardCampaignCreator, getRewardContractBalance, syncRewardContractStartDate } from "../../lib/performOnchainAction";
import { formatEther } from "viem";
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
  description?: string;
  nameOfProject?: string;
  projectCoverImage?: string;
  starts_at: string;
  ends_at: string;
  status?: string;
  isDraft?: boolean;
  contractAddress?: string;
  rewardsDeployment?: {
    txHash?: string;
    fundedAmount?: number;
    rewardPerParticipant?: number;
    maxClaimableParticipants?: number;
    remainderWithdrawalTxHash?: string;
    remainderWithdrawnAmount?: number;
    remainderWithdrawnAt?: string;
  };
  reward?: { xp?: number; pool?: number; trust?: number };
}

type PendingAction = { type: "delete" | "close" | "reopen"; id: string; title: string } | null;

export default function CampaignsTab() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "upcoming" | "drafts" | "completed">("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [reopeningId, setReopeningId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [rewardBalances, setRewardBalances] = useState<Record<string, bigint>>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { address, isConnected, connectWallet } = useWallet();

  const info = getStoredProjectInfo();
  const isSuperAdmin = (info?.role as string) === "superadmin";
  const isHubAdmin = isSuperAdmin || (info?.role as string) === "admin";
  const formatTrustAmount = (amountWei: bigint) => {
    const formatted = formatEther(amountWei);
    const numeric = Number(formatted);
    return Number.isFinite(numeric)
      ? numeric.toLocaleString(undefined, { maximumFractionDigits: 4 })
      : formatted;
  };

  useEffect(() => {
    apiRequestV2("GET", `/api/server-time`)
      .then((res: any) => setServerOffset(res.serverTime - Date.now()))
      .catch(() => {});
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectApiRequest<{ hubCampaigns?: Campaign[] }>({
        method: "GET",
        endpoint: "/hub/get-campaigns",
      });
      setCampaigns(res.hubCampaigns ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load campaigns.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const nowMs = Date.now() + serverOffset;
  const now = new Date(nowMs);

  const isDraft = (c: Campaign) => c.status === "Save";
  const isEnded = (c: Campaign) => c.status === "Ended";
  const isCompleted = (c: Campaign) => isEnded(c) || (!!c.ends_at && new Date(c.ends_at) <= now);
  const isScheduled = (c: Campaign) => !isDraft(c) && !isCompleted(c) && !!c.starts_at && new Date(c.starts_at) > now;
  const isActiveCampaign = (c: Campaign) => !isDraft(c) && !isScheduled(c) && !isCompleted(c);
  const isReopenable = (c: Campaign) => isEnded(c) && (!!c.ends_at ? new Date(c.ends_at) > now : true);

  useEffect(() => {
    const currentNow = new Date(Date.now() + serverOffset);
    const completedRewardCampaigns = campaigns.filter((campaign) => {
      const campaignCompleted = campaign.status === "Ended" || (!!campaign.ends_at && new Date(campaign.ends_at) <= currentNow);
      return campaignCompleted && !!campaign.contractAddress && Number(campaign.reward?.pool ?? 0) > 0;
    });

    if (completedRewardCampaigns.length === 0) {
      setRewardBalances({});
      return;
    }

    let cancelled = false;

    const loadBalances = async () => {
      const entries = await Promise.all(
        completedRewardCampaigns.map(async (campaign) => {
          try {
            const balance = await getRewardContractBalance(campaign.contractAddress as string);
            return [campaign._id, balance] as const;
          } catch (error) {
            console.error(`Failed to load rewards contract balance for campaign ${campaign._id}:`, error);
            return [campaign._id, 0n] as const;
          }
        })
      );

      if (cancelled) return;

      setRewardBalances(
        entries.reduce<Record<string, bigint>>((acc, [campaignId, balance]) => {
          acc[campaignId] = balance;
          return acc;
        }, {})
      );
    };

    void loadBalances();

    return () => {
      cancelled = true;
    };
  }, [campaigns, serverOffset]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setPendingAction(null);
    try {
      await projectApiRequest({ method: "DELETE", endpoint: "/hub/delete-campaign", params: { id } });
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
      await projectApiRequest({ method: "PATCH", endpoint: "/hub/close-campaign", params: { id } });
      toast({ title: "Campaign closed", description: "The campaign has been closed successfully." });
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to close campaign.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setClosingId(null);
    }
  };

  const handleReopen = async (campaign: Campaign) => {
    const id = campaign._id;
    const rewardsContractSettled = Boolean(campaign.rewardsDeployment?.remainderWithdrawalTxHash);

    if (rewardsContractSettled) {
      toast({
        title: "Reopen blocked",
        description: "This rewards campaign cannot be reopened because its remaining funds have already been withdrawn.",
        variant: "destructive",
      });
      setPendingAction(null);
      return;
    }

    setReopeningId(id);
    setPendingAction(null);
    try {
      if (campaign.contractAddress && Number(campaign.reward?.pool ?? 0) > 0) {
        const contractStartTimestamp = Math.floor(new Date(campaign.starts_at).getTime() / 1000);

        if (Number.isFinite(contractStartTimestamp) && contractStartTimestamp > 0) {
          await syncRewardContractStartDate(campaign.contractAddress, contractStartTimestamp);
        }
      }

      await projectApiRequest({ method: "PATCH", endpoint: "/hub/reopen-campaign", params: { id } });
      toast({ title: "Campaign reopened", description: "The campaign has been reopened successfully." });
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reopen campaign.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setReopeningId(null);
    }
  };

  const handleWithdrawRemainder = async (campaign: Campaign) => {
    if (!campaign.contractAddress) {
      toast({ title: "No rewards contract", description: "This campaign does not have a rewards contract attached.", variant: "destructive" });
      return;
    }

    setWithdrawingId(campaign._id);
    try {
      let connectedAddress = address;
      if (!isConnected || !connectedAddress) {
        connectedAddress = await connectWallet({ noReload: true });
      }
      if (!connectedAddress) {
        throw new Error("Connect the wallet that deployed this rewards contract to withdraw the remainder.");
      }

      const campaignCreator = await getRewardCampaignCreator(campaign.contractAddress);
      if (campaignCreator.toLowerCase() !== connectedAddress.toLowerCase()) {
        throw new Error(`Switch to the contract creator wallet ${campaignCreator.slice(0, 6)}...${campaignCreator.slice(-4)} to withdraw the remainder.`);
      }

      const currentBalance = await getRewardContractBalance(campaign.contractAddress);

      const txHash = await closeRewardCampaign(campaign.contractAddress);
      const withdrawnAmount = Number(formatEther(currentBalance));

      const syncResults = await Promise.allSettled([
        campaign.status !== "Ended"
          ? projectApiRequest({ method: "PATCH", endpoint: "/hub/close-campaign", params: { id: campaign._id } })
          : Promise.resolve(null),
        projectApiRequest({
          method: "PATCH",
          endpoint: "/hub/record-campaign-rewards-withdrawal",
          data: {
            id: campaign._id,
            withdrawalTxHash: txHash,
            withdrawnAmount,
          },
        }),
      ]);

      const syncFailure = syncResults.find((result) => result.status === "rejected");

      setRewardBalances((prev) => ({ ...prev, [campaign._id]: 0n }));
      await fetchCampaigns();

      if (syncFailure?.status === "rejected") {
        console.error("Campaign withdrawal sync failed:", syncFailure.reason);
        toast({
          title: "Remainder withdrawn",
          description: `${formatTrustAmount(currentBalance)} TRUST was withdrawn on-chain, but the studio metadata needs a refresh.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Remainder withdrawn",
        description: `${formatTrustAmount(currentBalance)} TRUST was returned from the rewards contract.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to withdraw the remaining rewards.";
      toast({ title: "Withdrawal failed", description: msg, variant: "destructive" });
    } finally {
      setWithdrawingId(null);
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "delete") {
      handleDelete(pendingAction.id);
      return;
    }
    if (pendingAction.type === "close") {
      handleClose(pendingAction.id);
      return;
    }
    const campaignToReopen = campaigns.find((campaign) => campaign._id === pendingAction.id);
    if (!campaignToReopen) {
      toast({ title: "Error", description: "Campaign not found.", variant: "destructive" });
      setPendingAction(null);
      return;
    }
    void handleReopen(campaignToReopen);
  };

  useEffect(() => {
    const scheduled = campaigns.filter((c) => isScheduled(c) && c.starts_at);
    if (scheduled.length === 0) return;

    const tick = () => {
      const currentMs = Date.now() + serverOffset;
      const newCountdowns: Record<string, string> = {};
      let anyExpired = false;

      for (const c of scheduled) {
        const diff = new Date(c.starts_at).getTime() - currentMs;
        if (diff <= 0) {
          anyExpired = true;
          newCountdowns[c._id] = "Starting...";
        } else {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          newCountdowns[c._id] = d > 0 ? `${d}d ${h}h ${m}m ${s}s` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
        }
      }

      setCountdowns(newCountdowns);
      if (anyExpired) fetchCampaigns();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [campaigns, serverOffset, fetchCampaigns]);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return isActiveCampaign(c);
    if (activeTab === "upcoming") return isScheduled(c);
    if (activeTab === "completed") return isCompleted(c);
    if (activeTab === "drafts") return isDraft(c);
    return true;
  });

  const tabs = [
    { id: "all", label: "All Campaigns", count: campaigns.length },
    { id: "active", label: "Active", count: campaigns.filter((c) => isActiveCampaign(c)).length },
    { id: "upcoming", label: "Upcoming", count: campaigns.filter((c) => isScheduled(c)).length },
    { id: "drafts", label: "Drafts", count: campaigns.filter((c) => isDraft(c)).length },
    { id: "completed", label: "Completed", count: campaigns.filter((c) => isCompleted(c)).length },
  ];

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const draft = isDraft(campaign);
    const scheduled = isScheduled(campaign);
    const completed = isCompleted(campaign);
    const rewardsContractSettled = Boolean(campaign.rewardsDeployment?.remainderWithdrawalTxHash);
    const canReopen = isReopenable(campaign) && !rewardsContractSettled;
    const rewardBalance = rewardBalances[campaign._id];
    const rewardBalanceKnown = rewardBalance !== undefined;
    const hasRewardsContract = !!campaign.contractAddress && Number(campaign.reward?.pool ?? 0) > 0;
    const hasWithdrawableRemainder = completed && hasRewardsContract && rewardBalanceKnown && rewardBalance > 0n;
    let status = "Published";
    let statusColor = "bg-green-500";

    if (draft) {
      status = "Draft";
      statusColor = "bg-yellow-500";
    } else if (scheduled) {
      status = "Upcoming";
      statusColor = "bg-blue-500";
    } else if (completed) {
      status = canReopen ? "Closed" : "Completed";
      statusColor = "bg-gray-500";
    }

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
      <Card className="w-full h-full bg-gray-900 text-white rounded-xl overflow-hidden shadow-lg flex flex-col">
        {campaign.projectCoverImage ? (
          <img src={campaign.projectCoverImage} alt={campaign.description || campaign.title} className="w-full h-28 object-cover" />
        ) : (
          <div className="w-full h-28 bg-gray-700 flex items-center justify-center">
            <span className="text-white/50 text-xs">No Image</span>
          </div>
        )}

        <div className="p-3 flex flex-1 flex-col gap-1.5">
          <h3 className="font-bold text-sm truncate" title={campaign.description || campaign.title}>
            {campaign.description || campaign.title}
          </h3>
          <p className="text-white/70 text-xs">
            {formatDate(campaign.starts_at)} - {formatDate(campaign.ends_at)}
          </p>
          {Number(campaign.reward?.pool ?? 0) > 0 && (
            <p className="text-purple-400 text-xs font-medium">Reward Pool: {campaign.reward?.pool} TRUST</p>
          )}
          {completed && hasRewardsContract && (
            <p className="text-emerald-300 text-xs font-medium">
              {rewardBalanceKnown
                ? rewardBalance! > 0n
                  ? `Contract remainder: ${formatTrustAmount(rewardBalance!)} TRUST`
                  : "Reward contract settled"
                : "Checking reward contract..."}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-3">
            <div className="flex gap-1.5 flex-wrap">
              <button
                className="flex-1 px-2 py-1.5 text-xs bg-[#8B3EFE] rounded-lg hover:bg-[#7b35e6] transition"
                onClick={() => setLocation(`/studio-dashboard/create-new-campaign?edit=${campaign._id}`)}
              >
                {isSuperAdmin ? "View Details" : "View"}
              </button>

              {isSuperAdmin && !draft && !completed && (
                <button
                  title="Close campaign"
                  className="px-2 py-1.5 text-xs bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPendingAction({ type: "close", id: campaign._id, title: campaign.description || campaign.title })}
                  disabled={closingId === campaign._id || deletingId === campaign._id || reopeningId === campaign._id}
                >
                  {closingId === campaign._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                </button>
              )}

              {isHubAdmin && completed && hasRewardsContract && !rewardsContractSettled && (
                <button
                  title="Withdraw contract remainder"
                  className="px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-300 rounded-lg hover:bg-emerald-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                  onClick={() => void handleWithdrawRemainder(campaign)}
                  disabled={
                    withdrawingId === campaign._id ||
                    deletingId === campaign._id ||
                    closingId === campaign._id ||
                    reopeningId === campaign._id
                  }
                >
                  {withdrawingId === campaign._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                  <span>{withdrawingId === campaign._id ? "Withdrawing..." : "Withdraw"}</span>
                </button>
              )}

              {isSuperAdmin && (draft || completed) && (
                <button
                  title="Delete campaign"
                  className="px-2 py-1.5 text-xs bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPendingAction({ type: "delete", id: campaign._id, title: campaign.description || campaign.title })}
                  disabled={deletingId === campaign._id || closingId === campaign._id || reopeningId === campaign._id}
                >
                  {deletingId === campaign._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>

            {scheduled ? (
              <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded self-start bg-black/40 border border-purple-500/30">
                <Clock className="w-3 h-3 text-purple-400 animate-pulse" />
                <span className="text-purple-300 font-mono font-semibold">{countdowns[campaign._id] || "Loading..."}</span>
              </div>
            ) : (
              <span className={`px-2 py-0.5 text-[10px] rounded self-start ${statusColor}`}>{status}</span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
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

        <div className="flex border-b border-white/20 gap-4 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-b-2 border-purple-500 text-white" : "text-white/60 hover:text-white"
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
            {activeTab === "all" && isSuperAdmin && (
              <Link
                href="/studio-dashboard/create-new-campaign"
                className="w-full p-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-purple-500 rounded-2xl bg-black hover:bg-black/80 hover:border-[#8B3EFE] transition cursor-pointer no-underline"
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

      <Dialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <DialogContent className="bg-gray-900 border border-white/10 text-white rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle
              className={
                pendingAction?.type === "delete"
                  ? "text-red-400"
                  : pendingAction?.type === "reopen"
                    ? "text-blue-400"
                    : "text-yellow-400"
              }
            >
              {pendingAction?.type === "delete" ? "Delete Campaign" : pendingAction?.type === "reopen" ? "Reopen Campaign" : "Close Campaign"}
            </DialogTitle>
            <DialogDescription className="text-white/60 pt-1">
              {pendingAction?.type === "delete"
                ? (<>This will <span className="text-red-400 font-semibold">permanently delete</span> <span className="text-white font-medium">"{pendingAction?.title}"</span>. This action cannot be undone.</>)
                : pendingAction?.type === "reopen"
                  ? (<>This will reopen <span className="text-white font-medium">"{pendingAction?.title}"</span> and move it back to active or upcoming campaigns.</>)
                  : (<>This will close <span className="text-white font-medium">"{pendingAction?.title}"</span>. It will no longer accept submissions.</>)
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              className={
                pendingAction?.type === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : pendingAction?.type === "reopen"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }
              onClick={confirmAction}
            >
              {pendingAction?.type === "delete" ? "Delete" : pendingAction?.type === "reopen" ? "Reopen Campaign" : "Close Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
