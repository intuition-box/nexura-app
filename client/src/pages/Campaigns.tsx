import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Clock, Users } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "@/components/AnimatedBackground";
import { apiRequestV2 } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

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
    try {
      if (!active) return;

      const campaignId = campaign._id;
      setLoading(true);

      if (campaign.joined) {
        setLocation(`/campaign/${campaignId}`);
        return;
      }

      await apiRequestV2("POST", `/api/campaign/join-campaign?id=${campaignId}`);
      setLocation(`/campaign/${campaignId}`);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      toast.error({ title: "Error", description: error.message, variant: "destructive" });
    }
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
          className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition flex flex-col sm:flex-col"
        >
          {/* Campaign Banner */}
          <div className="relative h-40 sm:h-48 md:h-44 bg-black w-full">
            {campaign.projectCoverImage && (
              <img
                src={campaign.projectCoverImage}
                alt={campaign.title}
                className="w-full h-full object-cover rounded-t-2xl"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <Badge
                className={
                  isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 text-[0.65rem] sm:text-xs"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[0.65rem] sm:text-xs"
                }
              >
                {status}
              </Badge>
            </div>

            {/* Category */}
            {metadata.category && (
              <div className="absolute top-2 left-2 text-[0.65rem] sm:text-xs text-white/80 font-medium">
                {metadata.category}
              </div>
            )}
          </div>

          {/* Campaign Details */}
          <div className="p-4 sm:p-5 flex flex-col space-y-2">
            <h2 className="text-sm sm:text-base font-semibold text-white">{campaign.title}</h2>
            <p className="text-xs sm:text-sm text-gray-400">{campaign.description}</p>

            <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1">
              <span className="text-gray-500">Project:</span>
              <span className="text-white">{campaign.project_name}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1 items-start sm:items-center">
              <span className="text-gray-500">Participants:</span>
              <span className="text-white flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                {campaign.participants.toLocaleString()}
              </span>
            </div>

            {/* Reward */}
            <div className="flex flex-col sm:flex-row justify-between text-sm items-center">
            <span className="text-gray-500">Reward:</span>
            <span className="text-white flex items-center gap-1">
              {`${campaign.reward.trustTokens} TRUST + ${campaign.reward.xp}`}
            </span>
          </div>

            <div className="flex flex-col sm:flex-row justify-between text-sm items-center">
            <span className="text-gray-500">Reward Pool:</span>
            <span className="text-white flex items-center gap-1">
              {campaign.reward?.pool} TRUST (FCFS)
            </span>
          </div>

          {/* Dates */}
          {campaign.starts_at && (
              <div className="flex flex-col sm:flex-row justify-between text-sm items-center">
              <span className="text-gray-500">Duration:</span>
              <span className="text-white flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {starts_atFormatted} – {ends_atFormatted}
              </span>
            </div>
          )}

          {/* Action Button */}
          <Button
              className={`w-full mt-2 sm:mt-3 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-xl ${!loading || isActive
                ? "bg-[#1f6feb] hover:bg-[#388bfd] text-white"
                : "bg-gray-600 cursor-not-allowed text-gray-300"
              }`}
            onClick={
              (e) => { e.stopPropagation(); goToCampaign(campaign, isActive) }
            }
            disabled={loading || !isActive}
          >
            {isActive ? (
              loading ? (
                <>Joining...</>
              ) : (
                <>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {"Join Campaign"}
                </>
              )
            ) : (
              <>
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Coming Soon
              </>
            )}
          </Button>
        </div>
      </Card>
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
          ) : campaigns.length === 0 ? (
            <Card className="glass glass-hover rounded-3xl p-6 sm:p-8 text-center">
              <p className="text-white/60">No active campaigns at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {campaigns.map((campaign: Campaign) => renderCampaignCard(campaign, true))}
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
}
