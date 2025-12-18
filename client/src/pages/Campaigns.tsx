import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Clock, Users } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "@/components/AnimatedBackground";
import { apiRequestV2 } from "@/lib/queryClient";

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
const TASKS_CARD: Campaign = {
  _id: "tasks-card",
  title: "Start Campaign Tasks",
  description: "Complete unique tasks in the Nexura ecosystem and earn rewards",
  project_name: "NEXURA",
  joined: false,
  participants: 250,
  reward: { trustTokens: 16, xp: 5, pool: 4000 },
  projectCoverImage: "/campaign.png",
  // reward_pool : ;
  starts_at: new Date("2025-12-05T00:00:00").toISOString(), // 5th December
  ends_at: undefined, // TBA
  metadata: JSON.stringify({ category: "Tasks" }),
};

export default function Campaigns() {
  const [, setLocation] = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const res = await apiRequestV2("GET", `/api/campaigns`);

      setCampaigns(res.campaigns);
      setIsLoading(false);
    })();
  }, []);

  setInterval(async () => {
    const res = await apiRequestV2("GET", `/api/campaigns`);

    setCampaigns(res.campaigns);
    setIsLoading(false);
  }, 300000);

  const goToCampaign = async (campaign: Campaign, active: boolean) => {
    if (!active) return;

    if (!campaign.joined) {
      setLocation(`/campaign/${campaign._id}`);
      return;
    }

    await apiRequestV2("POST", `/api/campaign/join-campaign?id=${campaign._id}`);
    setLocation(`/campaign/${campaign._id}`);
  }

  const now = new Date();

  const allCampaigns: Campaign[] = [
    TASKS_CARD,
    // ...campaigns,
  ];

  const activeCampaigns = allCampaigns.filter((c) => {
    const start = c.starts_at ? new Date(c.starts_at) : null;
    const end = c.ends_at ? new Date(c.ends_at) : null;

    // Active if status is explicitly active OR current date >= start
    // If end is defined, check now <= end
    if (c.status === "active") return true;
    if (start && now >= start) {
      if (end) return now <= end;
      return true; // no end date => active indefinitely
    }
    return false;
  });


  const upcomingCampaigns = allCampaigns.filter((c) => c.status?.toLowerCase() === "upcoming");

  const renderCampaignCard = (campaign: Campaign, isActive: boolean) => {
    let metadata: any = {};
    try {
      metadata = campaign.metadata ? JSON.parse(campaign.metadata) : {};
    } catch {
      metadata = {};
    }

    const status = isActive ? "Active" : "Coming Soon";

    // Format start date
    const starts_atFormatted = campaign.starts_at
      ? new Date(campaign.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      : "";
    const ends_atFormatted = campaign.ends_at
      ? new Date(campaign.ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      : "TBA";


    return (
      <Card
        key={campaign._id}
        className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition"
      >
        {/* Campaign Banner */}
        <div className="relative h-44 bg-black">
          {campaign.projectCoverImage && (
            <img
              src={campaign.projectCoverImage}
              alt={campaign.title}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={
                isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }
            >
              {status}
            </Badge>
          </div>

          {/* Category */}
          {metadata.category && (
            <div className="absolute top-3 left-3 text-xs text-white/80 font-medium">
              {metadata.category}
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-semibold text-white">{campaign.title}</h2>
          <p className="text-sm text-gray-400">{campaign.description}</p>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Project:</span>
            <span className="text-white">{campaign.project_name}</span>
          </div>

          {/* Participants */}
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Participants:</span>
              <span className="text-white flex items-center gap-1">
                <Users className="w-4 h-4" />
                {campaign?.participants?.toLocaleString()}
              </span>
            </div>

          {/* Reward */}
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">Reward:</span>
            <span className="text-white flex items-center gap-1">
              {`${campaign.reward.trustTokens} TRUST + ${campaign.reward.xp}`}
            </span>
          </div>

          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">Reward Pool:</span>
            <span className="text-white flex items-center gap-1">
              {campaign.reward?.pool} TRUST (FCFS)
            </span>
          </div>

          {/* Dates */}
          {campaign.starts_at && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Duration:</span>
              <span className="text-white flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {starts_atFormatted} – {ends_atFormatted}
              </span>
            </div>
          )}

          {/* Action Button */}
          <Button
            className={`w-full mt-3 font-medium rounded-xl ${isActive
                ? "bg-[#1f6feb] hover:bg-[#388bfd] text-white"
                : "bg-gray-600 cursor-not-allowed text-gray-300"
              }`}
            onClick={
              (e) => { e.stopPropagation(); goToCampaign(campaign, isActive) }
            }
            disabled={!isActive}
          >
            {isActive ? (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                {"Join Campaign"}
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" /> Coming Soon
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
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
          <p className="text-muted-foreground">
            Complete unique tasks and earn rewards in the Nexura ecosystem.
          </p>
        </div>

        {/* Active Campaigns */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Active Campaigns</h2>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <Card className="glass glass-hover rounded-3xl p-8 text-center">
              <p className="text-white/60">No active campaigns at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign: Campaign) => renderCampaignCard(campaign, true))}
            </div>
          )}
        </div>

        {/* Upcoming Campaigns */}
        {upcomingCampaigns.length > 0 && (
          <div className="space-y-6 mt-12">
            <h2 className="text-2xl font-semibold text-white">Upcoming Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingCampaigns.map((campaign) => renderCampaignCard(campaign, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
