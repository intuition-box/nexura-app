import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, Trophy, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";

import { useAuth } from "../lib/auth";
import { useWallet } from "../hooks/use-wallet";
import SignUpPopup from "./SignUpPopup";
import { getIntuitionNetworkParams } from "../lib/utils";
import { network } from "../lib/constants";

interface ProfileBarProps {
  userId?: string;
}

// --- LEVELS ---
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
];

function getLevelByXp(currentXp: number) {
  for (let i = 0; i < LEVELS.length; i++) {
    const nextLevel = LEVELS[i + 1];
    if (currentXp <= LEVELS[i].xp && (!nextLevel || currentXp < nextLevel.xp)) return { ...LEVELS[i], index: i + 1 };
  }
  return { ...LEVELS[0], index: 1 };
}

export default function ProfileBar({ userId = "user-123" }: ProfileBarProps) {
  const { address, isConnected: walletConnected, connectWallet, disconnect } = useWallet();
  const { user, signOut } = useAuth();
  const connected = Boolean(user) || walletConnected;
  const displayName = user?.username ?? null;
  const hasServerProfile = Boolean(user);

  const { name: levelName, index: levelNumber } = hasServerProfile
    ? getLevelByXp(user.xp ?? 0)
    : { ...LEVELS[0], index: 1 };

  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const isMainnet = network === "mainnet";
  const chainId = isMainnet ? "0x483" : "0x350b";

  const handleLogout = () => {
    signOut();
    try { localStorage.removeItem("nexura:wallet"); } catch { }
    try { disconnect?.(); } catch { }
    setLocation("/");
    toast({ title: "Signed out", description: "Your session was cleared." });
  };

  const switchNetwork = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });
  }

  const handleAddAndSwitchNetwork = async () => {
    if (!window.ethereum) {
      toast({ title: "Wallet not found", description: "Please install MetaMask or another Web3 wallet", variant: "destructive" });
      return;
    }

    try {
      await switchNetwork();

      toast({ title: "Network switched!", description: "Network switched!" });
    } catch (error: any) {
      console.error('Failed to switch:', error);
      if (error.code === 4001) {
        toast({ title: "Request cancelled", description: "You cancelled the request", variant: "destructive" });
      } else if (error.code === 4902) {
        const params = getIntuitionNetworkParams(!isMainnet, chainId);

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params
        });

        await switchNetwork();

        toast({ title: "Network added!", description: `Intuition ${isMainnet ? "Mainnet" : "Testnet"} has been added to your wallet` });
      }
      else {
        toast({ title: "Failed to add and switch network", description: error.message || "Please try again", variant: "destructive" });
      }
    }
  };

  const NetworkBadge = () => (
    <button
      onClick={handleAddAndSwitchNetwork}
      className="flex items-center gap-2 glass glass-hover px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer"
      title={`Add Intuition ${isMainnet ? "Mainnet" : "Testnet"} to wallet`}
    >
      {/* <img src="/claim1.jpg" alt="" className="w-8 h-auto rounded-full" /> */}
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-xs sm:text-sm font-medium text-white hidden sm:inline">
        Intuition {isMainnet ? "Mainnet" : "Testnet"}
      </span>
    </button>
  );

  const LevelBadge = () => (
    <Link href="/profile">
      <div className="flex items-center gap-2 cursor-pointer glass glass-hover p-2 sm:px-4 rounded-full transition-all">
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.6)]">
          <span className="text-white text-sm font-bold">{levelNumber}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-white/50 font-medium">Level</span>
          <span className="text-xs sm:text-sm font-bold text-white hidden sm:block">
            {levelName}
          </span>
        </div>
      </div>
    </Link>
  );

  const showLevelInHeader = hasServerProfile || walletConnected;

  return (
    <div className="flex items-center gap-4">
      {walletConnected && <NetworkBadge />}
      {showLevelInHeader && <LevelBadge />}

      {hasServerProfile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full p-0 transition-transform duration-200 hover:scale-[1.05] active:scale-95"
                data-testid="profile-dropdown"
              >
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-border">
                  <AvatarImage src={user.profilePic ?? ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full z-0"></div>
                </Avatar>
              </Button>
              {/* <div className="absolute top-1 right-1 bg-background/90 border border-border rounded px-1.5 py-0.5 text-xs font-bold text-foreground z-10" data-testid="text-level">
                Lv{levelNumber} - {levelName}
              </div> */}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 sm:w-64 p-2 glass rounded-2xl sm:rounded-3xl border-white/10 animate-in fade-in zoom-in-95 duration-150"
            align="end" data-testid="profile-dropdown-menu">
            <DropdownMenuItem className="cursor-default p-3 text-base text-white">
              <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No wallet connected'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer p-3 text-base">
                <User className="mr-3 h-5 w-5" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem asChild>
              <Link href="/achievements" className="w-full cursor-pointer p-3 text-base">
                <Trophy className="mr-3 h-5 w-5" />
                <span>Achievements</span>
              </Link>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-3 text-base">
              <LogOut className="mr-3 h-5 w-5" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : walletConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-3 py-2">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Profile"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 glass rounded-3xl border-white/10">
            <DropdownMenuItem className="cursor-default p-2 text-base text-white">
              <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No wallet connected'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer p-2 text-base">
                <User className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-2 text-base">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SignUpPopup mode="user" />
      )}
    </div>
  );
};