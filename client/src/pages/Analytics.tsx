"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import { useState, useEffect } from "react";
import DesktopCards from "../components/DesktopCard.tsx";
import MobileCards from "../components/MobileCards.tsx";
import { apiRequest } from "../lib/config";

const GRAPH_RANGES = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

export default function Analytics() {
  const [graphRange, setGraphRange] = useState("24h");
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [activeUsersRange, setActiveUsersRange] = useState("Weekly");
  const [activeUsers, setActiveUsers] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [usersJoined, setUsersJoined] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [totalQuests, setTotalQuests] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [totalTrustDistributed, setTotalTrustDistributed] = useState(0);
  const [totalOnchainInteractions, setTotalOnchainInteractions] = useState(0);
  const [totalOnchainClaims, setTotalOnchainClaims] = useState(0);
  const [realUsers, setRealUsers] = useState({ "24h": 0, "7d": 0, "30d": 0, weekly: 0, monthly: 0 });
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [usersByDay, setUsersByDay] = useState<{ day: string; count: number }[]>([]);
  const [tomorrowName, setTomorrowName] = useState("");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch real analytics data
  useEffect(() => {
    type AnalyticsResponse = {
      analytics: {
        totalOnchainInteractions: number;
        totalOnchainClaims: number;
        totalCampaigns: number;
        user: {
          totalUsers: number;
          activeUsersWeekly: number;
          activeUsersMonthly: number;
          users24h: number;
          users7d: number;
          users30d: number;
        };
        totalReferrals: number;
        totalQuests: number;
        totalQuestsCompleted: number;
        totalCampaignsCompleted: number;
        joinRatio: number;
        totalTrustDistributed: number;
        usersByDay: { day: string; count: number }[];
        tomorrowName: string;
      };
    };
    apiRequest<AnalyticsResponse>({ method: "GET", endpoint: "/api/get-analytics" })
      .then((res) => {
        const a = res?.analytics;
        if (!a) return;
        setTotalUsers(a.user.totalUsers);
        setRealUsers({
          "24h": a.user.users24h,
          "7d": a.user.users7d,
          "30d": a.user.users30d,
          weekly: a.user.activeUsersWeekly,
          monthly: a.user.activeUsersMonthly,
        });
        setUsersJoined(a.totalCampaignsCompleted);
        setTasksCompleted(a.totalQuestsCompleted);
        setTotalQuests(a.totalQuests);
        setTotalCampaigns(a.totalCampaigns);
        setTotalTrustDistributed(a.totalTrustDistributed);
        setTotalOnchainInteractions(a.totalOnchainInteractions);
        setTotalOnchainClaims(a.totalOnchainClaims);
        setUsersByDay(a.usersByDay ?? []);
        setTomorrowName(a.tomorrowName ?? "");
        setNewUsers(a.user.users24h);
        setActiveUsers(a.user.activeUsersWeekly);
        setAnalyticsLoaded(true);
      })
      .catch(() => {/* keep defaults on error */});
  }, []);

  useEffect(() => {
    if (!analyticsLoaded) return;
    const realCount: Record<string, number> = { "24h": realUsers["24h"], "7d": realUsers["7d"], "30d": realUsers["30d"] };
    setNewUsers(realCount[graphRange] ?? 0);
  }, [graphRange, analyticsLoaded, realUsers]);

  useEffect(() => {
    if (!analyticsLoaded) return;
    setActiveUsers(activeUsersRange === "Weekly" ? realUsers.weekly : realUsers.monthly);
  }, [activeUsersRange, analyticsLoaded, realUsers]);



  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative pb-28 sm:pb-6">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-slide-up delay-100">
            Platform Performance Metrics
          </h1>
          <p className="text-sm text-white/50 animate-slide-up delay-200">Live overview of your ecosystem activity</p>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-6 sm:pb-12">

          {/* Total Users */}
            <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-1 animate-slide-up delay-300 flex flex-col group cursor-default">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-medium text-white/60 mb-1 uppercase tracking-widest">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-auto pt-4">
              <div className="flex items-end w-full">
              <p className="text-4xl sm:text-5xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">{totalUsers}</p>
              <img src="/ref-icon.png" alt="Ref Icon" className="w-10 h-10 ml-auto opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-purple-500/60 via-indigo-400/40 to-transparent rounded-full" />
            </CardContent>
          </Card>


          {/* New Users */}
            <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col flex-1 animate-slide-up delay-400 group cursor-default">
            <CardHeader className="p-0 mb-2 w-full">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-sm font-medium text-white/60 uppercase tracking-widest">New Users</CardTitle>
                <div className="flex gap-1 items-center bg-white/5 border border-white/10 rounded-lg p-1">
                  {GRAPH_RANGES.slice(0, 3).map((r) => (
                    <button
                      key={r.value}
                      className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                        graphRange === r.value
                          ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(138,63,252,0.6)]"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setGraphRange(r.value)}
                    >
                      {r.value}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex items-end pt-4">
              <div className="flex items-end gap-2 w-full">
              <p className="text-4xl sm:text-5xl font-bold group-hover:text-purple-300 transition-colors duration-300">{newUsers}</p>
              <img src="/ref-icon.png" alt="Ref Icon" className="w-10 h-10 ml-auto opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-indigo-500/60 via-purple-400/40 to-transparent rounded-full" />
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-1 animate-slide-up delay-500 group cursor-default">
            <CardHeader className="p-0 mb-2 w-full">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-sm font-medium text-white/60 uppercase tracking-widest">Active Users</CardTitle>
                <div className="flex gap-1 items-center bg-white/5 border border-white/10 rounded-lg p-1">
                  {["Weekly", "Monthly"].map((range) => (
                    <button
                      key={range}
                      className={`px-2 py-1 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                        activeUsersRange === range
                          ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(138,63,252,0.6)]"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setActiveUsersRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <div className="flex items-end w-full">
              <p className="text-4xl sm:text-5xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">{activeUsers}</p>
              <img src="/graph-icon-1.png" alt="Graph Icon" className="w-32 sm:w-48 h-24 ml-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-pink-500/60 via-purple-400/40 to-transparent rounded-full" />
            </CardContent>
          </Card>
        </div>

        <Card className="relative glass rounded-3xl p-6 sm:p-8 animate-slide-up delay-600 mt-8 mb-12">
  <CardHeader className="relative w-full mb-8 p-0">
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <CardTitle className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          Daily New Users
        </CardTitle>
        <p className="text-sm text-white/50">New signups per day — last 7 days</p>
      </div>
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <img src="/trend-icon.png" alt="Trend Icon" className="w-full h-full opacity-80" />
        <span className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold text-white">
          {realUsers["7d"]}
        </span>
      </div>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    {(() => {
      const bars = [...(usersByDay.length === 7 ? usersByDay : Array.from({ length: 7 }, (_, i) => ({ day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i], count: 0 })))];
      const maxVal = Math.max(...bars.map(b => b.count), 1);
      const BAR_HEIGHT = 180; // px, max bar area height

      return (
        <div className="flex items-end justify-between gap-1 sm:gap-2 w-full" style={{ height: BAR_HEIGHT + 56 }}>
          {/* 7 real day bars */}
          {bars.map((bar, i) => {
            const pct = bar.count / maxVal;
            const barH = Math.max(pct * BAR_HEIGHT, bar.count > 0 ? 8 : 2);
            const isToday = i === 6;
            return (
              <div key={bar.day + i} className="flex flex-col items-center flex-1 gap-1" style={{ height: BAR_HEIGHT + 56 }}>
                {/* count label */}
                <div className="flex-1 flex items-end">
                  <span className="text-[10px] sm:text-xs font-semibold text-white/70 mb-1">
                    {bar.count > 0 ? bar.count : ""}
                  </span>
                </div>
                {/* bar */}
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: barH,
                    background: isToday
                      ? "linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)"
                      : "linear-gradient(180deg, #c084fc 0%, #833AFD 100%)",
                    opacity: isToday ? 1 : 0.65 + 0.05 * i,
                    boxShadow: isToday ? "0 0 16px rgba(168,85,247,0.6)" : undefined,
                  }}
                />
                {/* day label */}
                <span className={`text-[10px] sm:text-xs mt-2 font-medium ${isToday ? "text-purple-300" : "text-white/50"}`}>
                  {bar.day}
                </span>
              </div>
            );
          })}

          {/* 8th bar: empty (tomorrow) */}
          <div className="flex flex-col items-center flex-1 gap-1" style={{ height: BAR_HEIGHT + 56 }}>
            <div className="flex-1" />
            <div
              className="w-full rounded-t-lg"
              style={{
                height: 24,
                border: "1.5px dashed rgba(255,255,255,0.2)",
                background: "transparent",
              }}
            />
            <span className="text-[10px] sm:text-xs mt-2 font-medium text-white/25">
              {tomorrowName || "—"}
            </span>
          </div>
        </div>
      );
    })()}

    {/* Y-axis hint */}
    <div className="mt-4 flex items-center gap-2 text-white/30 text-xs">
      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "linear-gradient(180deg,#c084fc,#833AFD)" }} />
      <span>New signups per day</span>
      <span className="ml-4 inline-block w-5 border-t border-dashed border-white/25" />
      <span>Upcoming</span>
    </div>
  </CardContent>
</Card>


        {isDesktop ? (
  <DesktopCards
    usersJoined={usersJoined}
    tasksCompleted={tasksCompleted}
    totalQuests={totalQuests}
    totalCampaigns={totalCampaigns}
    totalTrustDistributed={totalTrustDistributed}
    totalOnchainInteractions={totalOnchainInteractions}
    totalOnchainClaims={totalOnchainClaims}
  />
) : (
  <MobileCards
    usersJoined={usersJoined}
    tasksCompleted={tasksCompleted}
    totalQuests={totalQuests}
    totalCampaigns={totalCampaigns}
    totalTrustDistributed={totalTrustDistributed}
    totalOnchainInteractions={totalOnchainInteractions}
    totalOnchainClaims={totalOnchainClaims}
  />
)}
      </div>
    </div>
  );
}
