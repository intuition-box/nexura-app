import { useMemo, useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { emitSessionChange } from "@/lib/session";
import { apiRequest } from "@/lib/queryClient";
import AnimatedBackground from "@/components/AnimatedBackground";
import { FaTwitter, FaDiscord } from "react-icons/fa";

const LEVELS = [
  { name: "Trail Initiate", xp: 0 },
  { name: "Pathfinder", xp: 1000 },
  { name: "Scout of Lore", xp: 3000 },
  { name: "Relic Runner", xp: 6000 },
  { name: "Rune Raider", xp: 10000 },
  { name: "Vault Sever", xp: 15000 },
  { name: "Crypt Diver", xp: 20000 },
  { name: "Temple Warden", xp: 30000 },
  { name: "Relic Master", xp: 40000 },
  { name: "Nexon Vanguard", xp: 50000 },
  { name: "Legendary Nexon", xp: 65000 },
];

function WalletDropdown() {
  const { isConnected, connectWallet, address, disconnect } = useWallet();
  const { signOut } = useAuth();

  if (!isConnected) {
    return (
      <Button size="sm" onClick={async () => { try { await connectWallet(); } finally { try { emitSessionChange(); } catch(e){} } }}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Profile"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full cursor-pointer p-2 text-base">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { try { disconnect(); } catch(e){}; try { signOut(); } catch(e){}; try { emitSessionChange(); } catch(e){}; }} className="cursor-pointer p-2 text-base">
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Profile() {
  const { user, loading } = useAuth();
  const [referralCount, setReferralCount] = useState<number>(0);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoadingReferrals(true);
      apiRequest('GET', `/api/referrals/stats/${user.id}`)
        .then(r => r.json())
        .then(data => { if (data?.totalReferrals !== undefined) setReferralCount(data.totalReferrals); })
        .catch(err => console.warn('Failed to fetch referral stats:', err))
        .finally(() => setLoadingReferrals(false));
    }
  }, [user?.id]);

  const userData = useMemo(() => {
    if (!user) return { id: "", username: "Guest", displayName: "Guest User", avatar: "", xp: 0, questsCompleted: 0, tasksCompleted: 0, dateJoined: "Recently", rewards: { xp: 0, trust: 0 }, badges: [], socialProfiles: { twitter: "", discord: "" } };
    return {
      ...user,
      level: user.level ?? 1,
      xp: user.xp ?? 0,
      questsCompleted: user.questsCompleted ?? user.quests_completed ?? 0,
      tasksCompleted: user.tasksCompleted ?? user.tasks_completed ?? 0,
      displayName: user.displayName ?? user.display_name ?? user.username ?? "User",
      username: user.username ?? "user",
      dateJoined: user.dateJoined ?? user.created_at ?? "Recently",
      rewards: user.rewards ?? { xp: 0, trust: 0 },
      badges: user.badges ?? [],
      socialProfiles: {
        twitter: user.socialProfiles?.twitter ?? "",
        discord: user.socialProfiles?.discord ?? "",
      }
    };
  }, [user]);

  const levelInfo = useMemo(() => {
    const xp = userData?.xp ?? 0;
    let currentLevelIndex = LEVELS.findIndex((lvl, idx) => {
      const nextLvl = LEVELS[idx + 1];
      return xp >= lvl.xp && (!nextLvl || xp < nextLvl.xp);
    });
    if (currentLevelIndex === -1) currentLevelIndex = 0;

    const currentLevel = LEVELS[currentLevelIndex];
    const nextLevel = LEVELS[currentLevelIndex + 1] || currentLevel;
    const progressXp = xp - currentLevel.xp;
    const neededXp = nextLevel.xp - xp;
    const progressPercentage = nextLevel.xp !== currentLevel.xp
      ? (progressXp / (nextLevel.xp - currentLevel.xp)) * 100
      : 100;

    return { levelName: currentLevel.name, levelValue: currentLevelIndex + 1, xpValue: xp, nextLevelXp: nextLevel.xp, progressXp, neededXp, progressPercentage };
  }, [userData?.xp]);

  const { levelName, levelValue, xpValue, nextLevelXp, neededXp, progressPercentage } = levelInfo;

  return (
    <div className=" bg-black text-white relative">
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

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <div className="flex items-center gap-3">
            <Link href="/profile/edit"><Button data-testid="button-edit-profile"><Edit2 className="w-4 h-4 mr-2"/>Edit Profile</Button></Link>
            <WalletDropdown />
          </div>
        </div>

        {/* Profile Card */}
        <Card className="relative overflow-hidden card-lift glow-border">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, #5B21B6, #3B82F6, #06B6D4, #8B5CF6)`,
              backgroundSize: '400% 400%',
              animation: 'gradientShift 15s ease infinite'
            }}
          />
          <CardContent className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
              <AvatarImage src={userData?.avatar ?? ""} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-green-500 via-blue-500 to-red-500 text-white">{levelValue}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold">{userData?.displayName}</h2>
              <Badge className="mt-1 text-white border-0 bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">{levelName}</Badge>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">XP Progress</span>
                  <span className="text-sm font-medium">{xpValue} / {nextLevelXp} XP</span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-gray-800/50 overflow-hidden rounded-full"/>
                <div className="text-xs text-muted-foreground">{neededXp} XP to next level</div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2"><Calendar className="w-4 h-4"/>Joined {userData?.dateJoined}</div>

              {/* Socials */}
<div className="flex items-center gap-4 mt-2">
  {/* Twitter/X */}
  <div className="flex items-center gap-2 text-sm">
    <FaTwitter className="w-5 h-5 text-[#1DA1F2]" />
    {userData.socialProfiles?.twitter?.connected
      ? `@${userData.socialProfiles.twitter.username}`
      : "Not connected"}
  </div>

  {/* Discord */}
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
            { title: "Total Quests Completed", value: userData?.questsCompleted ?? 0, label: "Completed" },
            { title: "Total Rewards", value: `${userData?.rewards?.xp ?? 0} XP, ${userData?.rewards?.trust ?? 0} $TRUST`, label: "Earned" },
            { title: "Badges", value: userData?.badges?.length ?? 0, label: "Nexons" },
          ].map((stat) => (
            <Card key={stat.title} className="glass glass-hover rounded-3xl flex flex-col h-full">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-white">{stat.title}</CardTitle></CardHeader>
              <CardContent className="flex flex-col justify-between">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                {stat.label && <p className="text-xs text-white/60 mt-1">{stat.label}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
