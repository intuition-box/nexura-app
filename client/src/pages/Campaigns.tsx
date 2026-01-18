import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ExternalLink, Clock, Users } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "../components/AnimatedBackground";
import { apiRequestV2 } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  project_name: string;
  projectCoverImage: string;
  participants: number;
  starts_at?: string;
  ends_at?: string;
  metadata?: string;
  reward: { trustTokens: number; xp: number; pool?: number };
  joined: boolean;
  status?: string;
}

// Main TASKS card
// const TASKS_CARD: Campaign = {
//   _id: "tasks-card",
//   title: "Start Campaign Tasks",
//   description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
//   project_name: "NEXURA",
//   joined: false,
//   participants: 250,
//   reward: { trustTokens: 16, xp: 5, pool: 4000 },
//   projectCoverImage: "/campaign.png",
//   // starts_at: new Date().toISOString(),
//   starts_at: new Date(Date.now() - 86400000).toISOString(), // yesterday

//   ends_at: undefined,
//   metadata: JSON.stringify({ category: "Tasks" }),
//   status: "Active",
// };

const DEV_CAMPAIGNS: Campaign[] = [
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
  const [, setLocation] = useLocation();
  // const [campaigns, setCampaigns] = useState<Campaign[]>([TASKS_CARD]);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEV_CAMPAIGNS);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState<string | null>(null);

  const { toast } = useToast();

  // Fetch campaigns initially and every 5 minutes
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await apiRequestV2("GET", `/api/campaigns`);
        setCampaigns(res.campaigns);
        setIsLoading(false);
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
        setIsLoading(false);
      }
    };

    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 300000);
    return () => clearInterval(interval);
  }, []);

  const goToCampaign = async (campaign: Campaign, active: boolean) => {
    if (!active) return;

    try {
      setLoadingCampaign(campaign._id);

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

  const now = new Date();
  const allCampaigns = [...campaigns];

  const activeCampaigns = allCampaigns.filter((c) => {
    const start = c.starts_at ? new Date(c.starts_at) : null;
    const end = c.ends_at ? new Date(c.ends_at) : null;

    if (c.status?.toLowerCase() === "active") return true;
    if (start && now >= start) {
      if (end) return now <= end;
      return true;
    }
    return false;
  });

  const upcomingCampaigns = allCampaigns.filter((c) => c.status === "Upcoming");

  const renderCampaignCard = (campaign: Campaign, isActive: boolean) => {
  let metadata: any = {};
  try {
    metadata = campaign.metadata ? JSON.parse(campaign.metadata) : {};
  } catch {
    metadata = {};
  }

  const status = isActive ? "Active" : "Coming Soon";

  const starts_atFormatted = campaign.starts_at
    ? new Date(campaign.starts_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "";

  const ends_atFormatted = campaign.ends_at
    ? new Date(campaign.ends_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "TBA";

  return (
    <motion.div
      key={campaign._id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="mx-3 sm:mx-0 bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-transform md:hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-36 sm:h-44 w-full">
          <img
            src={campaign.projectCoverImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Status */}
          <div className="absolute top-2 right-2">
            <Badge
              className={
                isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 text-[0.65rem]"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[0.65rem]"
              }
            >
              {status}
            </Badge>
          </div>

          {/* Category */}
          {metadata.category && (
            <div className="absolute top-2 left-2 text-[0.65rem] text-white/80 font-medium">
              {metadata.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-semibold text-white leading-tight">
              {campaign.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
              {campaign.description}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Project</span>
              <span className="text-white">{campaign.project_name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Participants</span>
              <span className="text-white flex items-center gap-1">
                <Users className="w-3 h-3" />
                {campaign.participants.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Reward</span>
              <span className="text-white font-medium">
                {campaign.reward.trustTokens} TRUST + {campaign.reward.xp} XP
              </span>
            </div>

            {campaign.starts_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {starts_atFormatted} – {ends_atFormatted}
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <Button
            className={`mt-auto w-full py-3 text-sm font-medium rounded-xl ${
              loadingCampaign === campaign._id
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : isActive
                ? "bg-gradient-to-r from-purple-700 to-indigo-700 hover:opacity-90 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
            disabled={loadingCampaign === campaign._id || !isActive}
            onClick={(e) => {
              e.stopPropagation();
              goToCampaign(campaign, isActive);
            }}
          >
            {loadingCampaign === campaign._id ? (
              "Joining..."
            ) : isActive ? (
              <span className="flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Join Campaign
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Coming Soon
              </span>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />
      <div className="max-w-4xl sm:max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Campaigns</h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeCampaigns.map((campaign) => renderCampaignCard(campaign, true))}
            </div>
          )}
        </div>

        {/* Upcoming Campaigns */}
        {upcomingCampaigns.length > 0 && (
          <div className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">Upcoming Campaigns</h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingCampaigns.map((campaign) => renderCampaignCard(campaign, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};