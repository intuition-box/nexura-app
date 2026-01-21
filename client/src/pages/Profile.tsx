// FULL UPDATED PROFILE CODE WITH SINGLE-MINT PER LEVEL + ONLY WHEN COMPLETED

import { useMemo, useState, useEffect } from "react";
import { useWallet } from "../hooks/use-wallet";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Edit2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "../lib/auth";
import { Progress } from "../components/ui/progress";
import { emitSessionChange } from "../lib/session";
import { apiRequestV2 } from "../lib/queryClient";
import AnimatedBackground from "../components/AnimatedBackground";
import { FaTwitter, FaDiscord } from "react-icons/fa";

// Level images (10 levels)
const LEVEL_IMAGES = [
  "trail-initiate.jpg",
  "pathfinder.jpg",
  "scout-of-lore.jpg",
  "relic-runner.jpg",
  "rune-raider.jpg",
  "temple-warden.jpg",
  "crypt-diver.jpg",
  "vault-sever.jpg",
  "relic-master.jpg",
  "nexon-vanguard.jpg",
];

const LEVELS = [
  { name: "Trail Initiate", xp: 1000 },
  { name: "Pathfinder", xp: 3000 },
  { name: "Scout of Lore", xp: 6000 },
  { name: "Relic Runner", xp: 10000 },
  { name: "Rune Raider", xp: 15000 },
  { name: "Vault Sever", xp: 20000 },
  { name: "Crypt Diver", xp: 30000 },
  { name: "Temple Warden", xp: 40000 },
  { name: "Relic Master", xp: 50000 },
  { name: "Nexon Vanguard", xp: 65000 },
].map((lvl, idx) => ({ ...lvl, img: `/LEVELS/${LEVEL_IMAGES[idx]}` }));

function WalletDropdown() {
  const { isConnected, connectWallet, address, disconnect } = useWallet();
  const { signOut } = useAuth();

  if (!isConnected) {
    return (
      <Button
        size="sm"
        onClick={async () => {
          try { await connectWallet(); } finally { try { emitSessionChange(); } catch (e) { } }
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Profile"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full cursor-pointer p-2 text-base">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            try { disconnect(); } catch (e) { }
            try { signOut(); } catch (e) { }
            try { emitSessionChange(); } catch (e) { }
          }}
          className="cursor-pointer p-2 text-base"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const { address } = useWallet();

  // Store list of minted levels, NOT a counter
  const [mintedLevels, setMintedLevels] = useState<number[]>([]);

  const [referralCount, setReferralCount] = useState<number>(0);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  useEffect(() => {
    (async () => {
      const { user: profile } = await apiRequestV2("GET", "/api/user/profile");
      if (!profile) return;

      setUser(profile);
    })();
  }, [user]);

  // Wallet → default display name
  const userData = useMemo(() => {
    let base = {
      _id: "",
      username: "Guest",
      displayName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Guest User",
      avatar: "/profile/trail-initiate.png",
      xp: 0,
      questsCompleted: 0,
      campaignsCompleted: 0,
      dateJoined: "Recently",
      trust: 0,
      badges: [],
      socialProfiles: { x: "", discord: "" },
    };

    if (!user) return base;

    const finalName =
      user.displayName ||
      user.display_name ||
      user.username ||
      (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "User");

    return {
      // ...user,
      displayName: finalName,
      avatar: user.profilePic ?? "",
      level: user.level ?? 1,
      xp: user.xp ?? 0,
      questsCompleted: user.questsCompleted ?? 0,
      campaignsCompleted: user.campaignsCompleted ?? 0,
      username: user.username ?? "user",
      dateJoined: user.dateJoined ?? user.created_at ?? "Recently",
      trust: user.trustEarned,
      badges: user.badges ?? [],
      socialProfiles: {
        x: user.socialProfiles?.x ?? "",
        discord: user.socialProfiles?.discord ?? "",
      },
    };
  }, [user, address]);

  const levelInfo = useMemo(() => {
    const xp = userData?.xp ?? 0;

    // Find current level
    let idx = LEVELS.findIndex((lvl, i) => {
      const next = LEVELS[i + 1];
      return xp <= lvl.xp && (!next || xp < next.xp);
    });

    if (idx === -1) idx = LEVELS.length - 1;

    const current = LEVELS[idx];

    const maxXp = current.xp; // cap based on current level

    const progressPercentage = Math.min((xp / maxXp) * 100, 100);

    return {
      levelName: current.name,
      levelValue: idx + 1,
      xpValue: xp,
      nextLevelXp: maxXp,
      neededXp: maxXp - xp,
      currentLevelIndex: idx,
      progressPercentage,
    };
  }, [userData?.xp]);


  const { levelName, levelValue, xpValue, nextLevelXp, neededXp, progressPercentage, currentLevelIndex } =
    levelInfo;

  // STRICT MINT LOGIC
  const handleMint = (levelIndex: number) => {
    if (levelIndex !== currentLevelIndex) return;        // can't mint future level
    if (mintedLevels.includes(levelIndex)) return;       // can't mint twice
    if (xpValue < LEVELS[levelIndex].xp) return;         // not achieved yet

    setMintedLevels(prev => [...prev, levelIndex]);
  };

  const totalMinted = mintedLevels.length;

  return (
    <div className="bg-black text-white relative">
      <AnimatedBackground />

      {loading && (
        <div className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <div className="flex items-center gap-3">
            <Link href="/profile/edit">
              <Button data-testid="button-edit-profile">
                <Edit2 className="w-4 h-4 mr-2" />Edit Profile
              </Button>
            </Link>
            <WalletDropdown />
          </div>
        </div>

        {/* Profile Card */}
        <Card className="relative overflow-hidden card-lift glow-border">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, #5B21B6, #3B82F6, #06B6D4, #8B5CF6)`,
              backgroundSize: "400% 400%",
              animation: "gradientShift 15s ease infinite",
            }}
          />
          <CardContent className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
              <AvatarImage src={userData?.avatar ?? "/profile/trail-initiate.png"} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-green-500 via-blue-500 to-red-500 text-white">
                {levelValue}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold">{userData?.displayName}</h2>

              <Badge className="mt-1 text-white border-0 bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {levelName}
              </Badge>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">XP Progress</span>
                  <span className="text-sm font-medium">
                    {xpValue} / {nextLevelXp} XP
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-gray-800/50 overflow-hidden rounded-full" />
                <div className="text-xs text-muted-foreground">{neededXp} XP to next level</div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Calendar className="w-4 h-4" />
                Joined {userData?.dateJoined}
              </div>

              {/* Socials */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <FaTwitter className="w-5 h-5 text-[#1DA1F2]" />
                  {userData.socialProfiles?.x?.connected
                    ? `@${userData.socialProfiles.x.username}`
                    : "Not connected"}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaDiscord className="w-5 h-5 text-[#5865F2]" />
                  {userData.socialProfiles?.discord?.connected
                    ? `@${userData.socialProfiles.discord.username}`
                    : "Not connected"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mt-6">
          {[
            { title: "Total XP", value: xpValue, label: "XP earned" },
            { title: "Current Level", value: `${levelName}`, label: "" },
            { title: "Quests Completed", value: userData?.questsCompleted ?? 0, label: "Completed" },
            { title: "Total Rewards", value: `${userData?.trust ?? 0} TRUST`, label: "Earned" },
            { title: "Nexons", value: totalMinted, label: "Minted" },
          ].map((stat) => (
            <Card key={stat.title} className="glass glass-hover rounded-3xl flex flex-col h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-white">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                {stat.label && <p className="text-xs text-white/60 mt-1">{stat.label}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Levels List */}
        <h2 className="text-2xl font-bold text-white mt-6 mb-4">All Levels</h2>

        <div className="flex flex-col gap-3">
          {LEVELS.map((lvl, idx) => {
            const prevXp = idx === 0 ? 0 : LEVELS[idx - 1].xp;
            const progress =
              xpValue >= lvl.xp
                ? 100
                : xpValue > prevXp
                  ? ((xpValue - prevXp) / (lvl.xp - prevXp)) * 100
                  : 0;

            const isCurrent = idx === currentLevelIndex;
            const isMinted = mintedLevels.includes(idx);
            const isAchieved = xpValue >= lvl.xp;

            const showMint =
              isCurrent && isAchieved && !isMinted;

            return (
              <Card
                key={lvl.name}
                className={`glass glass-hover rounded-3xl flex flex-col md:flex-row items-center gap-4 p-4 transition-all relative ${isCurrent ? "border-2 border-blue-400 shadow-lg" : ""
                  }`}
              >
                {/* MINT BUTTON — ONLY WHEN ALLOWED */}
                {showMint && (
                  <button
                    onClick={() => handleMint(idx)}
                    className="absolute top-3 right-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                  >
                    Mint
                  </button>
                )}

                {/* If already minted, show a badge */}
                {isMinted && (
                  <Badge className="absolute top-3 right-3 bg-green-600 text-white">
                    Minted
                  </Badge>
                )}

                <Avatar className="w-16 h-16 border-2 border-white/20">
                  <AvatarImage src={lvl.img} />
                  <AvatarFallback>{idx + 1}</AvatarFallback>
                </Avatar>

                <div className="flex-1 w-full">
                  <div className="text-white font-semibold text-lg">{lvl.name}</div>

                  <Progress value={progress} className="h-3 mt-1 rounded-full bg-gray-800/50" />

                  <div className="text-xs text-white/60 mt-1">
                    {isAchieved ? "Reached" : `Earn ${lvl.xp - xpValue} XP to reach Level ${idx + 2}`}
                  </div>
                </div>

                {isCurrent && <Badge className="bg-blue-500 text-white">Current</Badge>}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};