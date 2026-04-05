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

/** Truncate long names/addresses for mobile display */
function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  if (name.startsWith("0x") && name.length > 12) {
    return `${name.slice(0, 6)}...${name.slice(-4)}`;
  }
  return `${name.slice(0, maxLen - 1)}...`;
}

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
  const currentUser = list.find((e) => e._id === currentUserId);

  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-6 relative">
      <AnimatedBackground />
      <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">

        {/* ------------------- HEADER ------------------- */}
        <header className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
                Rankings
              </span>
            </div>

            <div className="flex items-center gap-2">
              <img src={gold} alt="Leaderboard" className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Leaderboard
              </h1>
            </div>

            <p className="mt-1 sm:mt-2 text-xs sm:text-base text-white/60 max-w-md">
              Real time ranking based on user engagement
            </p>

            {/* Range filter - horizontal scroll on mobile */}
            <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
              {ranges.map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveRange(label)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium text-white transition-all duration-200 whitespace-nowrap min-h-[44px] flex items-center
                    ${activeRange === label
                      ? "bg-[#8B3EFE] border-[#8B3EFE]"
                      : "bg-transparent border-[#8B3EFE] hover:bg-[#8B3EFE]"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* YOUR STATS BAR - horizontal scroll on mobile */}
          <div
            className="w-full flex text-sm overflow-x-auto no-scrollbar rounded-2xl"
            style={{
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: "#8B3EFE",
              backgroundColor: "transparent",
            }}
          >
            {/* YOUR RANK */}
            <div className="flex flex-col items-center justify-center py-2 px-3 min-w-[70px] shrink-0">
              <span className="font-semibold text-[#FFFFFFB2] text-[10px] sm:text-xs whitespace-nowrap">YOUR RANK</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-bold text-[#B65FC8]">
                  {list.findIndex((e) => e._id === currentUserId) !== -1
                    ? `#${list.findIndex((e) => e._id === currentUserId) + 1}`
                    : "-"}
                </span>
                <span className="text-xs sm:text-sm text-[#FFFFFFB2]">
                  /{list.length}
                </span>
              </div>
            </div>

            <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] shrink-0" />

            {/* EVENTS */}
            <div className="flex flex-col items-center text-center py-3 px-2 min-w-[56px] shrink-0">
              <span className="font-bold text-white text-base sm:text-lg">{currentUser?.events || 0}</span>
              <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded-3xl text-[8px] sm:text-[9px]">EVENTS</span>
            </div>

            <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] shrink-0" />

            {/* QUESTS */}
            <div className="flex flex-col items-center text-center py-3 px-2 min-w-[56px] shrink-0">
              <span className="font-bold text-white text-base sm:text-lg">{currentUser?.questsCompleted || 0}</span>
              <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded-3xl text-[8px] sm:text-[9px]">QUESTS</span>
            </div>

            <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] shrink-0" />

            {/* CAMPAIGNS */}
            <div className="flex flex-col items-center text-center py-3 px-2 min-w-[56px] shrink-0">
              <span className="font-bold text-white text-base sm:text-lg">{currentUser?.campaignsCompleted || 0}</span>
              <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded-3xl text-[8px] sm:text-[9px]">CAMPAIGNS</span>
            </div>

            <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] shrink-0" />

            {/* LESSONS */}
            <div className="flex flex-col items-center text-center py-3 px-2 min-w-[56px] shrink-0">
              <span className="font-bold text-white text-base sm:text-lg">{currentUser?.lessonsCompleted || 0}</span>
              <span className="px-1 rounded-3xl text-[8px] sm:text-[9px]" style={{ backgroundColor: "#E0BBE4", color: "#5A189A" }}>
                LESSONS
              </span>
            </div>

            <div className="w-[1px] bg-[#9143F6] self-center h-[calc(1rem+1.25rem)] shrink-0" />

            {/* XP */}
            <div className="flex flex-col items-center justify-center text-center py-3 px-2 min-w-[56px] shrink-0">
              <div className="flex items-center justify-center gap-1 text-white font-bold text-base sm:text-lg">
                <span>{currentUser?.xp || 0}</span>
                <img src={xpIcon} alt="XP" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* ------------------- PODIUM ------------------- */}
        {!loading && !error && list.length > 0 && (
          <div className="relative mt-6 sm:mt-10">
            <div className="absolute inset-x-0 top-0 h-64" />
            <div className="flex justify-center items-end gap-2 sm:gap-5 relative">
              {[1, 0, 2].map((userIndex, idx) => {
                const podiumUser = list[userIndex];
                const name = podiumUser?.display_name || podiumUser?.username || "Anonymous";
                const xp = podiumUser?.xp;
                const podiumImages = [leader2, leader, leader3];
                const podiumWidth = idx === 1 ? 100 : 80;
                const podiumHeight = idx === 1 ? 120 : 80;

                return (
                  <div
                    key={podiumUser?._id}
                    className="flex flex-col items-center text-center relative"
                  >
                    <div className="flex flex-col items-center animate-bounce-slow relative">
                      <Avatar className="w-10 h-10 sm:w-16 sm:h-16 ring-2 ring-white/15 relative rounded-full overflow-visible">
                        <AvatarImage
                          src={
                            podiumUser?.profilePic ||
                            `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}`
                          }
                          className="w-full h-full object-cover rounded-full"
                        />
                        <AvatarFallback className="bg-white/10 text-white font-bold text-lg sm:text-2xl rounded-full">
                          {name.charAt(0)}
                        </AvatarFallback>

                        {/* Rank Badge */}
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-black font-bold text-[10px] sm:text-xs z-[99] border-2 border-white"
                          style={{
                            backgroundColor: idx === 0 ? "#cfcfcf" : idx === 1 ? "#f5c542" : "#cd7f32"
                          }}
                        >
                          {idx === 0 ? 2 : idx === 1 ? 1 : 3}
                        </div>
                      </Avatar>

                      <h3 className="text-xs sm:text-sm font-semibold mt-1 max-w-[80px] sm:max-w-none truncate">
                        {truncateName(name, 10)}
                      </h3>

                      <div className="mt-1 px-1 py-[0.5px] rounded-md bg-[#8B3EFE] flex items-center gap-1 text-xs sm:text-sm font-semibold text-white">
                        <span>{xp}</span>
                        <img src={xpIcon} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    <img
                      src={podiumImages[idx]}
                      alt={`Podium ${idx + 1}`}
                      width={podiumWidth}
                      height={podiumHeight}
                      className={`mt-1 w-[60px] sm:w-auto ${idx !== 1 ? "translate-y-3" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------- LEADERBOARD LIST ------------------- */}
        <div className="space-y-2 relative mt-4 text-sm px-0 sm:px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-[#8B3EFE33] border-t-[#8B3EFE] animate-spin" />
              <span className="text-sm text-white/60 font-medium tracking-wide">
                Loading leaderboard...
              </span>
            </div>
          ) : (
            <>
              {/* Table border image */}
              <div className="relative">
                <div className="absolute inset-x-0 top-0 z-0 -translate-y-[57px] hidden sm:block">
                  <img
                    src="/leaderboard-border.png"
                    alt="Podium border"
                    className="w-max h-auto object-contain mx-auto"
                  />
                </div>

                {/* Table headers - HIDDEN on mobile, visible on md+ */}
                <div
                  className="hidden md:grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr] gap-2 font-bold text-[#FFFFFF99] text-sm relative z-10"
                  style={{ transform: "translateY(-5px)" }}
                >
                  <div className="ml-5">RANK</div>
                  <div className="ml-10">USER</div>

                  <div className="relative flex items-center justify-center gap-1 group">
                    <span>EVENTS</span>
                    <img src="/question.png" alt="Events" className="w-3 h-3 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                      <div className="font-semibold mb-1 flex items-center gap-1">
                        <img src="/question.png" alt="Events" className="w-3 h-3" />
                        EVENTS
                      </div>
                      <div>This is the total number of XP-based community events or activities a user has participated in and been rewarded for.</div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center gap-1 group">
                    <span>QUESTS</span>
                    <img src="/question.png" alt="Quests" className="w-3 h-3 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                      <div className="font-semibold mb-1 flex items-center gap-1">
                        <img src="/question.png" alt="Quests" className="w-3 h-3" />
                        QUESTS
                      </div>
                      <div>This is the total number of quests completed by a user.</div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center gap-1 group">
                    <span>CAMPAIGNS</span>
                    <img src="/question.png" alt="Campaigns" className="w-3 h-3 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                      <div className="font-semibold mb-1 flex items-center gap-1">
                        <img src="/question.png" alt="Campaigns" className="w-3 h-3" />
                        CAMPAIGNS
                      </div>
                      <div>This is the total number of campaigns completed by a user.</div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center gap-1 group">
                    <span>LESSONS</span>
                    <img src="/question.png" alt="Lessons" className="w-3 h-3 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-md border border-[#8B3EFE66] bg-[#141414] text-white text-xs p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                      <div className="font-semibold mb-1 flex items-center gap-1">
                        <img src="/question.png" alt="Lessons" className="w-3 h-3" />
                        LESSONS
                      </div>
                      <div>This is the total number of lessons completed by a user.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    <span>XP</span>
                    <img src="/nexura-xp.png" alt="XP" className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Leaderboard entries */}
              <div className="space-y-2 pt-[10px] sm:pl-[10px]">
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
                      className="p-2 sm:p-1 rounded-2xl hover:brightness-110 overflow-hidden"
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
                      {/* DESKTOP LAYOUT (md+): 7-column grid */}
                      <div className="hidden md:grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs ${rankBg}`}>
                          #{rank}
                        </div>

                        <div className="flex items-center gap-1 truncate">
                          <Avatar className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                            <AvatarImage
                              src={entry?.profilePic || `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}`}
                              className="w-full h-full object-cover rounded-full"
                            />
                            <AvatarFallback className="bg-white/10 text-white font-bold">{name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{name}</span>
                        </div>

                        <div className="flex flex-col items-center text-center">
                          <span className="font-bold">{events}</span>
                          <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1 rounded text-[9px]">EVENTS</span>
                        </div>

                        <div className="flex flex-col items-center text-center">
                          <span className="font-bold">{quests}</span>
                          <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1 rounded text-[9px]">QUESTS</span>
                        </div>

                        <div className="flex flex-col items-center text-center">
                          <span className="font-bold">{campaigns}</span>
                          <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1 rounded text-[9px]">CAMPAIGNS</span>
                        </div>

                        <div className="flex flex-col items-center text-center">
                          <span className="font-bold">{lessons}</span>
                          <span className="text-[#5A189A] bg-[#E0BBE4] px-1 rounded text-[9px]">LESSONS</span>
                        </div>

                        <div className="flex items-center justify-center h-full">
                          <span className="font-bold text-white text-xl">{xp}</span>
                          <img src={xpIcon} alt="XP" className="w-5 h-5 ml-1" />
                        </div>
                      </div>

                      {/* MOBILE LAYOUT (<md): compact card */}
                      <div className="flex md:hidden items-center gap-2 min-h-[48px]">
                        {/* Rank */}
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-[11px] shrink-0 ${rankBg}`}>
                          #{rank}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <AvatarImage
                            src={entry?.profilePic || `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(name)}`}
                            className="w-full h-full object-cover rounded-full"
                          />
                          <AvatarFallback className="bg-white/10 text-white font-bold text-xs">{name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        {/* Name + stats row */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold truncate max-w-[120px]">
                              {truncateName(name, 14)}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <span className="font-bold text-white text-sm">{xp}</span>
                              <img src={xpIcon} alt="XP" className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Compact stats row */}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[#00E1A2E5] bg-[#00E1A233] px-1.5 py-0.5 rounded text-[9px] leading-none">{events} EVT</span>
                            <span className="text-[#8B3EFEE5] bg-[#8B3EFE33] px-1.5 py-0.5 rounded text-[9px] leading-none">{quests} QST</span>
                            <span className="text-[#B65FC8E5] bg-[#B65FC833] px-1.5 py-0.5 rounded text-[9px] leading-none">{campaigns} CMP</span>
                            <span className="text-[#5A189A] bg-[#E0BBE4] px-1.5 py-0.5 rounded text-[9px] leading-none">{lessons} LSN</span>
                          </div>
                        </div>
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
}