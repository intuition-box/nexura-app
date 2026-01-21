import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ExternalLink, Target, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";
import AnimatedBackground from "../components/AnimatedBackground";
import { motion } from "framer-motion";
import { apiRequestV2, getStoredAccessToken } from "../lib/queryClient";

interface Dapp {
  _id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  reward: string;
  isCompleted?: boolean;
  done: boolean;
  timer?: string;
  websiteUrl: string;
}

const DUMMY_DAPP: Dapp[] = [
  {
    _id: "dummy-1",
    name: "NexSwap",
    description: "A decentralized exchange for fast, low-fee token swaps within the Nexura ecosystem.",
    category: "DeFi",
    logo: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1200&auto=format&fit=crop",
    reward: "50",
    done: false,
    isCompleted: false,
    websiteUrl: "https://example.com"
  },
  {
    _id: "dummy-2",
    name: "NexBridge",
    description: "Bridge assets seamlessly across multiple blockchains supported by Nexura.",
    category: "Infrastructure",
    logo: "https://images.unsplash.com/photo-1644088379091-d574269d422f?q=80&w=1200&auto=format&fit=crop",
    reward: "75",
    done: false,
    isCompleted: false,
    websiteUrl: "https://example.com"
  },
  {
    _id: "dummy-3",
    name: "NexStake",
    description: "Stake your tokens securely and earn passive rewards over time.",
    category: "Staking",
    logo: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1200&auto=format&fit=crop",
    reward: "100",
    done: false,
    isCompleted: false,
    websiteUrl: "https://example.com"
  }
];


export default function EcosystemDapps() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const userId = user?._id ?? "user-123";

  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dapps, setDapps] = useState<Dapp[]>([]);

  // useEffect(() => {
  //   (async () => {
  //     const { ecosystemQuests } = await apiRequestV2("GET", "/api/ecosystem-quests");

  //     setDapps(ecosystemQuests);
  //   })();
  // }, []);

  useEffect(() => {
  setDapps(DUMMY_DAPP);
}, []);


  const categories = ["All", ...Array.from(new Set(dapps.map(d => d.category)))];

  const filteredDapps = selectedCategory === "All"
    ? dapps
    : dapps.filter(dapp => dapp.category === selectedCategory);

  // Track visited and claimed state locally for UI. Authoritative state is server-side.
const [visitedDapps, setVisitedDapps] = useState<string[]>(() => {
  try {
    const stored = JSON.parse(localStorage.getItem('nexura:visited:dapps') || '{}');
    return stored[userId] || [];
  } catch {
    return [];
  }
});

const [claimedDapps, setClaimedDapps] = useState<string[]>(() => {
  try {
    const stored = JSON.parse(localStorage.getItem('nexura:claimed:dapps') || '{}');
    return stored[userId] || [];
  } catch {
    return [];
  }
});


  useEffect(() => {
  try {
    const stored: Record<string, string[]> = JSON.parse(localStorage.getItem('nexura:visited:dapps') || '{}');
    stored[userId] = visitedDapps;
    localStorage.setItem('nexura:visited:dapps', JSON.stringify(stored));
  } catch (e) {
    console.error('Failed to save visitedDapps', e);
  }
}, [visitedDapps, userId]);

useEffect(() => {
  try {
    const stored: Record<string, string[]> = JSON.parse(localStorage.getItem('nexura:claimed:dapps') || '{}');
    stored[userId] = claimedDapps;
    localStorage.setItem('nexura:claimed:dapps', JSON.stringify(stored));
  } catch (e) {
    console.error('Failed to save claimedDapps', e);
  }
}, [claimedDapps, userId]);


const markVisited = (dapp: Dapp) => {
  if (!visitedDapps.includes(dapp._id)) setVisitedDapps(prev => [...prev, dapp._id]);
  window.open(dapp.websiteUrl, "_blank");

  // fire-and-forget
  apiRequestV2("POST", `/api/quest/set-timer?id=${dapp._id}`).catch(console.error);
};


  const markClaimed = (id: string) => {
    if (!claimedDapps.includes(id)) setClaimedDapps(prev => [...prev, id]);
  };

  const getXpFromReward = (reward: string) => {
    if (!reward) return 0;
    const m = String(reward).match(/(\d+)/);
    return m ? Number(m[1]) : 0;
  };

  const handleClaim = async (dapp: Dapp) => {
    if (!getStoredAccessToken()) {
      toast({ title: 'Sign in required', description: 'Please sign in to claim XP', variant: 'destructive' });
      return;
    }

    if (dapp.done) {
      toast({ title: 'Already claimed', description: 'You have already claimed this reward.' });
      return;
    }

    try {
      const resp = await apiRequestV2("POST", `/api/quest/claim-ecosystem-quest?id=${dapp._id}`);

      if (resp.error) {
        toast({ title: 'Error', description: resp.error });

        return;
      }

      markClaimed(dapp._id);
      // try { emitSessionChange(); } catch(e){}
      toast({ title: 'XP awarded', description: `+${dapp.reward} XP` });

      // window.location.reload();
    } catch (error: any) {
      console.error('claim error:', error.message);
      toast({ title: 'Claim failed', description: error.message, variant: 'destructive' });
    }
  };

  const getCategoryColor = (category: string) => {
    // Simple hash or mapping for colors
    const colors = [
      "bg-purple-500/10 text-purple-600",
      "bg-blue-500/10 text-blue-600",
      "bg-pink-500/10 text-pink-600",
      "bg-green-500/10 text-green-600",
      "bg-cyan-500/10 text-cyan-600",
      "bg-indigo-500/10 text-indigo-600",
      "bg-orange-500/10 text-orange-600",
      "bg-emerald-500/10 text-emerald-600",
      "bg-red-500/10 text-red-600",
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative" data-testid="ecosystem-dapps-page">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto px-6 sm:px-4 md:px-6 space-y-8 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ecosystem Dapps</h1>
          <p className="text-muted-foreground">
            Explore popular dapps in the ecosystem and complete one-time quests to earn rewards.
          </p>
        </div>

                {/* Disclaimer */}
<div className="max-w-7xl mx-auto px-6 sm:px-4 md:px-6 mt-12 text-xs sm:text-sm text-white/60">
  <p>
    <strong>Disclaimer:</strong> All dapps listed on Nexura, except the Intuition Portal, are community-built. 
    We only display them for discovery and visibility purposes. This does not mean we endorse, control, audit, 
    or take responsibility for these projects. We do not have control over how these dapps function, how they manage 
    user data, funds, or any issues you may encounter while using them. Users are advised to do their own research 
    and exercise caution when interacting with any third-party dapps.
  </p>
</div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              data-testid={`category-${category.toLowerCase()}`}
            >
              {category.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredDapps.map((dapp, index) => (
            <motion.div
              key={dapp._id}
              initial={{ opacity: 0, y: 40 }}
animate={{ opacity: 1, y: 0 }}
transition={{
  duration: 0.45,
  ease: "easeOut",
  delay: index * 0.08
}}
>
              <Card className="h-full flex flex-col overflow-hidden hover:border-primary/50 transition-colors group bg-card/50 backdrop-blur-sm border-white/10">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                  <img
                    src={dapp.logo}
                    alt={dapp.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {dapp.isCompleted && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{dapp.name}</CardTitle>
                      <Badge className={getCategoryColor(dapp.category)} variant="secondary">
                        {dapp.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{dapp.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">

                  <div className="flex items-center justify-between text-sm">
  <span className="text-muted-foreground">Reward</span>
  <span className="font-semibold text-primary">
    {dapp.reward} XP
  </span>
</div>


                  <div className="flex flex-col gap-3 mt-auto">
                    <a
                      href={dapp.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); markVisited(dapp); }}
                      className="flex-1 inline-flex items-center justify-center rounded-md border border-white/10 px-3 py-2 text-sm text-white hover:opacity-90"
                      data-testid={`explore-${dapp._id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Explore
                    </a>

                    <Button
  size="sm"
  className={`
    w-full sm:w-40
    bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900
    text-white
    hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800
    active:scale-[0.98]
    transition-all
  `}
  disabled={!visitedDapps.includes(dapp._id) || claimedDapps.includes(dapp._id)}
  onClick={(e) => { e.stopPropagation(); handleClaim(dapp); }}
>
  {claimedDapps.includes(dapp._id) ? "Claimed" : `Claim ${dapp.reward}`}
</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredDapps.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Dapps Found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category to see more dapps
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
