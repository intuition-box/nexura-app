"use client";

import { useEffect, useState, useRef } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import gold from "/nexura-gold.png";
import silver from "/nexura-silver.png";
import bronze from "/nexura-bronze.png";
import xpIcon from "/nexura-xp.png";

type Entry = {
  id: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  xp: number;
  level: number;
  quests_completed?: number;
  tasks_completed?: number;
};

const MOCK_LEADERBOARD: Entry[] = [
  { id: "1", username: "Rchris", xp: 1500, level: 10, quests_completed: 12, tasks_completed: 30 },
  { id: "2", username: "Nuel", xp: 1200, level: 8, quests_completed: 8, tasks_completed: 25 },
  { id: "3", username: "Unknown", xp: 900, level: 7, quests_completed: 5, tasks_completed: 20 },
  { id: "4", username: "Beardless", xp: 800, level: 6, quests_completed: 4, tasks_completed: 15 },
  { id: "5", username: "Promise", xp: 700, level: 5, quests_completed: 3, tasks_completed: 10 },
  { id: "6", username: "Orion", xp: 600, level: 5, quests_completed: 3, tasks_completed: 9 },
  { id: "7", username: "Shebah", xp: 500, level: 4, quests_completed: 2, tasks_completed: 8 },
  { id: "8", username: "David", xp: 400, level: 3, quests_completed: 1, tasks_completed: 7 },
  { id: "9", username: "Omotola", xp: 300, level: 2, quests_completed: 1, tasks_completed: 5 },
  { id: "10", username: "Fiyin", xp: 200, level: 1, quests_completed: 0, tasks_completed: 3 },
  { id: "11", username: "Chinedu", xp: 180, level: 1, quests_completed: 0, tasks_completed: 2 },
  { id: "12", username: "Funke", xp: 170, level: 1, quests_completed: 0, tasks_completed: 2 },
  { id: "13", username: "Tunde", xp: 160, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "14", username: "Ngozi", xp: 150, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "15", username: "Adeola", xp: 140, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "16", username: "Ifeanyi", xp: 130, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "17", username: "Aisha", xp: 120, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "18", username: "Segun", xp: 110, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "19", username: "Bolaji", xp: 100, level: 1, quests_completed: 0, tasks_completed: 1 },
  { id: "20", username: "Kemi", xp: 90, level: 1, quests_completed: 0, tasks_completed: 1 },
];

export default function Leaderboard() {
  const [list, setList] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const currentUserRowRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setList(MOCK_LEADERBOARD);
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const currentUserId = "12"; // Logged-in user ID
  const [cardState, setCardState] = useState<"floatingBottom" | "normal" | "stickyTop">("normal");

  useEffect(() => {
    if (!currentUserRowRef.current) return;

    const cardEl = currentUserRowRef.current;
    const topSentinel = topSentinelRef.current;
    const bottomSentinel = bottomSentinelRef.current;
    if (!topSentinel || !bottomSentinel) return;

    const resizeObserver = new ResizeObserver(() => setCardHeight(cardEl.offsetHeight));
    resizeObserver.observe(cardEl);

    const observer = new IntersectionObserver(
      (entries) => {
        let topVisible = true;
        let bottomVisible = true;

        entries.forEach((entry) => {
          if (entry.target === topSentinel) topVisible = entry.isIntersecting;
          if (entry.target === bottomSentinel) bottomVisible = entry.isIntersecting;
        });

        if (!topVisible) setCardState("floatingBottom");
        else if (!bottomVisible) setCardState("stickyTop");
        else setCardState("normal");
      },
      { threshold: 0 }
    );

    observer.observe(topSentinel);
    observer.observe(bottomSentinel);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [list]);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={gold} alt="Leaderboard" className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">Leaderboard</h1>
          </div>

          {!loading && !error && (
            <Badge variant="outline" className="border-white/20 text-white text-sm sm:text-base">
              {list.length} Players
            </Badge>
          )}
        </header>

        {/* PODIUM */}
{!loading && !error && list.length > 0 && (
  <div className="relative mt-12 sm:mt-16">
    <div className="absolute inset-x-0 top-0 h-48 sm:h-64 bg-gradient-to-b from-purple-500/20 via-purple-700/20 to-black/0 rounded-3xl -z-10" />

    <div className="flex flex-col sm:flex-row justify-center items-center sm:items-end gap-4 sm:gap-6">
      {(
        window.innerWidth < 640
          ? [1, 0, 2] // MOBILE: gold (1) middle, silver (0) left, bronze (2) right
          : [1, 0, 2] // DESKTOP: original polygon order
      ).map((userIndex, idx) => {
        const user = list[userIndex];
        const name = user.display_name || user.username || "Anonymous";
        const xp = user.xp;

        const isMobile = window.innerWidth < 640;

        // PODIUM SIZES
        const podiumHeights = isMobile ? [80, 90, 70] : [90, 140, 80];
        const podiumWidths = isMobile ? [70, 90, 70] : [100, 120, 100];
        const height = podiumHeights[idx];
        const width = podiumWidths[idx];
        const topDepth = 16;

        // Podium numbers (for medal circle)
        const podiumNumbers = [2, 1, 3]; // 1=center gold, 2=left silver, 3=right bronze

        // Medals
        const medalImgs = [silver, gold, bronze];
        const medalColors = ["#cfcfcf", "#f5c542", "#cd7f32"];
        const medalImg = medalImgs[idx];
        const medalColor = medalColors[idx];
        const medalWidth = isMobile ? [35, 45, 35][idx] : [40, 60, 30][idx];
        const medalHeight = isMobile ? [35, 45, 35][idx] : [30, 60, 30][idx];

        return (
      <div
        key={user.id}
        className={`flex ${isMobile ? "flex-col items-center" : "flex-col items-center"} relative`}
        style={{ minWidth: width }}
      >
            {isMobile ? (
  // MOBILE: Circle podium
  <div
    className="relative flex flex-col items-center justify-center rounded-full shadow-xl border-2 border-white"
    style={{
      width: width,
      height: height,
      background: `radial-gradient(circle at top, ${medalColor} 0%, ${medalColor}80 80%)`,
    }}
  >
    {/* Podium number badge */}
    <div className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full bg-white text-purple-900 font-bold text-sm shadow-md border border-purple-700">
      {podiumNumbers[idx]}
    </div>

    {/* User info */}
    <div className="flex flex-col items-center justify-center text-center px-3">
      <span className="font-bold text-purple-900 text-xs truncate max-w-[70px]">
        {name}
      </span>
      <span className="flex items-center gap-1 text-purple-900 text-xs mt-1 justify-center">
        <img src="/nexura-xp-dark.png" className="w-3 h-3" alt="XP" />
        {xp}
      </span>
    </div>

    {/* Optional glow border */}
    <div className="absolute inset-0 rounded-full border-2 border-purple-500 opacity-50 animate-pulse"></div>
  </div>
) : (
             // DESKTOP: Polygon podium
              <svg
                width={width}
                height={height + topDepth + 12}
                viewBox={`0 0 ${width} ${height + topDepth + 12}`}
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
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                </defs>

                <ellipse
                  cx={width / 2}
                  cy={height + topDepth + 6}
                  rx={width / 2 - 6}
                  ry="4"
                  fill="rgba(0,0,0,0.55)"
                  filter={`url(#shadow-${idx})`}
                />

                <polygon
                  points={`8,0 ${width - 8},0 ${width},${topDepth} 0,${topDepth}`}
                  fill="rgba(255,255,255,0.22)"
                />
                <polygon
                  points={`0,${topDepth} ${width},${topDepth} ${width},${height + topDepth} 0,${height + topDepth}`}
                  fill={`url(#material-${idx})`}
                />
                <polygon
                  points={`0,${topDepth} ${width},${topDepth} ${width},${height + topDepth} 0,${height + topDepth}`}
                  fill={`url(#inner-${idx})`}
                />

                <g transform={`translate(${width / 2 - medalWidth / 2}, ${topDepth + height / 2 - medalHeight / 2})`}>
                  <image href={medalImg} width={medalWidth} height={medalHeight} />
                  <g transform={`translate(${medalWidth / 2 - 12}, -10)`}>
                    <circle cx="12" cy="12" r="12" fill={medalColor} fillOpacity="0.5" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
                    <text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="900" fill="#111">
                      {podiumNumbers[idx]}
                    </text>
                  </g>
                </g>

                <foreignObject x={width / 2 - 28} y={height + topDepth - 16} width="56" height="20">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold text-white/90">
                    <img src={xpIcon} className="w-4 h-4" />
                    {xp}
                  </div>
                </foreignObject>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}



        {/* REMAINING USERS */}
        <div className="space-y-3 relative">
          {list.map((entry, idx) => {
            if (idx < 3) return null;
            const name = entry.display_name || entry.username || "Anonymous";
            const isCurrentUser = entry.id === currentUserId;
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
      " fixed bottom-3 left-1/2 transform -translate-x-1/2 p-3 sm:p-4 rounded-3xl border-4 w-[95%] xs:w-[90%] sm:w-full max-w-xl hover:brightness-110"; // unified padding & border
  } else if (cardState === "stickyTop") {
    positionClass +=
      " fixed top-3 left-1/2 transform -translate-x-1/2 z-50 p-3 sm:p-4 rounded-3xl border-4 w-[95%] xs:w-[90%] sm:w-full max-w-xl hover:brightness-110"; // same
  }
}
            return (
              <div key={entry.id} className="relative">
                {isCurrentUser && <div ref={topSentinelRef} className="h-px w-full" />}
                {isCurrentUser && <div ref={placeholderRef} style={{ height: cardState === "normal" ? 0 : cardHeight, transition: "height 0.3s ease-in-out", pointerEvents: "none" }} />}
                {isCurrentUser && <div ref={bottomSentinelRef} className="h-px w-full" />}

                <Card
                  ref={isCurrentUser ? currentUserRowRef : null}
                  className={`p-3 sm:p-4 rounded-3xl border-4 hover:brightness-110 ${positionClass}`}
                  style={{
                    borderColor: isCurrentUser ? "#f5c542" : accent.border,
                    boxShadow: isCurrentUser
                      ? "0 0 14px #f5c54288, 0 0 18px #f5c54244"
                      : `0 0 8px ${accent.border}66, 0 0 16px ${accent.border}44`,
                    background: "linear-gradient(to right, rgba(255,255,255,0.05), rgba(0,0,0,0.4))",
                    transition: "all 0.3s ease-in-out",
                    zIndex: isCurrentUser ? 50 : "auto",
                  }}
                >
                  <div className="flex flex-col items-start sm:items-center">
  {isCurrentUser && (
    <div
      className="
        text-sm
        xs:text-base
        sm:text-lg
        md:text-xl
        font-bold
        mb-1
        xs:mb-1.5
        sm:mb-2
        text-blue-400
        bg-gradient-to-r
        from-blue-300
        via-blue-500
        to-blue-400
        bg-clip-text
        text-transparent
        animate-pulse
        truncate
      "
      style={{ maxWidth: '100%' }}
    >
      Your Ranking
    </div>
  )}
</div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold border-2 ${isCurrentUser ? "bg-[#f5c542]/20 text-[#f5c542]" : `${accent.text} ${accent.bg}`}`}
                        style={{
                          borderColor: isCurrentUser ? "#f5c542" : accent.border,
                          boxShadow: isCurrentUser
                            ? "0 0 4px #f5c54266, 0 0 8px #f5c54244"
                            : `0 0 4px ${accent.border}66, 0 0 8px ${accent.border}44`,
                        }}>
                        #{rank}
                      </div>

                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        {entry.avatar ? (
                          <AvatarImage src={entry.avatar} />
                        ) : (
                          <AvatarFallback className="bg-white/10 text-white">{name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>

                      <div>
                        <h3 className="font-semibold text-sm sm:text-lg text-white tracking-wide">{name}</h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs sm:text-sm">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-400/20">
                            {entry.quests_completed || 0} quests
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/20">
                            {entry.tasks_completed || 0} campaigns
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-2 sm:mt-0">
                      <img src={xpIcon} alt="XP" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className={`text-lg sm:text-xl font-bold ${isCurrentUser ? "text-[#f5c542]" : accent.text}`}>{entry.xp}</span>
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
