import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import HeroCampaign from "@/components/HeroCampaign";
import QuestCard from "@/components/QuestCard";
import CampaignCard from "@/components/CampaignCard";
import AnimatedBackground from "@/components/AnimatedBackground";

// Import user avatar images for trending claims
import avatar1 from "/claim1.jpg";
import avatar2 from "/claim2.jpg";
import avatar3 from "/claim3.jpg";
import avatar4 from "/claim4.jpg";
import avatar5 from "/claim5.jpg";
import avatar6 from "/claim6.jpg";

import intuitionPortalLogo from "@assets/image_1758731619825.png";
import oracleLendLogo from "@assets/image_1758734045558.png";
import intudexLogo from "@assets/image_1758731610569.png";
import diceGameLogo from "@assets/image_1758731655425.png";
import tnsLogo from "@assets/image_1758732361346.png";
import trustSwapLogo from "@assets/image_1758731629668.png";

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

  const trendingDapps = [
    { name: "Intuition Portal", logo: intuitionPortalLogo, category: "Portal" },
    { name: "Oracle Lend", logo: oracleLendLogo, category: "Lending" },
    { name: "Intudex", logo: intudexLogo, category: "DeFi" },
    { name: "3,3 Dice Game", logo: diceGameLogo, category: "Gaming" },
    { name: "Trust Name Service", logo: tnsLogo, category: "Domain" },
    { name: "TrustSwap", logo: trustSwapLogo, category: "DeFi" },
  ];

  const trendingClaims = [
    {
      titleLeft: "The Ticker",
      titleMiddle: "is",
      titleRight: "Trust",
      avatar: avatar1,
      attestations: 5263,
      category: "Tech Innovation",
      // categoryColor: "bg-blue-500",
      link: "https://portal.intuition.systems/explore/triple/0xa1739235f5a8362b15268eab46484abdd7660a1e2a6a5d7deacbed9d4c055e68"
    },
    {
      titleLeft: "Calebnftgod.eth",
      titleMiddle: "has tag",
      titleRight: "Top Community Member",
      avatar: avatar2,
      attestations: 32,
      category: "DeFi Analysis",
      // categoryColor: "bg-green-500",
      link: "https://portal.intuition.systems/explore/triple/0x5fb9bfc2c7ea6bbde71fd74887f798040e99255ee42f22f4e51a67ff1a101b68"
    },
    {
      titleLeft: "Sofia",
      titleMiddle: "has tag",
      titleRight: "Built On Intuition",
      avatar: avatar3,
      attestations: 28,
      category: "Developer Experience",
      // categoryColor: "bg-purple-500",
      link: "https://portal.intuition.systems/explore/triple/0x98ba47f4d18ceb7550c6c593ef92835864f0c0e09d6e56108feac8a8a6012038"
    },
    {
      titleLeft: "RChris",
      titleMiddle: "has tag",
      titleRight: "Top Community Member",
      avatar: avatar4,
      attestations: 56,
      category: "Research Insights",
      // categoryColor: "bg-orange-500",
      link: "https://portal.intuition.systems/explore/triple/0xdf0b1e0da63786c46594815586673a3cba8d9ab967ac3e433652d5c3865e3f03"
    },
    {
      titleLeft: "Intuitionbilly.eth",
      titleMiddle: "has tag",
      titleRight: "Good Person Verification",
      avatar: avatar5,
      attestations: 19,
      category: "User Experience",
      // categoryColor: "bg-pink-500",
      link: "https://portal.intuition.systems/explore/triple/0x713f27d70772462e67805c6f76352384e01399681398f757725b9cbc7f495dcf?tab=positions"
    },
    {
      titleLeft: "EXPERIENCE001",
      titleMiddle: "has tag",
      titleRight: "Top Intuition Community Member",
      avatar: avatar6,
      attestations: 41,
      category: "Network Effects",
      // categoryColor: "bg-cyan-500",
      link: "https://portal.intuition.systems/explore/triple/0x1d6169e8585c998253b868092d2f04889500a0d5dabd8536600dcbfbb0f45b40?tab=positions"
    }
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
      <div className="p-4 sm:p-6 relative z-10">
        {/* Hero Campaign Section */}
        <HeroCampaign campaigns={campaignsData?.campaigns ?? []} />

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-fit grid-cols-1 bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-12">

            {/* Trending Campaigns */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold">
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
              {/* ✅ FIXED GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.isArray(campaignsData?.campaigns) &&
                  campaignsData.campaigns.length > 0 ? (
                  campaignsData.campaigns.map((campaign: any, index: number) => (
                    <div
                      key={`campaign-${index}`}
                      className="transform-wrapper"
                      style={{
                        transform: "scale(0.9)",
                        transformOrigin: "top left",
                      }}
                    >
                      <CampaignCard {...campaign} from="explore" />
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">
                    No campaigns available.
                  </div>
                )}
              </div>
            </section>

            {/* Trending Dapps */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold">
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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

            {/* Trending Claims */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Trending Claims on Intuition Portal</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/ecosystem-dapps')}
                  data-testid="button-show-all-trending-dapps"
                >
                  Show all
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingClaims.map((claim, index) => (
                  <a
                    key={`claim-${index}`}
                    href={claim.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass glass-hover rounded-3xl p-6 transition-all duration-300 relative overflow-hidden block"
                    data-testid={`trending-claim-${index}`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10">

                      {/* Avatar */}
                      <div className="flex justify-center mb-12">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gray-700 border-2 border-gray-600 transform rotate-45 rounded-lg flex items-center justify-center overflow-hidden">
                            <div className="w-14 h-14 transform -rotate-45 rounded-lg overflow-hidden">
                              <img
                                src={claim.avatar}
                                alt={`${claim.author} avatar`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Header pills inside card */}
                      {index >= 0 ? (
                        <div className=" flex items-center gap-3">

                          {/* "The Ticker" pill */}
                          <span className="px-4 py-1.5 rounded-[20px] bg-[#0f1a22] text-white text-sm font-medium">
                            {claim.titleLeft}
                          </span>

                          {/* "is" */}
                          <span className="text-white/60 text-sm">is</span>

                          {/* "Trust" pill */}
                          <span className="px-4 py-1.5 rounded-[20px] bg-[#192732] text-white text-sm font-semibold">
                            {claim.titleRight}
                          </span>

                        </div>
                      ) : (
                        // default behavior for other cards
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-sm font-semibold text-white">{claim.author}</div>
                          <div className="text-xs text-gray-400">{claim.timeAgo}</div>
                        </div>
                      )}


                      {/* Content */}
                      <p className="text-sm text-white/70 leading-relaxed line-clamp-4 mb-4">
                        {claim.content}
                      </p>

                      {/* Metrics */}
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{claim.attestations} attestations</span>
                      </div>

                    </div>
                  </a>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}