"use client";

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
import intuitionPortal from "@assets/intuitionPortal.jpg";
import intuitionBets from "@assets/intuitionBets.jpg";
import intuRank from "@assets/intuRank.jpg";
import tribeMeme from "@assets/tribeMeme.jpg";
import tnsLogo from "@assets/tnsLogo.jpg";

export default function Discover() {
  const [activeTab, setActiveTab] = useState("all");
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initializeRefreshTimer = () => {
      const lastRefresh = localStorage.getItem("lastTaskRefresh");
      const now = Date.now();
      if (!lastRefresh) {
        localStorage.setItem("lastTaskRefresh", now.toString());
        setRefreshCountdown(86400);
      } else {
        const timeSinceRefresh = Math.floor((now - parseInt(lastRefresh)) / 1000);
        setRefreshCountdown(Math.max(0, 86400 - timeSinceRefresh));
      }
    };
    initializeRefreshTimer();
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          queryClient.invalidateQueries();
          localStorage.setItem("lastTaskRefresh", Date.now().toString());
          return 86400;
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
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
    { name: "Intuition Portal", logo: intuitionPortal, category: "Portal" },
    { name: "Intuition Bets", logo: intuitionBets, category: "Prediction Market" },
    { name: "IntuRank", logo: intuRank, category: "DeFi" },
    { name: "Tribe Meme", logo: tribeMeme, category: "Gaming" },
    { name: "Trust Name Service", logo: tnsLogo, category: "Domain" },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative" data-testid="discover-page">
      <AnimatedBackground />

      {/* Top Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-4 border-b border-white/10 glass gap-3 sm:gap-0">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 glass rounded-full border-0 focus:ring-2 focus:ring-primary/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 relative z-10 space-y-12">

        {/* Hero Campaign Section */}
        <div className="animate-slide-up delay-100">
          <HeroCampaign campaigns={campaignsData?.campaigns ?? []} />
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-fit grid-cols-1 bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-12">

            {/* Trending Campaigns */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold animate-slide-up delay-200">
                  Trending Campaigns
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="animate-slide-up delay-300"
                  onClick={() => setLocation("/campaigns")}
                >
                  Show all
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.isArray(campaignsData?.campaigns) && campaignsData.campaigns.length > 0
                  ? campaignsData.campaigns.map((campaign: any, index: number) => (
                      <div
                        key={`campaign-${index}`}
                        className={`animate-slide-up delay-${(index + 1) * 100}`}
                      >
                        <CampaignCard {...campaign} from="explore" />
                      </div>
                    ))
                  : (
                    <div className="text-white/50 animate-slide-up delay-100">
                      No campaigns available.
                    </div>
                  )}
              </div>
            </section>

            {/* Trending Dapps */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold animate-slide-up delay-200">
                  Trending Dapps
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="animate-slide-up delay-300"
                  onClick={() => setLocation("/ecosystem-dapps")}
                >
                  Show all
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {trendingDapps.map((dapp, index) => (
                  <div
                    key={`dapp-${index}`}
                    className={`group flex flex-col items-center p-4 rounded-2xl glass glass-hover transition-all cursor-pointer animate-slide-up delay-${(index + 1) * 100}`}
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
  );
}
