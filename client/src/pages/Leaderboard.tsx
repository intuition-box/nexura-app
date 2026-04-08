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
  profilePic?: string;  
  xp: number;
  level: number;
  lessonsCompleted: number;
  events: number;
  questsCompleted?: number;
  campaignsCompleted?: number;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [list, setList] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState("All Time");
  // const ranges = ["Last 7 Days", "Last 30 Days", "Last 3 Months", "All Time"];
  // const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { leaderboardInfo } = await apiRequestV2("GET", "/api/leaderboard");
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
  const currentUser = list.find((e) => e._id === currentUserId);

  /////////////////// mock dataaaaaaaaaaaaaa
  {/* Temporary mock data fallback for design/testing */}
const mockPodium = [
  {
    _id: "mock-1",
    display_name: "Sophia",
    xp: 12450,
    profilePic: null,
  },
  {
    _id: "mock-2",
    display_name: "Jeremy",
    xp: 18200,
    profilePic: null,
  },
  {
    _id: "mock-3",
    display_name: "Daniel",
    xp: 10980,
    profilePic: null,
  },
];

// Use real list when available, otherwise use mock data while loading
const podiumList =
  !loading && !error && list.length >= 3 ? list : mockPodium;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative">
      <AnimatedBackground />
      <div className="w-full max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* LEFT SIDE */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6 gap-3 w-full">

            <div className="flex flex-col gap-2 sm:gap-3 w-full">
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
                  Rankings
                </span>
              </div>

                {/* Mobile only */}
  <div className="flex sm:hidden items-center gap-1 text-xs text-[#FFFFFFB2]">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E1A2] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E1A2]"></span>
    </span>
    <span>TOP 500</span>
  </div>
  </div>

<div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
  {/* Leaderboard Title */}
  <div className="flex items-center gap-2">
    <img src={gold} alt="Leaderboard" className="w-8 h-8 flex-shrink-0" />
    <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
      Leaderboard
    </h1>
  </div>
</div>

              <p className="mt-1 text-xs sm:text-base text-white/60 max-w-full sm:max-w-md">
                Real time ranking based on user engagement
              </p>
            </div>
          </div>

         {/* RIGHT SIDE MINI LEADERBOARD */}
<div className="mt-4 w-full sm:w-auto flex flex-col items-start sm:items-end">

{/* Mobile scaled version */}
<div className="flex sm:hidden justify-between px-1 rounded-2xl w-full overflow-x-auto border-2 border-[#8B3EFE] bg-transparent -mt-2">
  {[
    {
      label: "RANK",
      value:
        list.findIndex((e) => e._id === currentUserId) !== -1
          ? `#${list.findIndex((e) => e._id === currentUserId) + 1}`
          : "-",
      color: "#B65FC8",
      isRank: true,
    },
    { label: "EVENTS", value: currentUser?.events || 0, color: "#00E1A2" },
    { label: "QUESTS", value: currentUser?.questsCompleted || 0, color: "#8B3EFE" },
    { label: "CAMPAIGNS", value: currentUser?.campaignsCompleted || 0, color: "#B65FC8" },
    { label: "LESSONS", value: currentUser?.lessonsCompleted || 0, color: "#5A189A", bg: "#E0BBE4" },
    { label: "XP", value: currentUser?.xp || 0, color: "white", icon: xpIcon, noBadge: true },
  ].map((item, idx) => (
    <div key={idx} className="flex flex-col items-center justify-center px-2 py-1 min-w-[40px] relative">
      
      {/* RANK label on top */}
      {item.isRank && (
        <span className="text-[7px] font-semibold text-center text-[#FFFFFFB2] mb-1">
          {item.label}
        </span>
      )}

      {/* Value */}
      <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold">
        <span
          style={{
            color: item.isRank ? item.color : item.label === "XP" ? item.color : "white",
          }}
        >
          {item.value}
        </span>
        {item.icon && <img src={item.icon} alt={item.label} className="w-3 h-3" />}
      </div>

      {/* Badge below for non-RANK and non-XP */}
      {!item.noBadge && !item.isRank && (
        <span
          className="mt-1 px-2 py-[1px] rounded-2xl text-[6px] font-semibold text-center"
          style={{ backgroundColor: item.bg || item.color, color: item.bg ? item.color : "#000" }}
        >
          {item.label}
        </span>
      )}

      {/* Divider except last */}
      {idx !== 5 && <div className="w-[1px] bg-[#9143F6] h-6 absolute right-0 top-1/2 translate-y-[-50%]" />}
    </div>
  ))}
</div>
  <div className=" hidden sm:block w-full overflow-x-auto">
    <div
      className="flex text-sm justify-between px-2 rounded-2xl min-w-[300px] sm:min-w-[500px] max-w-full"
      style={{
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#8B3EFE",
        backgroundColor: "transparent",
      }}
    >
    {/* YOUR RANK */}
    <div className="flex flex-col items-center justify-center py-2 px-1">
      <span className="font-semibold text-[#FFFFFFB2]">
  <span className="sm:hidden">RANK</span>
  <span className="hidden sm:inline">YOUR RANK</span>
</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold text-[#B65FC8]">
          {list.findIndex((e) => e._id === currentUserId) !== -1
            ? `#${list.findIndex((e) => e._id === currentUserId) + 1}`
            : "-"}
        </span>
      </div>
    </div>

    {/* Divider */}
    <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

    {/* EVENTS - hidden on mobile */}
    <div className="hidden sm:flex flex-col items-center text-center py-3 px-1">
      <span className="font-bold text-white text-lg">
        {currentUser?.events || 0}
      </span>
      <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded-3xl text-[9px]">EVENTS</span>
    </div>

    {/* Divider */}
    <div className="hidden sm:block w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

    {/* QUESTS */}
    <div className="flex flex-col items-center text-center py-3 px-1">
      <span className="font-bold text-white text-lg">
        {currentUser?.questsCompleted || 0}
      </span>
      <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded-3xl text-[9px]">QUESTS</span>
    </div>

    {/* Divider */}
    <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

    {/* CAMPAIGNS */}
    <div className="flex flex-col items-center text-center py-3 px-1">
      <span className="font-bold text-white text-lg">
        {currentUser?.campaignsCompleted || 0}
      </span>
      <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded-3xl text-[9px]">CAMPAIGNS</span>
    </div>

    {/* Divider */}
    <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

    {/* LESSONS - hidden on mobile */}
    <div className="hidden sm:flex flex-col items-center text-center py-3 px-1">
      <span className="font-bold text-white text-lg">{currentUser?.lessonsCompleted || 0}</span>
      <span
        className="px-1 rounded-3xl text-[9px]"
        style={{ backgroundColor: "#E0BBE4", color: "#5A189A" }}
      >
        LESSONS
      </span>
    </div>

    {/* Divider */}
    <div className="hidden sm:block w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

    {/* XP */}
    <div className="flex flex-col items-center justify-center text-center py-3 px-1">
      <div className="flex items-center justify-center gap-1 text-white font-bold text-lg">
        <span className="font-bold text-white text-lg">{currentUser?.xp || 0}</span>
        <img src={xpIcon} alt="XP" className="w-5 h-5" />
      </div>
    </div>
  </div>
</div>

  {/* 500 USERS INDICATOR */}
  <div className="hidden sm:flex mt-2 sm:mt-3 items-center gap-1 text-sm sm:text-base text-[#FFFFFFB2] self-end">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E1A2] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E1A2]"></span>
    </span>
    <span>TOP 500</span>
  </div>
  </div>
        </header>
        
        {/* ------------------- PODIUM ------------------- */}
{list.length >= 3 && (
  <div className="relative mt-10">
    {/* Background gradient */}
    <div className="absolute inset-x-0 top-0 h-64" />
    <div className="flex justify-center items-end gap-2 sm:gap-5 relative">
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
          user?.profilePic ||
          `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(
            name
          )}`
        }
        className="w-full h-full object-cover rounded-full"
      />
      <AvatarFallback className="bg-white/10 text-white font-bold text-xl sm:text-2xl rounded-full">
        {name.charAt(0)}
      </AvatarFallback>

      {/* Rank Badge */}
      <div
        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-[10px] sm:text-xs z-999999 border-2 border-white`}
        style={{
          backgroundColor: idx === 0 ? "#cfcfcf" : idx === 1 ? "#f5c542" : "#cd7f32"
        }}
      >
        {idx === 0 ? 2 : idx === 1 ? 1 : 3}
      </div>
    </Avatar>

    {/* Name */}
    <h3 className="text-xs sm:text-sm font-semibold mt-1">{name}</h3>

    {/* XP */}
    <div className="mt-1 px-1 py-[0.5px] rounded-md bg-[#8B3EFE] flex items-center gap-1 text-xs sm:text-sm font-semibold text-white">
      <span>{xp}</span>
      <img src={xpIcon} className="w-4 sm:w-5 h-4 sm:h-5" />
    </div>
</div>

            {/* Podium Image */}
<img
  src={podiumImages[idx]}
  alt={`Podium ${idx + 1}`}
  width={idx === 1 ? 100 : podiumWidth}
  height={idx === 1 ? 120 : podiumHeight}
  className={`${idx !== 1 ? "mt-1 translate-y-[4px] sm:translate-y-[11px]" : "mt-1"} sm:w-[120px] sm:h-[140px]"`}
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
  {/* Desktop border */}
  <img
    src="/leaderboard-border.png"
    alt="Podium border"
    className="hidden sm:block w-max h-auto object-contain mx-auto"
  />
</div>

{/* Mobile border + headers inside */}
<div className="block sm:hidden relative w-full flex justify-center min-w-0 px-2">
  {/* Border image */}
  <img
    src="/leaderboard-small-borderr.png"
    alt="Podium border small"
    className="absolute top-0 left-1/2 -translate-x-1/2 w-[103%] max-w-none h-auto object-contain"
    style={{ transform: "translate(-50%, -53px)" }}
  />

  {/* Table headers inside the border container */}
  <div
    className="absolute top-0 left-0 z-10 grid w-full min-w-0 grid-cols-[42px_minmax(0,1fr)_48px] items-center px-2 text-[10px] font-bold text-[#FFFFFF99]"
    style={{ transform: "translateY(-32px)" }}
  >
    <div className="text-left">RANK</div>

    <div className="truncate pl-1 text-left">USER</div>

    <div className="flex items-center justify-end gap-[2px] text-right">
      <span>XP</span>
      <img src="/nexura-xp.png" alt="XP" className="w-3 h-3 shrink-0" />
    </div>
  </div>
</div>

    {/* Table headers - Desktop only */}
<div
  className="hidden sm:grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr] gap-2 font-bold text-[#FFFFFF99] text-sm relative z-10"
  style={{
    transform: "translateY(-5px)",
  }}
>
  <div className="ml-5">RANK</div>
  <div className="ml-10 ">USER</div>

  <div className="relative flex items-center justify-center gap-1 group">
    <span>EVENTS</span>
    <img src="/question.png" alt="Events" className="w-3 h-3 cursor-pointer" />

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

  <div className="relative flex items-center justify-center gap-1 group">
    <span>QUESTS</span>
    <img src="/question.png" alt="Quests" className="w-3 h-3 cursor-pointer" />

    {/* Tooltip */}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
      <div className="font-semibold mb-1 flex items-center gap-1">
        <img src="/question.png" alt="Quests" className="w-3 h-3" />
        QUESTS
      </div>
      <div>This is the total number of quests a user has completed.</div>
    </div>
  </div>

  <div className="relative flex items-center justify-center gap-1 group">
    <span>CAMPAIGNS</span>
    <img src="/question.png" alt="Campaigns" className="w-3 h-3 cursor-pointer" />

    {/* Tooltip */}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
      <div className="font-semibold mb-1 flex items-center gap-1">
        <img src="/question.png" alt="Campaigns" className="w-3 h-3" />
        CAMPAIGNS
      </div>
      <div>This is the total number of campaigns a user has completed.</div>
    </div>
  </div>

  <div className="relative flex items-center justify-center gap-1 group">
    <span>LESSONS</span>
    <img src="/question.png" alt="Lessons" className="w-3 h-3 cursor-pointer" />

    {/* Tooltip */}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
      <div className="font-semibold mb-1 flex items-center gap-1">
        <img src="/question.png" alt="Lessons" className="w-3 h-3" />
        LESSONS
      </div>
      <div>This is the total number of lessons a user has completed.</div>
    </div>
  </div>

  <div className="flex items-center justify-center gap-1">
    <span>XP</span>
    <img src="/nexura-xp.png" alt="XP" className="w-6 h-6" />
  </div>
</div>

{/* Leaderboard entries */}
<div className="space-y-2 pt-0 sm:pt-[10px]">
  {list.map((entry, idx) => {
    const name = entry?.display_name || entry?.username || "Anonymous";
    const isCurrentUser = currentUserId && entry._id === currentUserId;
    const rank = idx + 1;
    const events = entry?.events ?? 0;
const quests = entry?.questsCompleted ?? 0;
const campaigns = entry?.campaignsCompleted ?? 0;
const lessons = entry?.lessonsCompleted ?? 0;
const xp = entry?.xp ?? 0;

    let rankBg = "";
    if (rank === 1) rankBg = "bg-yellow-400 text-white border border-white";
    else if (rank === 2) rankBg = "bg-gray-300 text-white border border-white";
    else if (rank === 3) rankBg = "bg-orange-400 text-white border border-white";

    const borderColors = ["#FF69B4", "#8B3EFE", "#00E1A2", "#3498DB", "#FFB400", "#FF5F6D"];
    const borderColor = borderColors[idx % borderColors.length];

    return (
<Card
  key={entry._id}
  className="relative w-[calc(100%+10px)] -ml-[5px] sm:w-full sm:ml-0 rounded-2xl hover:brightness-110 overflow-hidden"
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
  }}
>
  {/* -------------------- Desktop Layout -------------------- */}
  <div className="hidden sm:grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr] items-start gap-2 p-1">
    {/* RANK */}
    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${rankBg}`}>
      #{rank}
    </div>

    {/* USER */}
    <div className="flex items-center gap-1 truncate">
      <Avatar className="w-10 h-10 rounded-full overflow-hidden">
        <AvatarImage
          src={
            entry?.profilePic ||
            `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}`
          }
          className="w-full h-full object-cover rounded-full"
        />
        <AvatarFallback className="bg-white/10 text-white font-bold">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{name}</span>
    </div>

    {/* EVENTS */}
    <div className="flex flex-col items-center text-center">
      <span className="font-bold">{events}</span>
      <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded text-[9px]">EVENTS</span>
    </div>

    {/* QUESTS */}
    <div className="flex flex-col items-center text-center">
      <span className="font-bold">{quests}</span>
      <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded text-[9px]">QUESTS</span>
    </div>

    {/* CAMPAIGNS */}
    <div className="flex flex-col items-center text-center">
      <span className="font-bold">{campaigns}</span>
      <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded text-[9px]">CAMPAIGNS</span>
    </div>

    {/* LESSONS */}
    <div className="flex flex-col items-center text-center">
      <span className="font-bold">{lessons}</span>
      <span className="text-[#5A189A] bg-[#E0BBE4] px-1 rounded text-[9px]">LESSONS</span>
    </div>

    {/* XP */}
    <div className="flex items-center justify-center h-full">
      <span className="font-bold text-white text-xl">{xp}</span>
      <img src={xpIcon} alt="XP" className="w-5 h-5 ml-1" />
    </div>
  </div>

  {/* -------------------- Mobile Layout -------------------- */}
<div className="sm:hidden flex items-center gap-1.5 p-2 min-w-0">
  {/* Rank */}
  <div
    className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${rankBg}`}
  >
    #{rank}
  </div>

  {/* Avatar */}
  <Avatar className="shrink-0 w-6 h-6 rounded-full overflow-hidden">
    <AvatarImage
      src={
        entry?.profilePic ||
        `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}`
      }
      className="w-full h-full object-cover rounded-full"
    />
    <AvatarFallback className="bg-white/10 text-white font-bold text-xs">
      {name.charAt(0)}
    </AvatarFallback>
  </Avatar>

  {/* Name + badges */}
  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 overflow-hidden">
    {/* Name */}
    <span className="truncate text-xs font-semibold leading-none">
      {name}
    </span>

{/* Badges with values outside */}
<div className="flex items-center gap-[4px] overflow-x-auto whitespace-nowrap pr-1 scrollbar-hide">
  <div className="flex items-center gap-[1px]">
    <span className="text-[8px] font-bold text-white">{events}</span>
    <div className="shrink-0 flex items-center rounded-2xl bg-[#00E1A233] px-[4px] py-[4px]">
      <span className="text-[6px] font-medium text-[#00E1A2E5] leading-none">EVENTS</span>
    </div>
  </div>

  <div className="flex items-center gap-[1px]">
    <span className="text-[8px] font-bold text-white">{quests}</span>
    <div className="shrink-0 flex items-center rounded-2xl bg-[#8B3EFE33] px-[4px] py-[4px]">
      <span className="text-[6px] font-medium text-[#8B3EFEE5] leading-none">QUESTS</span>
    </div>
  </div>

  <div className="flex items-center gap-[1px]">
    <span className="text-[8px] font-bold text-white">{campaigns}</span>
    <div className="shrink-0 flex items-center rounded-2xl bg-[#B65FC833] px-[4px] py-[4px]">
      <span className="text-[6px] font-medium text-[#B65FC8E5] leading-none">CAMPAIGNS</span>
    </div>
  </div>

  <div className="flex items-center gap-[1px]">
    <span className="text-[8px] font-bold text-white">{lessons}</span>
    <div className="shrink-0 flex items-center rounded-2xl bg-[#E0BBE433] px-[4px] py-[4px]">
      <span className="text-[6px] font-medium text-[#C084FC] leading-none tracking-[-0.02em]">LESSONS</span>
    </div>
  </div>
</div>
</div>

  {/* XP */}
  <div className="shrink-0 flex items-center gap-1 self-center pl-1">
    <span className="text-[11px] font-bold text-white">{xp}</span>
    <img src={xpIcon} alt="XP" className="w-3.5 h-3.5" />
  </div>
</div>
</Card>
    );
  })}
</div>
  </div>
  </>
)}
</div>
      </div>
    </div>
  );
};