import { useEffect, useState } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card } from "../components/ui/card";
import { apiRequestV2 } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import gold from "/nexura-gold.png";
import leader from "/leader.png";
import leader2 from "/leader-2.png";
import leader3 from "/leader-3.png";
import xpIcon from "/nexura-xp.png";

type Entry = {
  _id: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  xp: number;
  level: number;
  questsCompleted?: number;
  campaignsCompleted?: number;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [list, setList] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState("All Time");
  const ranges = ["Last 7 Days", "Last 30 Days", "Last 3 Months", "All Time"];

useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      const { leaderboardInfo } = await apiRequestV2(
        "GET",
        "/api/leaderboard"
      );
      setList(leaderboardInfo || []);
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, 500);
  return () => clearTimeout(timer);
}, []);

const currentUserId = user?._id;
  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      <AnimatedBackground />
      <div className="w-full max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* LEFT SIDE */}
<div className="flex items-center gap-3">

      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
            Rankings
          </span>
        </div>

  <div className="flex items-center gap-2">
    <img src={gold} alt="Leaderboard" className="w-10 h-10" />
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
      Leaderboard
    </h1>
  </div>

        <p className="mt-2 text-sm sm:text-base text-white/60 max-w-md">
          Real time ranking based on user engagement
        </p>

<div className="mt-4 flex gap-2 max-w-[45vw]">
  {ranges.map((label) => (
    <button
      key={label}
      onClick={() => setActiveRange(label)}
      className={`rounded-full border px-2 py-1.5 text-xs font-medium text-white transition-all duration-200
        ${activeRange === label ? "bg-[#8B3EFE] border-[#8B3EFE]" : "bg-transparent border-[#8B3EFE] hover:bg-[#8B3EFE]"
      }`}
    >
      {label}
    </button>
  ))}
</div>
      </div>
    </div>

    {/* RIGHT SIDE MINI LEADERBOARD */}
<div
  className="-mt-24 w-full max-w-[450px] flex text-sm justify-between px-2 rounded-2xl overflow-hidden"
  style={{
    borderWidth: "2px",
    borderStyle: "solid",
    borderImage: "linear-gradient(90deg, #FF69B4, #8B3EFE, #00E1A2, #3498DB, #FFB400, #FF5F6D) 1",
    backgroundColor: "transparent",
  }}

>

  {/* YOUR RANK */}
  <div className="flex flex-col items-center justify-center py-2">
    <span className="font-semibold text-[#FFFFFFB2]">YOUR RANK</span>
    <div className="mt-1 flex items-baseline gap-1">
      <span className="text-lg font-bold text-[#B65FC8]">#45</span>
      <span className="text-sm text-[#FFFFFFB2]">/100</span>
    </div>
  </div>

    {/* Divider */}
  <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

  {/* EVENTS */}
  <div className="flex flex-col items-center text-center py-3">
    <span className="font-bold text-white text-lg">5</span>
    <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded-3xl text-[9px]">EVENTS</span>
  </div>

    {/* Divider */}
  <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

  {/* QUESTS */}
  <div className="flex flex-col items-center text-center py-3">
    <span className="font-bold text-white text-lg">24</span>
    <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded-3xl text-[9px]">QUESTS</span>
  </div>

    {/* Divider */}
  <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

  {/* CAMPAIGNS */}
  <div className="flex flex-col items-center text-center py-3">
    <span className="font-bold text-white text-lg">8</span>
    <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded-3xl text-[9px]">CAMPAIGNS</span>
  </div>

    {/* Divider */}
  <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

  {/* XP */}
  <div className="flex flex-col items-center justify-center text-center py-3">
    <div className="flex items-center justify-center gap-1 text-white font-bold text-lg">
      <span>29,000</span>
      <img src={xpIcon} alt="XP" className="w-5 h-5" />
    </div>
  </div>
</div>
        </header>
        {/* ------------------- PODIUM ------------------- */}
{!loading && !error && list.length > 0 && (
  <div className="relative mt-10">
    {/* Background gradient */}
    <div className="absolute inset-x-0 top-0 h-64" />
    <div className="flex justify-center items-end gap-3 sm:gap-5 relative">
      {[1, 0, 2].map((userIndex, idx) => {
        const user = list[userIndex];
        const name = user?.display_name || user?.username || "Anonymous";
        const xp = user?.xp;
        const podiumImages = [leader2, leader, leader3]; 
        const podiumWidth = idx === 1 ? 120 : 105;
        const podiumHeight = idx === 1 ? 140 : 100;

        return (
          <div
            key={user?._id}
            className="flex flex-col items-center text-center relative"
          >
{/* Avatar + Name + XP */}
<div className="flex flex-col items-center animate-bounce-slow relative">
<Avatar className="w-16 h-16 ring-2 ring-white/15 relative rounded-full overflow-visible">
  <AvatarImage
    src={
      user?.avatar ||
      `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(
        name
      )}`
    }
    className="w-full h-full object-cover rounded-full"
  />
  <AvatarFallback className="bg-white/10 text-white font-bold text-2xl rounded-full">
    {name.charAt(0)}
  </AvatarFallback>

{/* Rank Badge */}
<div
  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs z-999999 border-2 border-white`}
  style={{
    backgroundColor: idx === 0 ? "#cfcfcf" : idx === 1 ? "#f5c542" : "#cd7f32"
  }}
>
  {idx === 0 ? 2 : idx === 1 ? 1 : 3}
</div>
</Avatar>

  {/* Name */}
  <h3 className="text-sm font-semibold mt-1">{name}</h3>

  {/* XP */}
  <div className="mt-1 px-1 py-[0.5px] rounded-md bg-[#8B3EFE] flex items-center gap-1 text-sm font-semibold text-white">
    <span>{xp}</span>
    <img src={xpIcon} className="w-5 h-5" />
  </div>
</div>

            {/* Podium Image */}
            <img
              src={podiumImages[idx]}
              alt={`Podium ${idx + 1}`}
              width={podiumWidth}
              height={podiumHeight}
              className="mt-1"
            />
          </div>
        );
      })}
    </div>
  </div>
)}

{/* TOTAL LIST */}
<div className="space-y-2 relative mt-4 text-sm px-2">
  {loading ? (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-10 h-10 rounded-full border-4 border-[#8B3EFE33] border-t-[#8B3EFE] animate-spin" />
    <span className="text-sm text-white/60 font-medium tracking-wide">
      Loading leaderboard...
    </span>
  </div>
) : (
  <>
  {/* Table headers + border */}
  <div className="relative">
    {/* Custom border as image */}
    <div className="absolute inset-x-0 top-0 z-0 -translate-y-[57px]">
      <img
        src="/leaderboard-border.png"
        alt="Podium border"
        className="w-max h-auto object-contain mx-auto"
      />
    </div>

    {/* Table headers */}
      <div
    className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr] gap-2 font-bold text-[#FFFFFF99] text-sm relative z-10"
    style={{
      transform: "translateY(-5px)",
    }}
  >
      <div className="ml-5">RANK</div>
      <div className="ml-10 ">USER</div>

<div className="relative flex items-center justify-center gap-1 text-[#00E1A2E5] group">
  <span>EVENTS</span>
  <img
    src="/question.png"
    alt="Events"
    className="w-3 h-3 cursor-pointer"
  />

  {/* Tooltip */}
  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
    <div className="font-semibold mb-1 flex items-center gap-1">
      <img src="/question.png" alt="Events" className="w-3 h-3" />
      EVENTS
    </div>
    <div>
      This is the total number of XP-based community events or activities a user has participated in and been rewarded for.
    </div>
  </div>
</div>

<div className="relative flex items-center justify-center gap-1 text-[#8B3EFE33] group">
  <span>QUESTS</span>
  <img
    src="/question.png"
    alt="Quests"
    className="w-3 h-3 cursor-pointer"
  />

  {/* Tooltip */}
  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
    <div className="font-semibold mb-1 flex items-center gap-1">
      <img src="/question.png" alt="Quests" className="w-3 h-3" />
      QUESTS
    </div>
    <div>
      This is the total number of quests completed by a user.
    </div>
  </div>
</div>

<div className="relative flex items-center justify-center gap-1 text-[#B65FC833] group">
  <span>CAMPAIGNS</span>
  <img
    src="/question.png"
    alt="Campaigns"
    className="w-3 h-3 cursor-pointer"
  />

  {/* Tooltip */}
  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
    <div className="font-semibold mb-1 flex items-center gap-1">
      <img src="/question.png" alt="Campaigns" className="w-3 h-3" />
      CAMPAIGNS
    </div>
    <div>
      This is the total number of campaigns completed by a user.
    </div>
  </div>
</div>

      <div className="flex items-center justify-center gap-1">
        <span>XP</span>
        <img src="/nexura-xp.png" alt="XP" className="w-6 h-6" />
      </div>
    </div>
  </div>

  {/* Leaderboard entries */}
  <div className="space-y-2 pt-[10px] pl-[10px]">
    {list.map((entry, idx) => {
      const name = entry?.display_name || entry?.username || "Anonymous";
      const isCurrentUser = currentUserId && entry._id === currentUserId;
      const rank = idx + 1;

      let rankBg = "";
      if (rank === 1) rankBg = "bg-yellow-400 text-white border border-white";
      else if (rank === 2) rankBg = "bg-gray-300 text-white border border-white";
      else if (rank === 3) rankBg = "bg-orange-400 text-white border border-white";

      const borderColors = ["#FF69B4", "#8B3EFE", "#00E1A2", "#3498DB", "#FFB400", "#FF5F6D"];
      const borderColor = borderColors[idx % borderColors.length];

      return (
        <Card
          key={entry._id}
          className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr] items-center gap-2 p-1 rounded-2xl hover:brightness-110 overflow-hidden"
          style={{
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: borderColor,
            borderRadius: "1rem",
            boxShadow: isCurrentUser
              ? "0 0 10px #f5c54266, 0 0 12px #f5c54244"
              : "0 0 6px rgba(255,255,255,0.1)",
            background: isCurrentUser
              ? "linear-gradient(to right, rgba(245,197,66,0.06), rgba(0,0,0,0.2))"
              : "linear-gradient(to right, rgba(255,255,255,0.02), rgba(0,0,0,0.1))",
            maxWidth: "calc(100% - 4px)",
          }}
        >
          {/* RANK */}
          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${rankBg}`}>
            #{rank}
          </div>

          {/* USER */}
          <div className="flex items-center gap-1 truncate">
            <Avatar className="w-10 h-10 rounded-full overflow-hidden">
              {entry?.avatar ? (
                <AvatarImage src={entry.avatar} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-white/10 text-white font-bold">{name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <span className="truncate">{name}</span>
          </div>

          {/* EVENTS */}
          <div className="flex flex-col items-center text-center">
            <span className="font-bold">{entry?.events || 0}</span>
            <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded text-[9px]">EVENTS</span>
          </div>

          {/* QUESTS */}
          <div className="flex flex-col items-center text-center">
            <span className="font-bold">{entry?.questsCompleted || 0}</span>
            <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded text-[9px]">QUESTS</span>
          </div>

          {/* CAMPAIGNS */}
          <div className="flex flex-col items-center text-center">
            <span className="font-bold">{entry?.campaignsCompleted || 0}</span>
            <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded text-[9px]">CAMPAIGNS</span>
          </div>

          {/* XP */}
          <div className="flex items-center justify-center gap-1 text-white font-bold">
            <span>{entry?.xp || 0}</span>
            <img src={xpIcon} alt="XP" className="w-3 h-3" />
          </div>
        </Card>
      );
    })}
  </div>
  </>
)}
</div>
      </div>
    </div>
  );
};