import { useEffect, useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ExternalLink, Clock, Users } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "../components/AnimatedBackground";
import { apiRequestV2 } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../lib/auth";
import { useWallet } from "../hooks/use-wallet";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  project_name: string;
  projectCoverImage: string;
  participants: number;
  maxParticipants?: number;
  starts_at?: string;
  ends_at?: string;
  metadata?: string;
  totalTrustAvailable?: number;
  reward: { trustTokens?: number; trust?: number; xp: number; pool?: number };
  joined: boolean;
  status?: string;
}

// Main TASKS card
const TASKS_CARD: Campaign = {
  _id: "tasks-card",
  title: "Start Campaign Tasks",
  description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
  project_name: "NEXURA",
  joined: false,
  participants: 250,
  reward: { trustTokens: 16, xp: 5, pool: 4000 },
  projectCoverImage: "/campaign.png",
  // starts_at: new Date().toISOString(),
  starts_at: new Date(Date.now() - 86400000).toISOString(), // yesterday

  ends_at: undefined,
  metadata: JSON.stringify({ category: "Tasks" }),
  status: "Active",
};

export const DEV_CAMPAIGNS: Campaign[] = [
  {
    _id: "tasks-card",
    title: "Start Campaign Tasks",
    description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
    project_name: "NEXURA",
    joined: false,
    participants: 250,
    reward: { trustTokens: 16, xp: 5, pool: 4000 },
    projectCoverImage: "/campaign.png",
    starts_at: new Date().toISOString(),
    ends_at: undefined,
    metadata: JSON.stringify({ category: "Tasks" }),
    status: "Active",
  },
  {
    _id: "social-card",
    title: "Social Boost Campaign",
    description: "Engage on social platforms and earn bonus rewards",
    project_name: "NEXURA",
    joined: false,
    participants: 540,
    reward: { trustTokens: 24, xp: 10, pool: 8000 },
    projectCoverImage: "/campaign.png",
    starts_at: new Date().toISOString(),
    ends_at: undefined,
    metadata: JSON.stringify({ category: "Social" }),
    status: "Active",
  },
  {
    _id: "referral-card",
    title: "Referral Sprint",
    description: "Invite friends and climb the leaderboard",
    project_name: "NEXURA",
    joined: false,
    participants: 120,
    reward: { trustTokens: 40, xp: 20, pool: 12000 },
    projectCoverImage: "/campaign.png",
    starts_at: new Date().toISOString(),
    ends_at: undefined,
    metadata: JSON.stringify({ category: "Referral" }),
    status: "Active",
  },
];

export default function Campaigns() {
  const { user } = useAuth();
  const { isConnected: walletConnected, connectWallet } = useWallet();

  const [, setLocation] = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([TASKS_CARD]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingCampaign, setLoadingCampaign] = useState<string | null>(null);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  const { toast } = useToast();

  // Fetch server time offset once
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const res = await apiRequestV2("GET", `/api/server-time`);
        setServerOffset(res.serverTime - Date.now());
      } catch {
        // fallback: assume no offset
      }
    };
    fetchServerTime();
  }, []);

  const fetchCampaignsData = useCallback(async () => {
    try {
      const res = await apiRequestV2("GET", `/api/campaigns`);
      setCampaigns(res.campaigns);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch campaigns initially and every 5 minutes
  useEffect(() => {
    fetchCampaignsData();
    const interval = setInterval(fetchCampaignsData, 300000);
    return () => clearInterval(interval);
  }, [fetchCampaignsData]);

  // Countdown ticker for scheduled campaigns
  useEffect(() => {
    const scheduled = campaigns.filter((c) => c.status === "Scheduled" && c.starts_at);
    if (scheduled.length === 0) return;

    const tick = () => {
      const now = Date.now() + serverOffset;
      const newCountdowns: Record<string, string> = {};
      let anyExpired = false;

      for (const c of scheduled) {
        const diff = new Date(c.starts_at!).getTime() - now;
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
      if (anyExpired) fetchCampaignsData();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [campaigns, serverOffset, fetchCampaignsData]);

  const goToCampaign = async (campaign: Campaign, active: boolean) => {
    if (!active) return;

    try {
      setLoadingCampaign(campaign._id);

      if (!walletConnected || !user) {
        const connectedAddress = await connectWallet({ noReload: true });
        if (!connectedAddress) {
          setLoadingCampaign(null);
          toast({ title: "Wallet required", description: "Please connect and sign in with your wallet to join campaigns.", variant: "destructive" });
          return;
        }
      }

      if (campaign.joined) {
        setLocation(`/campaign/${campaign._id}`);
        setLoadingCampaign(null);
        return;
      }

      await apiRequestV2("POST", `/api/campaign/join-campaign?id=${campaign._id}`);
      setLocation(`/campaign/${campaign._id}`);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoadingCampaign(null);
    }
  };

  const allCampaigns = [...campaigns];

  const activeCampaigns = allCampaigns.filter((c) => c.status === "Active");

  const upcomingCampaigns = allCampaigns.filter((c) => c.status === "Scheduled");

  const renderCampaignCard = (campaign: Campaign, isActive: boolean) => {
    let metadata: any = {};
    try {
      metadata = campaign.metadata ? JSON.parse(campaign.metadata) : {};
    } catch {
      metadata = {};
    }

    const starts_atFormatted = campaign.starts_at
      ? new Date(campaign.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      : "";
    const ends_atFormatted = campaign.ends_at
      ? new Date(campaign.ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      : "TBA";
    const allowedParticipants = campaign.maxParticipants && campaign.maxParticipants > 0
      ? campaign.maxParticipants
      : campaign.participants;
    const trustReward = (campaign.reward?.trustTokens && campaign.reward.trustTokens > 0)
      ? campaign.reward.trustTokens
      : (campaign.reward?.trust && campaign.reward.trust > 0)
      ? campaign.reward.trust
      : (campaign.reward?.pool && allowedParticipants > 0)
      ? Number((campaign.reward.pool / allowedParticipants).toFixed(2))
      : (campaign.totalTrustAvailable && allowedParticipants > 0)
      ? Number((campaign.totalTrustAvailable / allowedParticipants).toFixed(2))
      : 0;

    return (
      <Card
        key={campaign._id}
        className="bg-[#0d1117] h-full border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition flex flex-col"
      >
        {/* Campaign Banner */}
        <div className="relative h-36 bg-black w-full">
          {campaign.projectCoverImage && (
            <img
              src={campaign.projectCoverImage}
              alt={campaign.description || campaign.title}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status Badge / Countdown */}
          <div className="absolute top-2 right-2">
            {isActive ? (
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[0.65rem] sm:text-xs">
                Active
              </Badge>
            ) : (
              <div className="bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-purple-400 animate-pulse" />
                <span className="text-purple-300 text-[0.6rem] sm:text-xs font-mono font-semibold">
                  {countdowns[campaign._id] || "Loading..."}
                </span>
              </div>
            )}
          </div>

          {/* Category */}
          {metadata.category && (
            <div className="absolute top-2 left-2 text-[0.65rem] sm:text-xs text-white/80 font-medium">
              {metadata.category}
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div className="p-3 sm:p-4 flex flex-1 flex-col space-y-1.5">
          <h2 className="text-sm font-semibold text-white">{campaign.description || campaign.title}</h2>

          <div className="flex flex-row justify-between text-xs gap-1">
            <span className="text-gray-500">Project:</span>
            <span className="text-white">{campaign.project_name}</span>
          </div>

          <div className="flex flex-row justify-between text-xs gap-1 items-center">
            <span className="text-gray-500">Participants:</span>
            <span className="text-white flex items-center gap-1">
              <Users className="w-3 h-3" />
              {allowedParticipants.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-row justify-between text-xs items-center">
            <span className="text-gray-500">Reward:</span>
            <span className="text-white flex items-center gap-1">
              {`${trustReward} TRUST + ${campaign.reward.xp} XP`}
            </span>
          </div>

          {campaign.reward.pool && (
            <div className="flex flex-row justify-between text-xs items-center">
              <span className="text-gray-500">Reward Pool:</span>
              <span className="text-white flex items-center gap-1">
                {campaign.reward.pool} TRUST (FCFS)
              </span>
            </div>
          )}

          {campaign.starts_at && (
            <div className="flex flex-row justify-between text-xs items-center">
              <span className="text-gray-500">Duration:</span>
              <span className="text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {starts_atFormatted} – {ends_atFormatted}
              </span>
            </div>
          )}

          <Button
            className={`w-full mt-auto pt-2 py-2 text-xs font-medium rounded-xl ${loadingCampaign === campaign._id
              ? "bg-gray-600 cursor-not-allowed text-gray-300"
              : isActive
                ? "bg-[#1f6feb] hover:bg-[#388bfd] text-white"
                : "bg-gray-600 cursor-not-allowed text-gray-300"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              goToCampaign(campaign, isActive);
            }}
            disabled={loadingCampaign === campaign._id || !isActive}
          >
            {loadingCampaign === campaign._id ? (
              <>Joining...</>
            ) : isActive && (!walletConnected || !user) ? (
              <>Connect Wallet</>
            ) : isActive ? (
              <>
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Join Campaign
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Starts in {countdowns[campaign._id] || "..."}
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
      <div className="max-w-4xl sm:max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Campaigns</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2">Campaigns</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete unique tasks and earn rewards in the Nexura ecosystem.
          </p>
        </div>

        {/* Active Campaigns */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-2xl font-semibold text-white">Active Campaigns</h2>
          {isLoading ? (
            <div className="text-center py-6 sm:py-12 text-muted-foreground">Loading campaigns...</div>
          ) : activeCampaigns.length === 0 ? (
            <Card className="glass glass-hover rounded-3xl p-6 sm:p-8 text-center">
              <p className="text-white/60">No active campaigns at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {activeCampaigns.map((campaign) => renderCampaignCard(campaign, true))}
            </div>
          )}
        </div>

        {/* Upcoming Campaigns */}
        {upcomingCampaigns.length > 0 && (
          <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">Upcoming Campaigns</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {upcomingCampaigns.map((campaign) => renderCampaignCard(campaign, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};