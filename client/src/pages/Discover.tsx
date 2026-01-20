import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient } from "../lib/queryClient";
import HeroCampaign from "../components/HeroCampaign";
import QuestCard from "../components/QuestCard";
import CampaignCard from "../components/CampaignCard";
import AnimatedBackground from "../components/AnimatedBackground";

// Import user avatar images for trending claims
// import avatar1 from "/claim1.jpg";
// import avatar2 from "/claim2.jpg";
// import avatar3 from "/claim3.jpg";
// import avatar4 from "/claim4.jpg";
// import avatar5 from "/claim5.jpg";
// import avatar6 from "/claim6.jpg";

import intuitionPortal from "@assets/intuitionPortal.jpg";
import intuitionBets from "@assets/intuitionBets.jpg";
import intuRank from "@assets/intuRank.jpg";
import tribeMeme from "@assets/tribeMeme.jpg";
import tnsLogo from "@assets/tnsLogo.jpg";
import { DEV_CAMPAIGNS } from "../pages/Campaigns";
import { DUMMY_QUESTS } from "../pages/Quests";

export default function Discover() {
  const [activeTab, setActiveTab] = useState("all");
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [, setLocation] = useLocation();

  // Initialize and manage 24-hour refresh
  useEffect(() => {
    const initializeRefreshTimer = () => {
      const lastRefresh = localStorage.getItem("lastTaskRefresh");
      const now = Date.now();

      if (!lastRefresh) {
        // First time - set the refresh time to now
        localStorage.setItem("lastTaskRefresh", now.toString());
        setRefreshCountdown(86400); // 24 hours
      } else {
        // Calculate remaining time
        const timeSinceRefresh = Math.floor(
          (now - parseInt(lastRefresh)) / 1000
        );
        setRefreshCountdown(Math.max(0, 86400 - timeSinceRefresh));
      }
    };

    initializeRefreshTimer();

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Tasks refresh - invalidate all queries and reset timer
          queryClient.invalidateQueries();
          localStorage.setItem("lastTaskRefresh", Date.now().toString());
          console.log("Tasks refreshed! Data cache invalidated.");
          return 86400; // Reset to 24 hours
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch campaigns and quests from the backend. If none are available,
  // do not render hardcoded demo content.
  const { data: campaignsData } = useQuery({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/campaigns");
      return res.json();
    },
    retry: false,
  });

  const { data: questsData } = useQuery({
    queryKey: ["/api/quests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/quests");
      return res.json();
    },
    retry: false,
  });

//   const allQuests =
//   questsData
//     ? [
//         ...(questsData.oneTimeQuests ?? []),
//         ...(questsData.weeklyQuests ?? []),
//         ...(questsData.featuredQuests ?? []),
//       ]
//     : [];

// const trendingQuests = allQuests
//   .filter((q: any) => q.status === "active")
//   .slice(0, 3);

  const campaigns =
  Array.isArray(campaignsData?.campaigns) && campaignsData.campaigns.length > 0
    ? campaignsData.campaigns
    : DEV_CAMPAIGNS;

const trendingCampaigns = campaigns
  .filter((c: any) => c.status?.toLowerCase() === "active")
  .slice(0, 3);
  
const allQuests =
  questsData
    ? [
        ...(questsData.oneTimeQuests ?? []),
        ...(questsData.weeklyQuests ?? []),
        ...(questsData.featuredQuests ?? []),
      ]
    : DUMMY_QUESTS;

const trendingQuests = allQuests
  .filter((q: any) => q.status === "active")
  .slice(0, 3);



  const trendingDapps = [
    { name: "Intuition Portal", logo: intuitionPortal, category: "Portal" },
    // { name: "Intuition Bets", logo: intuitionBets, category: "Prediction Market" },
    { name: "IntuRank", logo: intuRank, category: "DeFi" },
    { name: "Tribe Meme", logo: tribeMeme, category: "Gaming" },
    { name: "Trust Name Service", logo: tnsLogo, category: "Domain" },
    // { name: "TrustSwap", logo: trustSwapLogo, category: "DeFi" },
  ];
  return (
    <div className="min-h-screen bg-black text-white relative" data-testid="discover-page">
      <AnimatedBackground />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10 glass">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 glass rounded-full border-0 focus:ring-2 focus:ring-primary/20 text-white placeholder:text-white/40"
          />
        </div>

        <div className="flex items-center space-x-4">
        </div>

        <div className="flex items-center space-x-4">
        </div>
      </div>

      {/* Main Content */}
<div className="relative z-10 space-y-8 px-3 sm:px-4 md:px-6">
  <div className="mx-auto w-full max-w-[1100px]">


        {/* Hero Campaign Section */}
<div className="animate-slide-up delay-100 w-full overflow-hidden rounded-3xl">
  <HeroCampaign campaigns={campaigns} />
</div>

        {/* Tab Navigation */}
        <Tabs
  value={activeTab}
  onValueChange={setActiveTab}
  className="mb-6 w-full"
>
          <TabsList className="flex w-full max-w-xs sm:max-w-sm bg-muted/50 overflow-x-auto rounded-lg">
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8 sm:space-y-12">

            {/* Trending Campaigns */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-2xl md:text-4xl font-bold animate-slide-up delay-200">
                  Trending Campaigns
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/campaigns")}
                >
                  Show all
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-8 sm:px-0">
                {trendingCampaigns.map((campaign: any, index: number) => (
  <div
    key={campaign._id ?? index}
    className={`animate-slide-up delay-${(index + 1) * 100}`}
  >
    <CampaignCard {...campaign} from="explore" />
  </div>
))}
              </div>
            </section>

            {/* Trending Quests */}
<section>
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-lg sm:text-2xl md:text-4xl font-bold animate-slide-up delay-200">
      Trending Quests
    </h2>
    <Button
      variant="ghost"
      size="sm"
      className="animate-slide-up delay-300"
      onClick={() => setLocation("/quests")}
    >
      Show all
    </Button>
  </div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-8 sm:px-0">
    {trendingQuests.length > 0 ? (
      trendingQuests.map((quest: any, index: number) => (
        <div
          key={`quest-${quest._id}`}
          className={`animate-slide-up delay-${(index + 1) * 100}`}
        >
          <QuestCard {...quest} />
        </div>
      ))
    ) : (
      <div className="text-white/50 animate-slide-up delay-100">
        No quests available.
      </div>
    )}
  </div>
</section>

            {/* Trending Dapps */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-2xl md:text-4xl font-bold animate-slide-up delay-200">
                  Trending Dapps
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/ecosystem-dapps")}
                >
                  Show all
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-8 sm:px-0">
                {trendingDapps.map((dapp, index) => (
                  <div
                    key={`dapp-${index}`}
                    className="group flex flex-col items-center p-4 rounded-2xl glass glass-hover transition-all cursor-pointer"
                    onClick={() => setLocation("/ecosystem-dapps")}
                  >
                    <div className="w-12 h-12 mb-3 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                      <img
                        src={dapp.logo}
                        alt={dapp.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 text-center">
                      {dapp.name}
                    </span>
                    <div className="text-xs text-white/50 mt-1">
                      {dapp.category}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
          </div>
      </div>
    </div>
  );
}