// import { useEffect, useState } from "react";
// import AnimatedBackground from "../components/AnimatedBackground";
// import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
// import { Card } from "../components/ui/card";
// import { apiRequestV2 } from "../lib/queryClient";
// import { useAuth } from "../lib/auth";
// import gold from "/nexura-gold.png";
// import leader from "/leader.png";
// import leader2 from "/leader-2.png";
// import leader3 from "/leader-3.png";
// import xpIcon from "/nexura-xp.png";

// type Entry = {
//   _id: string;
//   username?: string;
//   display_name?: string;
//   avatar?: string;      
//   profilePic?: string;  
//   xp: number;
//   level: number;
//   lessonsCompleted: number;
//   events: number;
//   questsCompleted?: number;
//   campaignsCompleted?: number;
// };

// export default function Leaderboard() {
//   const { user } = useAuth();
//   const [list, setList] = useState<Entry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeRange, setActiveRange] = useState("All Time");
//   const ranges = ["Last 7 Days", "Last 30 Days", "Last 3 Months", "All Time"];
  
//   useEffect(() => {
//     const timer = setTimeout(async () => {
//     try {
//       const { leaderboardInfo } = await apiRequestV2(
//         "GET",
//         "/api/leaderboard"
//       );
//       setList(leaderboardInfo || []);
//     } catch (err: any) {
//       setError(err.message || "Failed to load leaderboard");
//     } finally {
//       setLoading(false);
//     }
//   }, 500);
//   return () => clearTimeout(timer);
// }, []);

// const currentUserId = user?._id;
// const currentUser = list.find((e) => e._id === currentUserId);
// return (
//   <div className="min-h-screen bg-black text-white p-6 relative">
//       <AnimatedBackground />
//       <div className="w-full max-w-6xl mx-auto space-y-8 relative z-10">
//         <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

//           {/* LEFT SIDE */}
// <div className="flex items-center gap-3">

//       <div>
//         <div className="flex items-center gap-2 mb-0.5">
//           <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
//           <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
//             Rankings
//           </span>
//         </div>

//   <div className="flex items-center gap-2">
//     <img src={gold} alt="Leaderboard" className="w-10 h-10" />
//     <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
//       Leaderboard
//     </h1>
//   </div>

//         <p className="mt-2 text-sm sm:text-base text-white/60 max-w-md">
//           Real time ranking based on user engagement
//         </p>

// <div className="mt-4 flex gap-2 max-w-[45vw]">
//   {ranges.map((label) => (
//     <button
//       key={label}
//       onClick={() => setActiveRange(label)}
//       className={`rounded-full border px-2 py-1.5 text-xs font-medium text-white transition-all duration-200
//         ${activeRange === label ? "bg-[#8B3EFE] border-[#8B3EFE]" : "bg-transparent border-[#8B3EFE] hover:bg-[#8B3EFE]"
//       }`}
//     >
//       {label}
//     </button>
//   ))}
// </div>
//       </div>
//     </div>

//     {/* RIGHT SIDE MINI LEADERBOARD */}
// <div
//   className="-mt-24 w-full max-w-[500px] flex text-sm justify-between px-2 rounded-2xl overflow-hidden"
//   style={{
//     borderWidth: "2px",
//     borderStyle: "solid",
//     borderColor: "#8B3EFE",
//     backgroundColor: "transparent",
//   }}
// >
// {/* YOUR RANK */}
// <div className="flex flex-col items-center justify-center py-2">
//   <span className="font-semibold text-[#FFFFFFB2]">YOUR RANK</span>

//   <div className="mt-1 flex items-baseline gap-1">
//     <span className="text-lg font-bold text-[#B65FC8]">
//       {list.findIndex((e) => e._id === currentUserId) !== -1
//         ? `#${list.findIndex((e) => e._id === currentUserId) + 1}`
//         : "-"}
//     </span>

//     <span className="text-sm text-[#FFFFFFB2]">
//       /{list.length}
//     </span>
//   </div>
// </div>

//   {/* Divider */}
//   <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

//   {/* EVENTS */}
//   <div className="flex flex-col items-center text-center py-3">
//     <span className="font-bold text-white text-lg">
//   {currentUser?.events || 0}
// </span>
//     <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded-3xl text-[9px]">EVENTS</span>
//   </div>

//   {/* Divider */}
//   <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

//   {/* QUESTS */}
//   <div className="flex flex-col items-center text-center py-3">
// <span className="font-bold text-white text-lg">
//   {currentUser?.questsCompleted || 0}
// </span>
//     <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded-3xl text-[9px]">QUESTS</span>
//   </div>

//   {/* Divider */}
//   <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

//   {/* CAMPAIGNS */}
//   <div className="flex flex-col items-center text-center py-3">
// <span className="font-bold text-white text-lg">
//   {currentUser?.campaignsCompleted || 0}
// </span>
//     <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded-3xl text-[9px]">CAMPAIGNS</span>
//   </div>

//   {/* Divider */}
//   <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

//     {/* LESSONS */}
//   <div className="flex flex-col items-center text-center py-3">
// <span className="font-bold text-white text-lg">
//   {currentUser?.lessonsCompleted || 0}
// </span>
//     <span className="px-1 rounded-3xl text-[9px]" style={{ backgroundColor: "#E0BBE4", color: "#5A189A" }}>
//   LESSONS
// </span>
//   </div>

//     {/* Divider */}
//   <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] mx-1" />

//   {/* XP */}
//   <div className="flex flex-col items-center justify-center text-center py-3">
//     <div className="flex items-center justify-center gap-1 text-white font-bold text-lg">
//       <span className="font-bold text-white text-lg">
//   {currentUser?.xp || 0}
// </span>
//       <img src={xpIcon} alt="XP" className="w-5 h-5" />
//     </div>
//   </div>
// </div>
//         </header>
//         {/* ------------------- PODIUM ------------------- */}
// {!loading && !error && list.length > 0 && (
//   <div className="relative mt-10">
//     {/* Background gradient */}
//     <div className="absolute inset-x-0 top-0 h-64" />
//     <div className="flex justify-center items-end gap-3 sm:gap-5 relative">
//       {[1, 0, 2].map((userIndex, idx) => {
//         const user = list[userIndex];
//         const name = user?.display_name || user?.username || "Anonymous";
//         const xp = user?.xp;
//         const podiumImages = [leader2, leader, leader3]; 
//         const podiumWidth = idx === 1 ? 120 : 105;
//         const podiumHeight = idx === 1 ? 140 : 100;

//         return (
//           <div
//             key={user?._id}
//             className="flex flex-col items-center text-center relative"
//           >
// {/* Avatar + Name + XP */}
// <div className="flex flex-col items-center animate-bounce-slow relative">
// <Avatar className="w-16 h-16 ring-2 ring-white/15 relative rounded-full overflow-visible">
//   <AvatarImage
//     src={
//       user?.profilePic ||
//       `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(
//         name
//       )}`
//     }
//     className="w-full h-full object-cover rounded-full"
//   />
//   <AvatarFallback className="bg-white/10 text-white font-bold text-2xl rounded-full">
//     {name.charAt(0)}
//   </AvatarFallback>

// {/* Rank Badge */}
// <div
//   className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs z-999999 border-2 border-white`}
//   style={{
//     backgroundColor: idx === 0 ? "#cfcfcf" : idx === 1 ? "#f5c542" : "#cd7f32"
//   }}
// >
//   {idx === 0 ? 2 : idx === 1 ? 1 : 3}
// </div>
// </Avatar>

//   {/* Name */}
//   <h3 className="text-sm font-semibold mt-1">{name}</h3>

//   {/* XP */}
//   <div className="mt-1 px-1 py-[0.5px] rounded-md bg-[#8B3EFE] flex items-center gap-1 text-sm font-semibold text-white">
//     <span>{xp}</span>
//     <img src={xpIcon} className="w-5 h-5" />
//   </div>
// </div>

//             {/* Podium Image */}
// <img
//   src={podiumImages[idx]}
//   alt={`Podium ${idx + 1}`}
//   width={podiumWidth}
//   height={podiumHeight}
//   className={`mt-1 ${idx !== 1 ? "translate-y-3" : ""}`}
// />
//           </div>
//         );
//       })}
//     </div>
//   </div>
// )}

// {/* TOTAL LIST */}
// <div className="space-y-2 relative mt-4 text-sm px-2">
//   {loading ? (
//   <div className="flex flex-col items-center justify-center py-16 gap-3">
//     <div className="w-10 h-10 rounded-full border-4 border-[#8B3EFE33] border-t-[#8B3EFE] animate-spin" />
//     <span className="text-sm text-white/60 font-medium tracking-wide">
//       Loading leaderboard...
//     </span>
//   </div>
// ) : (
//   <>
//   {/* Table headers + border */}
//   <div className="relative">
//     {/* Custom border as image */}
//     <div className="absolute inset-x-0 top-0 z-0 -translate-y-[57px]">
//       <img
//         src="/leaderboard-border.png"
//         alt="Podium border"
//         className="w-max h-auto object-contain mx-auto"
//       />
//     </div>

//     {/* Table headers */}
// <div
//   className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr] gap-2 font-bold text-[#FFFFFF99] text-sm relative z-10"
//   style={{
//     transform: "translateY(-5px)",
//   }}
// >
//       <div className="ml-5">RANK</div>
//       <div className="ml-10 ">USER</div>

// <div className="relative flex items-center justify-center gap-1 group">
//   <span>EVENTS</span>
//   <img
//     src="/question.png"
//     alt="Events"
//     className="w-3 h-3 cursor-pointer"
//   />

//   {/* Tooltip */}
//   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
//     <div className="font-semibold mb-1 flex items-center gap-1">
//       <img src="/question.png" alt="Events" className="w-3 h-3" />
//       EVENTS
//     </div>
//     <div>
//       This is the total number of XP-based community events or activities a user has participated in and been rewarded for.
//     </div>
//   </div>
// </div>

// <div className="relative flex items-center justify-center gap-1 group">
//   <span>QUESTS</span>
//   <img
//     src="/question.png"
//     alt="Quests"
//     className="w-3 h-3 cursor-pointer"
//   />

//   {/* Tooltip */}
//   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
//     <div className="font-semibold mb-1 flex items-center gap-1">
//       <img src="/question.png" alt="Quests" className="w-3 h-3" />
//       QUESTS
//     </div>
//     <div>
//       This is the total number of quests completed by a user.
//     </div>
//   </div>
// </div>

// <div className="relative flex items-center justify-center gap-1 group">
//   <span>CAMPAIGNS</span>
//   <img
//     src="/question.png"
//     alt="Campaigns"
//     className="w-3 h-3 cursor-pointer"
//   />

//   {/* Tooltip */}
//   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
//     <div className="font-semibold mb-1 flex items-center gap-1">
//       <img src="/question.png" alt="Campaigns" className="w-3 h-3" />
//       CAMPAIGNS
//     </div>
//     <div>
//       This is the total number of campaigns completed by a user.
//     </div>
//   </div>
// </div>

// {/* LESSONS */}
// <div className="relative flex items-center justify-center gap-1 group">
//   <span>LESSONS</span>
//   <img
//     src="/question.png"
//     alt="Lessons"
//     className="w-3 h-3 cursor-pointer"
//   />

//   {/* Tooltip */}
//   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
//     <div className="font-semibold mb-1 flex items-center gap-1">
//       <img src="/question.png" alt="Lessons" className="w-3 h-3" />
//       CAMPAIGNS
//     </div>
//     <div>
//       This is the total number of lessons completed by a user.
//     </div>
//   </div>
// </div>


//       <div className="flex items-center justify-center gap-1">
//         <span>XP</span>
//         <img src="/nexura-xp.png" alt="XP" className="w-6 h-6" />
//       </div>
//     </div>
//   </div>

//   {/* Leaderboard entries */}
// <div className="space-y-2 pt-[10px] pl-[10px]">
//   {list.map((entry, idx) => {
//     const name = entry?.display_name || entry?.username || "Anonymous";
//     const isCurrentUser = currentUserId && entry._id === currentUserId;
//     const rank = idx + 1;
//     const events = entry?.events ?? 0;
// const quests = entry?.questsCompleted ?? 0;
// const campaigns = entry?.campaignsCompleted ?? 0;
// const lessons = entry?.lessonsCompleted ?? 0;
// const xp = entry?.xp ?? 0;

//     let rankBg = "";
//     if (rank === 1) rankBg = "bg-yellow-400 text-white border border-white";
//     else if (rank === 2) rankBg = "bg-gray-300 text-white border border-white";
//     else if (rank === 3) rankBg = "bg-orange-400 text-white border border-white";

//     const borderColors = ["#FF69B4", "#8B3EFE", "#00E1A2", "#3498DB", "#FFB400", "#FF5F6D"];
//     const borderColor = borderColors[idx % borderColors.length];

//     return (
//       <Card
//         key={entry._id}
//         className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr] items-start gap-2 p-1 rounded-2xl hover:brightness-110 overflow-hidden"
//         style={{
//           borderWidth: "2px",
//           borderStyle: "solid",
//           borderColor: borderColor,
//           borderRadius: "1rem",
//           boxShadow: isCurrentUser
//             ? "0 0 10px #f5c54266, 0 0 12px #f5c54244"
//             : "0 0 6px rgba(255,255,255,0.1)",
//           background: isCurrentUser
//             ? "linear-gradient(to right, rgba(245,197,66,0.06), rgba(0,0,0,0.2))"
//             : "linear-gradient(to right, rgba(255,255,255,0.02), rgba(0,0,0,0.1))",
//           maxWidth: "calc(100% - 4px)",
//         }}
//       >
//         {/* RANK */}
//         <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${rankBg}`}>
//           #{rank}
//         </div>

// {/* USER */}
// <div className="flex items-center gap-1 truncate">
//   <Avatar className="w-10 h-10 rounded-full overflow-hidden">
//     <AvatarImage
//       src={
//         entry?.profilePic || `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}`
//       }
//       className="w-full h-full object-cover rounded-full"
//     />
//     <AvatarFallback className="bg-white/10 text-white font-bold">
//       {name.charAt(0)}
//     </AvatarFallback>
//   </Avatar>
//   <span className="truncate">{name}</span>
// </div>

//         {/* EVENTS */}
//         <div className="flex flex-col items-center text-center">
//           <span className="font-bold">{events}</span>
//           <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded text-[9px]">EVENTS</span>
//         </div>

//         {/* QUESTS */}
//         <div className="flex flex-col items-center text-center">
//           <span className="font-bold">{quests}</span>
//           <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded text-[9px]">QUESTS</span>
//         </div>

//         {/* CAMPAIGNS */}
//         <div className="flex flex-col items-center text-center">
//           <span className="font-bold">{campaigns}</span>
//           <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded text-[9px]">CAMPAIGNS</span>
//         </div>

//         {/* LESSONS */}
//         <div className="flex flex-col items-center text-center">
//           <span className="font-bold">{lessons}</span>
//           <span className="text-[#5A189A] bg-[#E0BBE4] px-1 rounded text-[9px]">LESSONS</span>
//         </div>

//         {/* XP */}
// <div className="flex items-center justify-center h-full">
//   <span className="font-bold text-white text-xl">{xp}</span>
//   <img src={xpIcon} alt="XP" className="w-5 h-5 ml-1" />
// </div>
//       </Card>
//     );
//   })}
// </div>
//   </>
// )}
// </div>
//       </div>
//     </div>
//   );
// };


"use client";

import { useEffect, useState, useRef } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { apiRequestV2 } from "../lib/queryClient";
import { useAuth } from "../lib/auth";
import gold from "/nexura-gold.png";
import silver from "/nexura-silver.png";
import bronze from "/nexura-bronze.png";
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

const MOCK_LEADERBOARD: Entry[] = [
  { _id: "1", username: "Rchris", xp: 1500, level: 10, questsCompleted: 12, campaignsCompleted: 30 },
  { _id: "2", username: "Nuel", xp: 1200, level: 8, questsCompleted: 8, campaignsCompleted: 25 },
  { _id: "3", username: "Unknown", xp: 900, level: 7, questsCompleted: 5, campaignsCompleted: 20 },
  { _id: "4", username: "Beardless", xp: 800, level: 6, questsCompleted: 4, campaignsCompleted: 15 },
  { _id: "5", username: "Promise", xp: 700, level: 5, questsCompleted: 3, campaignsCompleted: 10 },
  { _id: "6", username: "Orion", xp: 600, level: 5, questsCompleted: 3, campaignsCompleted: 9 },
  { _id: "7", username: "Shebah", xp: 500, level: 4, questsCompleted: 2, campaignsCompleted: 8 },
  { _id: "8", username: "David", xp: 400, level: 3, questsCompleted: 1, campaignsCompleted: 7 },
  { _id: "9", username: "Omotola", xp: 300, level: 2, questsCompleted: 1, campaignsCompleted: 5 },
  { _id: "10", username: "Fiyin", xp: 200, level: 1, questsCompleted: 0, campaignsCompleted: 3 },
  { _id: "11", username: "Chinedu", xp: 180, level: 1, questsCompleted: 0, campaignsCompleted: 2 },
  { _id: "12", username: "Funke", xp: 170, level: 1, questsCompleted: 0, campaignsCompleted: 2 },
  { _id: "13", username: "Tunde", xp: 160, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "14", username: "Ngozi", xp: 150, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "15", username: "Adeola", xp: 140, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "16", username: "Ifeanyi", xp: 130, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "17", username: "Aisha", xp: 120, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "18", username: "Segun", xp: 110, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "19", username: "Bolaji", xp: 100, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
  { _id: "20", username: "Kemi", xp: 90, level: 1, questsCompleted: 0, campaignsCompleted: 1 },
];

export default function Leaderboard() {
  const { user } = useAuth();

  const [list, setList] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const currentUserRowRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const { leaderboardInfo, rank } = await apiRequestV2("GET", "/api/leaderboard");
        setList(leaderboardInfo.length > 0 ? leaderboardInfo : MOCK_LEADERBOARD);
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /* ------------------- CURRENT USER FLOAT/STICK LOGIC ------------------- */
  const currentUserId = user?._id ?? "8"; // Logged-in user ID
  const [cardState, setCardState] = useState<"floatingBottom" | "normal" | "stickyTop">("normal");

  // useEffect(() => {
  //   if (!currentUserRowRef.current) return;

  //   const cardEl = currentUserRowRef.current;
  //   const topSentinel = topSentinelRef.current;
  //   const bottomSentinel = bottomSentinelRef.current;
  //   if (!topSentinel || !bottomSentinel) return;

  //   // Measure card height dynamically
  //   const resizeObserver = new ResizeObserver(() => {
  //     setCardHeight(cardEl.offsetHeight);
  //   });
  //   resizeObserver.observe(cardEl);

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       let topVisible = true;
  //       let bottomVisible = true;

  //       entries.forEach((entry) => {
  //         if (entry?.target === topSentinel) {
  //           topVisible = entry?.isIntersecting;
  //         }
  //         if (entry?.target === bottomSentinel) {
  //           bottomVisible = entry?.isIntersecting;
  //         }
  //       });

  //       // PRIORITY FIX:
  //       if (!topVisible) {
  //         setCardState("floatingBottom");  // card below viewport → float bottom
  //       } else if (!bottomVisible) {
  //         setCardState("stickyTop"); // scroll down past card → stick to top
  //       } else {
  //         setCardState("normal"); // card in viewport → normal
  //       }
  //     }, { threshold: 0 }
  //   );

  //   observer.observe(topSentinel);
  //   observer.observe(bottomSentinel);

  //   return () => {
  //     observer.disconnect();
  //     resizeObserver.disconnect();
  //   };
  // }, [list]);

  return (
    // <div className="min-h-screen bg-black text-white p-6 relative">
    <div className="min-h-screen bg-black text-white p-6 relative">
      <AnimatedBackground />
      <div className="w-full max-w-3xl mx-auto space-y-8 relative z-10">

        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={gold} alt="Leaderboard" className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Rankings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">Leaderboard</h1>
            </div>
          </div>

          {!loading && !error && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-sm">{list.length} Players</span>
            </div>
          )}
        </header>

        {/* ------------------- PODIUM ------------------- */}
        {!loading && !error && list.length > 0 && (
          <div className="relative mt-10">
            {/* Background gradient */}
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-purple-500/15 via-purple-700/10 to-black/0 rounded-3xl -z-10" />

            {/* <div className="flex justify-center items-end gap-6 relative"> */}
            <div className="flex justify-center items-end gap-3 sm:gap-5 relative">
              {[1, 0, 2].map((userIndex, idx) => {
                const user = list[userIndex];
                const name = user?.display_name || user?.username || "Anonymous";
                const xp = user?.xp;

                // const heights = [130, 200, 110];
                const heights = [90, 140, 80];
                const height = heights[idx];
                const width = idx === 1 ? 120 : 105;
                const topDepth = 26;

                // Visual order: 2 – 1 – 3
                const podiumNumbers = [2, 1, 3];
                const podiumNumber = podiumNumbers[idx];

                const medals = [
                  { img: silver, color: "#cfcfcf" },
                  { img: gold, color: "#f5c542" },
                  { img: bronze, color: "#cd7f32" },
                ];
                const medal = medals[idx];

                const medalWidth = idx === 1 ? 120 : 100;
                const medalHeight = idx === 1 ? 84 : 70;

                const delayOrder = [0.3, 0, 0.6];
                const bounceDelay = `${delayOrder[idx]}s`;

                return (
                  <div
                    key={user?._id}
                    className="flex flex-col items-center text-center relative animate-bounce-slow"
                    style={{ animationDelay: bounceDelay }}
                  >
                    {/* Avatar */}
                    {/* <Avatar className="w-24 h-24 -translate-y-6 ring-2 ring-white/15"> */}
                    <Avatar className="w-12 h-12 sm:w-16 md:w-20 -translate-y-3 sm:-translate-y-5 ring-2 ring-white/15">

                      <AvatarImage
                        src={
                          user?.avatar ||
                          `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(
                            name
                          )}`
                        }
                      />
                      <AvatarFallback className="bg-white/10 text-white font-bold text-2xl">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-sm font-semibold mt-1">{name}</h3>

                    {/* Podium */}
                    <svg
                      width={width}
                      height={height + topDepth + 20}
                      viewBox={`0 0 ${width} ${height + topDepth + 20}`}
                    >
                      <defs>
                        <linearGradient id={`material-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(80,50,120,0.85)" />
                          <stop offset="35%" stopColor="rgba(100,70,140,0.85)" />
                          <stop offset="100%" stopColor="rgba(60,30,100,0.85)" />
                        </linearGradient>

                        <linearGradient id={`inner-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
                          <stop offset="40%" stopColor="rgba(0,0,0,0)" />
                        </linearGradient>

                        <filter id={`shadow-${idx}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="10" />
                        </filter>
                      </defs>

                      {/* Shadow */}
                      <ellipse
                        cx={width / 2}
                        cy={height + topDepth + 10}
                        rx={width / 2 - 10}
                        ry="6"
                        fill="rgba(0,0,0,0.55)"
                        filter={`url(#shadow-${idx})`}
                      />

                      {/* Top face */}
                      <polygon
                        points={`16,0 ${width - 16},0 ${width},${topDepth} 0,${topDepth}`}
                        fill="rgba(255,255,255,0.22)"
                      />

                      {/* Front face */}
                      <polygon
                        points={`0,${topDepth} ${width},${topDepth} ${width},${height + topDepth
                          } 0,${height + topDepth}`}
                        fill={`url(#material-${idx})`}
                      />

                      <polygon
                        points={`0,${topDepth} ${width},${topDepth} ${width},${height + topDepth
                          } 0,${height + topDepth}`}
                        fill={`url(#inner-${idx})`}
                      />

                      {/* Medal */}
                      <g
                        transform={`translate(${width / 2 - medalWidth / 2
                          }, ${topDepth + height / 5 - medalHeight / 2})`}
                      >
                        <image
                          href={medal.img}
                          width={medalWidth}
                          height={medalHeight}
                        />

                        {/* Rank badge */}
                        <g transform={`translate(${medalWidth / 2 - 18}, -14)`}>
                          <circle
                            cx="18"
                            cy="18"
                            r="18"
                            fill={medal.color}
                            fillOpacity="0.5"
                            stroke="white"
                            strokeOpacity="0.7"
                            strokeWidth="2"
                          />
                          <text
                            x="18"
                            y="24"
                            textAnchor="middle"
                            fontSize="20"
                            fontWeight="900"
                            fill="#111"
                          >
                            {podiumNumber}
                          </text>
                        </g>
                      </g>

                      {/* XP */}
                      <foreignObject
                        x={width / 2 - 40}
                        y={height + topDepth - 28}
                        width="80"
                        height="26"
                      >
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-white/90">
                          <img src={xpIcon} className="w-5 h-5" />
                          {xp}
                        </div>
                      </foreignObject>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3 relative">
          {list.map((entry, idx) => {
            if (idx < 3) return null; // skip podium

            const name = entry?.display_name || entry?.username || "Anonymous";
            const isCurrentUser = entry?._id === currentUserId;
            const rank = idx + 1;

            const accents = [
              { border: "#8e44ad", text: "#9b59b6", bg: "bg-[#8e44ad]/20" },
              { border: "#2980b9", text: "#3498db", bg: "bg-[#2980b9]/20" },
              { border: "#e84393", text: "#ff79b0", bg: "bg-[#e84393]/20" },
              { border: "#16a085", text: "#1abc9c", bg: "bg-[#16a085]/20" },
            ];

            const accent = accents[idx % accents.length];

            let positionClass = "relative transition-[top,bottom] duration-300 ease-in-out";
            if (isCurrentUser) {
              if (cardState === "floatingBottom") {
                positionClass +=
                  "fixed bottom-3 left-1/2 -translate-x-1/2 p-4 rounded-3xl border-2 w-[95%] w-full max-w-xl";
              } else if (cardState === "stickyTop") {
                positionClass +=
                  " fixed top-3 left-1/2 -translate-x-1/2 z-[999] p-4 rounded-3xl border-2 w-[95%] sm:w-full max-w-4xl";
              }
            }

            return (
              <div key={entry._id} className="relative">
                {isCurrentUser && <div ref={topSentinelRef} className="h-px w-full" />}
                {/* PLACEHOLDER */}
                {isCurrentUser && (
                  <div
                    ref={placeholderRef}
                    style={{
                      height: cardState === "normal" ? 0 : cardHeight, // occupy space only when card is fixed
                      transition: "height 0.3s ease-in-out",
                      pointerEvents: "none", // prevents accidental interactions
                    }}
                  />
                )}

                {isCurrentUser && <div ref={bottomSentinelRef} className="h-px w-full" />}

                {/* REAL CARD */}
                <Card
                  ref={isCurrentUser ? currentUserRowRef : null}
                  className={`p-3 sm:p-4 rounded-2xl border hover:brightness-110 ${positionClass}`}
                  style={{
                    borderColor: isCurrentUser ? "#f5c542" : accent.border,
                    boxShadow: isCurrentUser
                      ? "0 0 20px #f5c54288, 0 0 24px #f5c54244"
                      : `0 0 10px ${accent.border}44`,
                    background: isCurrentUser
                      ? "linear-gradient(to right, rgba(245,197,66,0.06), rgba(0,0,0,0.5))"
                      : "linear-gradient(to right, rgba(255,255,255,0.03), rgba(0,0,0,0.4))",
                    transition: "all 0.3s ease-in-out",
                    zIndex: isCurrentUser ? 50 : "auto",
                  }}
                >
                  <div className="flex flex-col">
                    {/* Display "Your Ranking" only for current user */}
                    {isCurrentUser && (
                      <div className="text-lg md:text-xl font-bold mb-2 text-blue-400 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-400 bg-clip-text text-transparent animate-pulse">
                        Your Ranking
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold border-2 ${isCurrentUser ? "bg-[#f5c542]/20 text-[#f5c542]" : `${accent.text} ${accent.bg}`
                          }`}
                        style={{
                          borderColor: isCurrentUser ? "#f5c542" : accent.border,
                          boxShadow: isCurrentUser
                            ? "0 0 6px #f5c54266, 0 0 12px #f5c54244"
                            : `0 0 6px ${accent.border}66, 0 0 12px ${accent.border}44`,
                        }}
                      >
                        #{rank}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        {entry?.avatar ? (
                          <AvatarImage src={entry?.avatar} />
                        ) : (
                          <AvatarFallback className="bg-white/10 text-white">{name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>

                      {/* Name */}
                      <div>
                        <h3 className="font-semibold text-lg text-white tracking-wide">
                          {name}
                        </h3>

                        <div className="mt-1 flex items-center gap-3 text-sm">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-400/20">
                            {entry?.questsCompleted || 0} quests
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/20">
                            {entry?.campaignsCompleted || 0} campaigns
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* XP */}
                    <div className="flex items-center gap-1">
                      <img src={xpIcon} alt="XP" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className={`text-xl font-bold ${isCurrentUser ? "text-[#f5c542]" : accent.text}`}>
                        {entry?.xp || 0}
                      </span>
                    </div>
                  </div>

                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};