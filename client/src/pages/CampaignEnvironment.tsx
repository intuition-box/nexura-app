import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

interface Campaign {
  id: string;
  name: string;
  description: string;
  project_name?: string;
  project_image?: string;
  starts_at?: string;
  ends_at?: string;
  metadata?: string;
  rewards?: { amount: number; currency: string };
}

const tasks = [
  { text: "Follow Nexura on X", link: "https://x.com/NexuraXYZ" },
  { text: "Join Nexura Discord Server and verify yourself", link: "https://discord.gg/caK9kATBya" },
  { text: "Drop a message on Nexura Discord Server (any channel)", link: "https://discord.gg/caK9kATBya" },
  { text: "Support or Oppose the #Intuitionbilly Claim on Intuition Portal", link: "https://portal.intuition.systems/explore/triple/0x713f27d70772462e67805c6f76352384e01399681398f757725b9cbc7f495dcf?tab=positions" },
  { text: "Support or Oppose the Nexura claim on the Intuition Portal", link: "#" },
  { text: "Like and comment on Nexura's pinned post", link: "#" },
];

export default function CampaignEnvironment() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [, setLocation] = useLocation();
  const { campaignId } = useParams<{ campaignId: string }>();
  const [taskIndex, setTaskIndex] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const { data: campaign, isLoading, isError } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", campaignId],
    queryFn: async () => {
      if (!campaignId) throw new Error("No campaign ID provided");
      const res = await fetch(`${backendUrl}/api/campaigns/${campaignId}`);
      if (!res.ok) throw new Error("Failed to fetch campaign");
      return res.json();
    },
    enabled: !!campaignId,
  });

  if (!campaignId)
    return (
      <div className="text-white text-center py-12">
        <Button onClick={() => setLocation("/campaigns")} variant="outline" size="sm">
          ← Back
        </Button>
        <p>Invalid campaign. No ID provided.</p>
      </div>
    );

  if (isLoading) return <div className="text-white text-center py-12">Loading campaign...</div>;
  if (isError || !campaign) return <div className="text-white text-center py-12">Campaign not found.</div>;

  const now = new Date();
  const isActive =
    campaign.starts_at && campaign.ends_at
      ? new Date(campaign.starts_at) <= now && now <= new Date(campaign.ends_at)
      : false;

  const progressPercentage = ((taskIndex + 1) / tasks.length) * 100;
  const currentTask = tasks[taskIndex];

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 relative">
      <AnimatedBackground />
      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setLocation("/campaigns")}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Campaign Card */}
        <Card className="rounded-xl overflow-hidden shadow-lg">
          {campaign.project_image && (
            <div className="relative h-36 bg-black">
              <img
                src={campaign.project_image}
                alt={campaign.name}
                className="w-full h-full object-cover rounded-t-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-2 right-2">
                <Badge className={isActive ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                  {isActive ? "Active" : "Coming Soon"}
                </Badge>
              </div>
            </div>
          )}

          <CardContent className="p-3 space-y-3">
            <p className="text-sm text-gray-300">{campaign.description}</p>
            {campaign.project_name && <p className="text-xs text-gray-400">Project: {campaign.project_name}</p>}

            {/* Task Slide */}
            <div className="mt-4 space-y-3">
              <p className="font-medium text-white">
                Task {taskIndex + 1} of {tasks.length}:
              </p>
              <p className="text-sm text-gray-200">{currentTask.text}</p>
              {currentTask.link && (
                <a
                  href={currentTask.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center px-3 py-2 bg-[#1f6feb] hover:bg-[#388bfd] rounded-lg font-medium"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" /> Open Task
                </a>
              )}

              {taskIndex < tasks.length - 1 ? (
                <Button className="w-full mt-2" onClick={() => setTaskIndex(taskIndex + 1)}>
                  Continue
                </Button>
              ) : (
                <div className="text-center mt-2 space-y-2">
                  {!rewardClaimed ? (
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg"
                      onClick={() => setRewardClaimed(true)}
                    >
                      Claim Reward: 200 XP + 16 TRUST
                    </Button>
                  ) : (
                    <p className="text-green-400 font-semibold">Reward claimed! 🎉</p>
                  )}
                  <p className="text-xs text-yellow-400">
                    Total Campaign Reward Pool: 4,000 TRUST (FCFS for 250 users)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
