import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AnimatedBackground from "@/components/AnimatedBackground";
import CampaignEnvironment from "./CampaignEnvironment";

interface Campaign {
  id: string;
  name: string;
  description: string;
  project_name?: string;
  project_image?: string;
  starts_at?: string;
  ends_at?: string;
  metadata?: string;
  created_at: string;
}

export default function Campaigns() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [, setLocation] = useLocation();
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
  queryKey: ["/api/campaigns"],
  queryFn: async () => {
    const res = await fetch(`${backendUrl}/api/campaigns`);
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    return res.json();
  },
});

console.log("CAMPAIGNS FROM SERVER:", campaigns);

  // Separate active and upcoming campaigns
  const now = new Date();
  const activeCampaigns = campaigns.filter(c => {
    if (!c.starts_at || !c.ends_at) return false;
    const start = new Date(c.starts_at);
    const end = new Date(c.ends_at);
    return start <= now && now <= end;
  });

  const upcomingCampaigns = campaigns.filter(c => {
    if (!c.starts_at) return false;
    const start = new Date(c.starts_at);
    return start > now;
  });

const renderCampaignCard = (campaign: Campaign) => {
  let metadata: any = {};
  try {
    metadata = campaign.metadata ? JSON.parse(campaign.metadata) : {};
  } catch {
    metadata = {};
  }

  const isActive = activeCampaigns.some(c => c.id === campaign.id);
  const status = isActive ? "Active" : "Coming Soon";

  return (
    <Card
      key={campaign.id}
      className="
        bg-[#0d1117] border border-white/5 rounded-2xl 
        overflow-hidden shadow-lg hover:shadow-xl transition 
      "
      data-testid={`campaign-${campaign.id}`}
    >
      {/* Hero Section */}
      <div className="relative h-44 bg-black">
        {campaign.project_image && (
<img
  src={campaign.project_image}
  alt={campaign.name}
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

        {/* Optional Category */}
        {metadata.category && (
          <div className="absolute top-3 left-3 text-xs text-white/80 font-medium">
            {metadata.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">{campaign.name}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{campaign.description}</p>

        {/* Info List */}
        <div className="space-y-2 pt-2">
          {campaign.project_name && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Project:</span>
              <span className="text-white">{campaign.project_name}</span>
            </div>
          )}

          {metadata.participants !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Participants:</span>
              <span className="text-white">{metadata.participants?.toLocaleString()}</span>
            </div>
          )}

{/* Rewards Section */}
<div className="flex justify-between text-sm">
  <span className="text-gray-500">Rewards:</span>
  <span className="text-white flex items-center space-x-1">
    <span className="font-semibold text-white">3000 tTrust</span>
    <span className="font-medium text-yellow-400 ml-2">
      (first come, first serve)
    </span>
  </span>
</div>


          {campaign.starts_at && campaign.ends_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration:</span>
              <span className="text-white">
                {new Date(campaign.starts_at).toLocaleDateString()} –{" "}
                {new Date(campaign.ends_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          className="
            w-full bg-[#1f6feb] hover:bg-[#388bfd] 
            text-white font-medium rounded-xl mt-3
          "
          disabled={!isActive}
          onClick={() => isActive && setLocation(`/campaign/${campaign.id}`)}
        >
          {isActive ? (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Campaign
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Coming Soon
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};


  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="campaigns-page">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
          <p className="text-muted-foreground">
            Join unique project campaigns and contribute to the growth of the Nexura ecosystem
          </p>
        </div>

        {/* Active Campaigns */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Active Campaigns
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ongoing campaigns you can join right now
            </p>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : activeCampaigns.length === 0 ? (
            <Card className="glass glass-hover rounded-3xl p-8 text-center">
              <p className="text-white/60">No active campaigns at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign) => renderCampaignCard(campaign))}
            </div>
          )}
        </div>

        {/* Upcoming Campaigns */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upcoming Campaigns
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Get ready for these exciting upcoming campaigns
            </p>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : upcomingCampaigns.length === 0 ? (
            <Card className="glass glass-hover rounded-3xl p-8 text-center">
              <p className="text-white/60">No upcoming campaigns scheduled.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingCampaigns.map((campaign) => renderCampaignCard(campaign))}
            </div>
          )}
        </div>

        {/* Information Box */}
        <Card className="glass glass-hover rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Users className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">What are Campaigns?</h3>
                <p className="text-sm text-muted-foreground">
                  Campaigns are unique, project-specific initiatives that allow you to contribute to ecosystem growth. 
                  Unlike daily quests, campaigns have specific durations, larger reward pools, and focus on meaningful 
                  contributions to the Nexura ecosystem and partner projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}