
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
        const { leaderboardInfo: { leaderboardByXp } } = await apiRequestV2("GET", "/api/leaderboard");
        setList(leaderboardByXp.length > 0 ? leaderboardByXp : MOCK_LEADERBOARD);
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
  //         if (entry.target === topSentinel) {
  //           topVisible = entry.isIntersecting;
  //         }
  //         if (entry.target === bottomSentinel) {
  //           bottomVisible = entry.isIntersecting;
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
    <div className="min-h-screen bg-black text-white py-8 relative">
  <AnimatedBackground />
  <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">

        {/* <header className="flex items-center justify-between"> */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left side: icon + title */}
          <div className="flex items-center gap-3">
            <img src={gold} alt="Leaderboard" className="w-10 h-10" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">Leaderboard</h1>
          </div>

          {/* Right side: players badge */}
          {!loading && !error && (
            <Badge variant="outline" className="border-white/20 text-white">
              {list.length} Players
            </Badge>
          )}
        </header>

        {/* ------------------- PODIUM ------------------- */}
        {!loading && !error && list.length > 0 && (
          <div className="relative mt-16">
            {/* Background gradient */}
            <div
              className="
                absolute inset-x-0 top-0 h-64
                bg-gradient-to-b
                from-purple-500/20
                via-purple-700/20
                to-black/0
                rounded-3xl
                -z-10
              "
            />

            {/* <div className="flex justify-center items-end gap-6 relative"> */}
            <div className="flex justify-center items-end gap-3 sm:gap-5 relative">
              {[1, 0, 2].map((userIndex, idx) => {
                const user = list[userIndex];
                const name = user.display_name || user.username || "Anonymous";
                const xp = user.xp;

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
                    key={user._id}
                    className="flex flex-col items-center text-center relative animate-bounce-slow"
                    style={{ animationDelay: bounceDelay }}
                  >
                    {/* Avatar */}
                    {/* <Avatar className="w-24 h-24 -translate-y-6 ring-2 ring-white/15"> */}
                    <Avatar className="w-12 h-12 sm:w-16 md:w-20 -translate-y-3 sm:-translate-y-5 ring-2 ring-white/15">

                      <AvatarImage
                        src={
                          user.avatar ||
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

            const name = entry.display_name || entry.username || "Anonymous";
            const isCurrentUser = entry._id === currentUserId;
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
                  // className={`p-4 rounded-3xl border-4 hover:brightness-110 ${positionClass}`}
                  className={`p-3 sm:p-4 rounded-3xl border-4 hover:brightness-110 ${positionClass}`}
                  style={{
                    borderColor: isCurrentUser ? "#f5c542" : accent.border,
                    boxShadow: isCurrentUser
                      ? "0 0 20px #f5c54288, 0 0 24px #f5c54244"
                      : `0 0 14px ${accent.border}66, 0 0 26px ${accent.border}44`,
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.05), rgba(0,0,0,0.4))",
                    transition: "all 0.3s ease-in-out",
                    zIndex: isCurrentUser ? 50 : "auto", // extra guard
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
                        {entry.avatar ? (
                          <AvatarImage src={entry.avatar} />
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
                            {entry.questsCompleted || 0} quests
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/20">
                            {entry.campaignsCompleted || 0} campaigns
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* XP */}
                    <div className="flex items-center gap-1">
                      <img src={xpIcon} alt="XP" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className={`text-xl font-bold ${isCurrentUser ? "text-[#f5c542]" : accent.text}`}>
                        {entry.xp}
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
}