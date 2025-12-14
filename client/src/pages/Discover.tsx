import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import HeroCampaign from "@/components/HeroCampaign";
import CampaignCard from "@/components/CampaignCard";
import AnimatedBackground from "@/components/AnimatedBackground";

// Import protocol logos for trending dapps
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

  useEffect(() => {
    const initializeRefreshTimer = () => {
      const lastRefresh = localStorage.getItem('lastTaskRefresh');
      const now = Date.now();
      
      if (!lastRefresh) {
        localStorage.setItem('lastTaskRefresh', now.toString());
        setRefreshCountdown(86400);
      } else {
        const timeSinceRefresh = Math.floor((now - parseInt(lastRefresh)) / 1000);
        const remainingTime = Math.max(0, 86400 - timeSinceRefresh);
        setRefreshCountdown(remainingTime);
      }
    };

    initializeRefreshTimer();

    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          queryClient.invalidateQueries();
          const now = Date.now();
          localStorage.setItem('lastTaskRefresh', now.toString());
          return 86400;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: campaignsData } = useQuery({
    queryKey: ["/campaigns"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/campaigns");
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
    { name: "TrustSwap", logo: trustSwapLogo, category: "DeFi" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-auto relative" data-testid="discover-page">
      <AnimatedBackground />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10 glass">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 glass rounded-full border-0 focus:ring-2 focus:ring-primary/20 w-64 text-white placeholder:text-white/40"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 relative z-10">
        <HeroCampaign campaigns={campaignsData?.campaigns ?? []} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-fit grid-cols-1 bg-muted/50">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-12">
            
            {/* Trending Campaigns */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Trending Campaigns</h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation('/campaigns')}>Show all</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(campaignsData?.campaigns) && campaignsData.campaigns.length > 0 ? (
                  campaignsData.campaigns.map((campaign: any, index: number) => (
                    <div key={`campaign-${index}`} className="transform-wrapper" style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}>
                      <CampaignCard {...campaign} from="explore" />
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No campaigns available.</div>
                )}
              </div>
            </section>

            {/* Trending Dapps */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Trending Dapps</h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation('/ecosystem-dapps')}>Show all</Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {trendingDapps.map((dapp, index) => (
                  <div 
                    key={`dapp-${index}`} 
                    className="group flex flex-col items-center p-4 rounded-2xl glass glass-hover transition-all cursor-pointer"
                    onClick={() => setLocation('/ecosystem-dapps')}
                  >
                    <div className="w-12 h-12 mb-3 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                      <img src={dapp.logo} alt={dapp.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors text-center">
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
