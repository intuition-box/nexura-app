import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Target, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { emitSessionChange } from "@/lib/session";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import AnimatedBackground from "@/components/AnimatedBackground";
import { buildUrl } from "@/lib/queryClient";

// Import protocol logos
import intudexLogo from "@assets/image_1758731610569.png";
import intuitionPortalLogo from "@assets/image_1758731619825.png";
import trustSwapLogo from "@assets/image_1758731629668.png";
import memkopadLogo from "@assets/image_1758731643646.png";
import diceGameLogo from "@assets/image_1758731655425.png";
import gazeBreakerLogo from "@assets/image_1758731666896.png";
import intuitParkLogo from "@assets/image_1758731677908.png";
import twentyFortyEightLogo from "@assets/image_1758731690209.png";
import tetrisLogo from "@assets/Copilot_20250924_173907_1758731966019.png";
import tnsLogo from "@assets/image_1758732361346.png";
// New protocol logos
import intuitionMemeLogo from "@assets/image_1758733760040.png";
import oracleLendLogo from "@assets/image_1758734045558.png";
import intuitionBetsLogo from "@assets/image_1758734662331.png";
import trustEscrowLogo from "@assets/image_1758734736451.png";
import intuitionOracleLogo from "@assets/image_1758735356814.png";
import intuitionTempleLogo from "@assets/image_1758735571330.png";

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

  const dapps: Dapp[] = [
    // Priority order: intuition portal, oracle lend, intudex, 3,3 dice game, trust name service
    {
      id: "intuition-portal",
      name: "INTUITION PORTAL",
      description: "Stake and make claims. Buy into claims bonding curves to support or negate a claim",
      category: "Portal",
      logo: intuitionPortalLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://portal.intuition.systems"
    },
    {
      id: "oracle-lend",
      name: "ORACLELEND",
      description: "A decentralized lending protocol and DEX for borrowing and swapping tokens on Intuition Testnet",
      category: "Lending Protocols",
      logo: oracleLendLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://oraclelend.intuition.box"
    },
    {
      id: "intudex",
      name: "INTUDEX",
      description: "Swap and stake $INTUIT token seamlessly",
      category: "DeFi",
      logo: intudexLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://dex.intuition.box"
    },
    {
      id: "oracle-lend-defi",
      name: "ORACLE LEND",
      description: "A decentralized lending protocol and DEX for borrowing and swaping tokens on Intuition Testnet",
      category: "DeFi",
      logo: oracleLendLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://oraclelend.xyz"
    },
    {
      id: "dice-game",
      name: "DICE GAME",
      description: "Fair dice game on blockchain",
      category: "Gaming",
      logo: diceGameLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://dice.intuition.box"
    },
    // Trust Name Service removed per request (replaced by Gaze Breaker)
    // Additional protocols
    {
      id: "trustswap",
      name: "TRUSTSWAP",
      description: "Swap and stake different tokens seamlessly",
      category: "DeFi",
      logo: trustSwapLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://trustswap.intuition.box"
    },
    {
      id: "trust-escrow",
      name: "TrustEscrow",
      description: "A secure, decentralized escrow platform built on TRUST",
      category: "DeFi",
      logo: trustEscrowLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://trustescrow.app"
    },
    {
      id: "memkopad",
      name: "Memkopad",
      description: "Discover, create and mint NFTs",
      category: "NFT",
      logo: memkopadLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://memkopad.app"
    },
    {
      id: "gaze-breaker",
      name: "GAZE BREAKER",
      description: "Defeat the eyes of the institution. An eerie, sci-fi shmup",
      category: "Gaming",
      logo: gazeBreakerLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://gaze-breaker.vercel.app"
    },
    {
      id: "intuitpark",
      name: "IntuitPark",
      description: "Play prediction games and minigames to earn INTUIT tokens on the Intuition Network",
      category: "Gaming",
      logo: intuitParkLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://intuitpark.game"
    },
    {
      id: "2048",
      name: "2048",
      description: "Join tiles to reach 2048!",
      category: "Gaming",
      logo: twentyFortyEightLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://2048.intuition.game"
    },
    {
      id: "tetris",
      name: "Tetris",
      description: "Play Tetris, earn TRUST!",
      category: "Gaming",
      logo: tetrisLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://tetris.intuition.game"
    },
    {
      id: "intuition-meme",
      name: "INTUITION MEME",
      description: "Launch Your Meme Token: Fair launch meme tokens with bonding curves on Intuition Testnet",
      category: "Launchpads",
      logo: intuitionMemeLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://intuition-meme.vercel.app"
    },
    {
      id: "intuition-bets",
      name: "Intuition BETs",
      description: "Place your bets and test your intuition",
      category: "Prediction Markets",
      logo: intuitionBetsLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://bets.intuition.systems"
    },
    {
      id: "intuition-oracle",
      name: "The Intuition Oracle",
      description: "Discover Your On-Chain Prophecy",
      category: "Social",
      logo: intuitionOracleLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://oracle.intuition.systems"
    },
    {
      id: "intuition-temple",
      name: "INTUITION TEMPLE",
      description: "pray",
      category: "Social",
      logo: intuitionTempleLogo,
      questReward: "50 XP",
      isCompleted: false,
      isClaimed: false,
      websiteUrl: "https://temple.intuition.systems"
    }
  ];

  const handleExploreClick = (dapp: Dapp, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    try { markVisited(dapp.id); } catch(e){}
    // Open the dapp's website in a new tab
    window.open(dapp.websiteUrl, '_blank', 'noopener,noreferrer');
  };

  // Claim functionality removed from UI — claims are handled elsewhere or not offered


  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Portal":
        return "bg-purple-500/10 text-purple-600";
      case "DeFi":
        return "bg-blue-500/10 text-blue-600";
      case "NFT":
        return "bg-pink-500/10 text-pink-600";
      case "Gaming":
        return "bg-green-500/10 text-green-600";
      case "Domain Name":
        return "bg-cyan-500/10 text-cyan-600";
      case "Social":
        return "bg-indigo-500/10 text-indigo-600";
      case "Launchpads":
        return "bg-orange-500/10 text-orange-600";
      case "Lending Protocols":
        return "bg-emerald-500/10 text-emerald-600";
      case "Prediction Markets":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const categories = ["All", "Portal", "DeFi", "NFT", "Gaming", "Domain Name", "Social", "Launchpads", "Lending Protocols", "Prediction Markets"];
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  // Helper to extract xp number from questReward like "50 XP"
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
        // already claimed
        markClaimed(dapp.id);
        toast({ title: 'Already claimed', description: 'You have already claimed this reward.' });
        return;
      }
      if (!resp.ok) {
        const t = await resp.text().catch(() => String(resp.status));
        throw new Error(`Claim failed: ${t}`);
      }
      const j = await resp.json().catch(() => ({}));
      markClaimed(dapp.id);
      // trigger profile refresh
      try { emitSessionChange(); } catch(e){}
      toast({ title: 'XP awarded', description: `+${xp} XP` });
    } catch (e) {
      console.error('claim error', e);
      toast({ title: 'Claim failed', description: 'Failed to claim XP. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="ecosystem-dapps-page">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ecosystem Dapps</h1>
          <p className="text-muted-foreground">
            Explore popular dapps in the ecosystem and complete one-time quests to earn rewards
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
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

        {/* Dapps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredDapps.map((dapp) => (
            <Card 
              key={dapp.id} 
              className="hover-elevate active-elevate-2 transition-all duration-200 relative flex flex-col min-h-[300px]"
              data-testid={`dapp-card-${dapp.id}`}
            >
              {dapp.isCompleted && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="w-12 h-12 flex items-center justify-center">
                          {typeof dapp.logo === 'string' && dapp.logo.startsWith('/') ? (
                            <img src={dapp.logo} alt={dapp.name} className="w-8 h-8 object-contain transition-transform transform hover:scale-105" />
                          ) : (
                            <img src={dapp.logo} alt={dapp.name} className="w-8 h-8 object-contain transition-transform transform hover:scale-105" />
                          )}
                        </div>
                      </PopoverTrigger>
                        <PopoverContent side="bottom" align="center" className="w-56">
                        <div className="text-sm text-muted-foreground mb-2">Visit</div>
                        <div className="break-words text-sm mb-3 text-foreground font-medium">{dapp.websiteUrl}</div>
                        <div className="flex gap-2">
                          <a
                            href={dapp.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => { e.stopPropagation(); markVisited(dapp.id); }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md bg-primary text-white hover:opacity-90"
                          >
                            Open
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </div>
                      </PopoverContent>
                    </Popover>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">{dapp.name}</CardTitle>
                    <Badge className={getCategoryColor(dapp.category)} variant="secondary">
                      {dapp.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <div className="flex-1 mb-4">
                  <p className="text-sm text-muted-foreground">{dapp.description}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Est. Time:</span>
                    <span className="text-xs font-medium">{dapp.estimatedTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reward:</span>
                    <span className="text-xs font-bold text-primary">{dapp.questReward}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <a
                    href={dapp.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.stopPropagation(); markVisited(dapp.id); }}
                    className="flex-1 inline-flex items-center justify-center rounded-md border border-white/10 px-3 py-2 text-sm text-white hover:opacity-90"
                    data-testid={`explore-${dapp.id}`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Explore
                  </a>

                  <Button
                    size="sm"
                    className="w-40"
                    variant={claimedDapps.includes(dapp.id) ? 'outline' : 'quest'}
                    disabled={!visitedDapps.includes(dapp.id) || claimedDapps.includes(dapp.id)}
                    onClick={(e) => { e.stopPropagation(); handleClaim(dapp); }}
                    data-testid={`claim-dapp-${dapp.id}`}
                  >
                    {claimedDapps.includes(dapp.id) ? 'Claimed' : `Claim ${dapp.questReward}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
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