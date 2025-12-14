import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Target, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { emitSessionChange } from "@/lib/session";
import AnimatedBackground from "@/components/AnimatedBackground";
import { buildUrl } from "@/lib/queryClient";
import { motion } from "framer-motion";

interface Dapp {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  questReward: string;
  isCompleted?: boolean;
  isClaimed?: boolean;
  estimatedTime?: string;
  websiteUrl: string;
}

export default function EcosystemDapps() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const dapps: Dapp[] = [
    {
      id: "trustswap",
      name: "TrustSwap",
      description: "Decentralized exchange for seamless token swaps within the ecosystem.",
      category: "DeFi",
      logo: "/ecosystem/TrustSwap.jpg",
      questReward: "50 XP",
      websiteUrl: "https://trustswap.intuition.box/swap"
    },
    {
      id: "trust-quests",
      name: "Trust Quests",
      description: "Complete quests to earn rewards and build your on-chain reputation.",
      category: "Quests",
      logo: "/ecosystem/Trust Quests.jpg",
      questReward: "50 XP",
      websiteUrl: "https://www.trustquests.com"
    },
    {
      id: "intuition-portal",
      name: "Intuition Portal",
      description: "Your gateway to the Intuition ecosystem and identity management.",
      category: "Portal",
      logo: "/ecosystem/Intuition Portal.jpg",
      questReward: "50 XP",
      websiteUrl: "https://portal.intuition.systems"
    },
    {
      id: "trust-name-service",
      name: "Trust Name Service",
      description: "Secure your unique identity with decentralized naming.",
      category: "Domain Name",
      logo: "/ecosystem/Trust Name Service.jpg",
      questReward: "50 XP",
      websiteUrl: "https://tns.intuition.box"
    },
    {
      id: "inturank",
      name: "Inturank",
      description: "Reputation and ranking system for ecosystem participants.",
      category: "Reputation",
      logo: "/ecosystem/Inturank.jpg",
      questReward: "50 XP",
      websiteUrl: "https://inturank.intuition.box"
    },
    {
      id: "tribememe",
      name: "Tribememe",
      description: "Community-driven meme culture and social engagement platform.",
      category: "Social",
      logo: "/ecosystem/Tribememe.jpg",
      questReward: "50 XP",
      websiteUrl: "https://tribememe.app"
    },
    {
      id: "intuition-bets",
      name: "IntuitionBets",
      description: "Decentralized prediction markets and betting platform.",
      category: "Prediction Markets",
      logo: "/ecosystem/IntuitionBets.jpg",
      questReward: "50 XP",
      websiteUrl: "https://intuitionbets.com"
    },
    {
      id: "trust-card",
      name: "TrustCard",
      description: "Digital identity card showcasing your ecosystem achievements.",
      category: "Identity",
      logo: "/ecosystem/Trust Card.jpg",
      questReward: "50 XP",
      websiteUrl: "https://trustcard.box"
    },
    {
      id: "sofia",
      name: "Sofia",
      description: "AI-powered assistant for navigating the ecosystem.",
      category: "AI",
      logo: "/ecosystem/Sofia.jpg",
      questReward: "50 XP",
      websiteUrl: "https://sofia.intuition.box"
    },
    {
      id: "revel-8",
      name: "Revel 8",
      description: "Immersive gaming and entertainment experiences.",
      category: "Gaming",
      logo: "/ecosystem/Revel8.jpg",
      questReward: "50 XP",
      websiteUrl: "https://revel8.io"
    },
    {
      id: "intuition-mcp",
      name: "IntuitionMCP",
      description: "Master Control Protocol for advanced ecosystem interactions.",
      category: "Infrastructure",
      logo: "/ecosystem/Intuition MCP.jpg",
      questReward: "50 XP",
      websiteUrl: "https://www.intuitionmcp.xyz"
    },
    {
      id: "urban-mayhem",
      name: "Urban Mayhem",
      description: "Strategy game set in a chaotic urban environment.",
      category: "Gaming",
      logo: "/ecosystem/Urban Mayhem.jpg",
      questReward: "50 XP",
      websiteUrl: "https://urban-mayhem-store.vercel.app"
    },
    {
      id: "go-form",
      name: "Go Form",
      description: "Decentralized form builder and data collection tool.",
      category: "Tools",
      logo: "/ecosystem/GoForm.jpg",
      questReward: "50 XP",
      websiteUrl: "https://goform.biz"
    },
    {
      id: "agent-player-map",
      name: "Agent Player Map",
      description: "Interactive map tracking agents and players across the network.",
      category: "Tools",
      logo: "/ecosystem/Agent Player Map.jpg",
      questReward: "50 XP",
      websiteUrl: "https://playermap.box"
    }
  ];

  const categories = ["All", ...Array.from(new Set(dapps.map(d => d.category)))];

  const filteredDapps = selectedCategory === "All"
    ? dapps
    : dapps.filter(dapp => dapp.category === selectedCategory);

  // Track visited and claimed state locally for UI. Authoritative state is server-side.
  const [visitedDapps, setVisitedDapps] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexura:visited:dapps') || '[]'); } catch { return []; }
  });
  const [claimedDapps, setClaimedDapps] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('nexura:claimed:dapps') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('nexura:visited:dapps', JSON.stringify(visitedDapps)); } catch {}
  }, [visitedDapps]);
  useEffect(() => {
    try { localStorage.setItem('nexura:claimed:dapps', JSON.stringify(claimedDapps)); } catch {}
  }, [claimedDapps]);

  const markVisited = (id: string) => {
    if (!visitedDapps.includes(id)) setVisitedDapps(prev => [...prev, id]);
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
    if (!user || !user.id) {
      toast({ title: 'Sign in required', description: 'Please sign in to claim XP', variant: 'destructive' });
      return;
    }
    if (claimedDapps.includes(dapp.id)) {
      toast({ title: 'Already claimed', description: 'You have already claimed this reward.' });
      return;
    }

    const xp = getXpFromReward(dapp.questReward || '0');
    if (xp <= 0) {
      toast({ title: 'No XP configured', description: 'This dapp has no XP reward configured', variant: 'destructive' });
      return;
    }

    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      try { const token = localStorage.getItem('accessToken'); if (token) headers['Authorization'] = `Bearer ${token}`; } catch(e){}
      const resp = await fetch(buildUrl('/api/xp/add'), { method: 'POST', headers, body: JSON.stringify({ userId: user.id, xp, questId: dapp.id, questsCompletedDelta: 0, tasksCompletedDelta: 0 }) });
      if (resp.status === 409) {
        markClaimed(dapp.id);
        toast({ title: 'Already claimed', description: 'You have already claimed this reward.' });
        return;
      }
      if (!resp.ok) {
        const t = await resp.text().catch(() => String(resp.status));
        throw new Error(`Claim failed: ${t}`);
      }
      markClaimed(dapp.id);
      try { emitSessionChange(); } catch(e){}
      toast({ title: 'XP awarded', description: `+${xp} XP` });
    } catch (e) {
      console.error('claim error', e);
      toast({ title: 'Claim failed', description: 'Failed to claim XP. Please try again.', variant: 'destructive' });
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
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="ecosystem-dapps-page">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Ecosystem Dapps
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the diverse range of applications built on our ecosystem.
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
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDapps.map((dapp, index) => (
            <motion.div
              key={dapp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
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
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="font-bold text-primary">{dapp.questReward}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      asChild 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => markVisited(dapp.id)}
                    >
                      <a href={dapp.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        Launch App <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    
                    <Button
                      className="flex-1"
                      variant={claimedDapps.includes(dapp.id) ? 'secondary' : 'default'}
                      disabled={!visitedDapps.includes(dapp.id) || claimedDapps.includes(dapp.id)}
                      onClick={(e) => { e.stopPropagation(); handleClaim(dapp); }}
                    >
                      {claimedDapps.includes(dapp.id) ? 'Claimed' : 'Claim XP'}
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
