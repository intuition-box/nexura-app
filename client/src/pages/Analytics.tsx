"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import { useState, useEffect, useRef } from "react";
import DesktopCards from "../components/DesktopCard.tsx";
import MobileCards from "../components/MobileCards.tsx";
import { apiRequest } from "../lib/config";

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function PctBadge({ value, className = "" }: { value: number | null; className?: string }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-mono font-bold italic text-base sm:text-2xl tracking-tight ${
        up ? "text-emerald-400" : "text-red-400"
      } ${className}`}
    >
      {up ? "\u25b2" : "\u25bc"}{Math.abs(value)}%
    </span>
  );
}

// â”€â”€â”€ bar chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type BarData = { label: string; count: number };

function niceMax(val: number): number {
  if (val <= 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(val)));
  const norm = val / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function BarChart({ bars, scale, currentBucket }: { bars: BarData[]; scale: "1d" | "7d" | "30d"; currentBucket: number }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; count: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const BAR_AREA = 180;
  const Y_TICKS = 4;

  const rawMax = Math.max(...bars.map((b) => b.count), 1);
  const maxVal = niceMax(rawMax);
  const ticks = Array.from({ length: Y_TICKS + 1 }, (_, i) => Math.round((maxVal / Y_TICKS) * i));

  return (
    <div ref={containerRef} className="relative select-none flex gap-2">
      {/* Y-axis labels */}
      <div className="flex flex-col-reverse justify-between shrink-0 pb-[28px]" style={{ height: BAR_AREA + 40 }}>
        {ticks.map((t) => (
          <span key={t} className="text-[9px] sm:text-[10px] text-white/30 text-right leading-none w-7 sm:w-9 tabular-nums">
            {t >= 1000 ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}k` : t}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div className="relative flex-1 min-w-0">
        {/* Horizontal gridlines */}
        <div className="absolute inset-x-0 pointer-events-none" style={{ top: 0, height: BAR_AREA }}>
          {ticks.map((t, i) => (
            <div
              key={t}
              className="absolute w-full border-t border-white/[0.06]"
              style={{ bottom: (i / Y_TICKS) * BAR_AREA }}
            />
          ))}
        </div>

        {/* Bars */}
        <div
          className="flex items-end gap-[3px] sm:gap-1 w-full"
          style={{ height: BAR_AREA + 40 }}
        >
          {bars.map((bar, i) => {
            const pct = bar.count / maxVal;
            const barH = Math.max(pct * BAR_AREA, bar.count > 0 ? 6 : 2);
            const isCurrent = i === currentBucket;

            return (
              <div
                key={bar.label + i}
                className="relative flex flex-col items-center flex-1 cursor-pointer"
                style={{ height: BAR_AREA + 40 }}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const containerRect = containerRef.current!.getBoundingClientRect();
                  setTooltip({
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top - 8,
                    label: bar.label,
                    count: bar.count,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <div className="flex-1" />
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: barH,
                    background: isCurrent
                      ? "linear-gradient(180deg,#a855f7 0%,#7c3aed 100%)"
                      : "linear-gradient(180deg,#c084fc 0%,#833AFD 100%)",
                    opacity: isCurrent ? 1 : 0.55 + 0.04 * (i % 10),
                    boxShadow: isCurrent ? "0 0 14px rgba(168,85,247,0.55)" : undefined,
                  }}
                />
                <span
                  className={`text-[9px] sm:text-[10px] mt-1.5 font-medium truncate w-full text-center ${
                    isCurrent ? "text-purple-300" : "text-white/40"
                  }`}
                >
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="bg-[#1a1a2e] border border-purple-500/40 rounded-lg px-3 py-1.5 text-xs text-white shadow-xl whitespace-nowrap">
              <span className="text-white/60">{tooltip.label}: </span>
              <span className="font-bold text-purple-300">{tooltip.count}</span>
              <span className="text-white/50 ml-1">user{tooltip.count !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ chart range config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


function MiniBarChart({ bars, range }: { bars: { count: number; day?: string; date?: string }[]; range?: "Weekly" | "Monthly" }) {
  const displayBars = range === "Monthly" ? bars.slice(-30) : bars.slice(-7);
  const maxVal = Math.max(...displayBars.map((b) => b.count), 1);
  const H = 48;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; count: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isEmpty = displayBars.length === 0;
  if (isEmpty) return <div className="h-12 ml-auto w-24 flex items-end justify-center"><span className="text-white/20 text-xs">no data</span></div>;
  return (
    <div ref={containerRef} className="relative flex items-end gap-[2px] h-12 ml-auto">
      {displayBars.map((bar, i) => {
        const barH = Math.max((bar.count / maxVal) * H, 6);
        const isLast = i === displayBars.length - 1;
        const label = bar.day && bar.date ? `${bar.day} ${bar.date}` : bar.date ?? `Day ${i + 1}`;
        return (
          <div
            key={i}
            className="relative rounded-t-sm transition-all duration-500 cursor-pointer"
            style={{
              height: barH,
              width: range === "Monthly" ? 4 : 10,
              background: isLast
                ? "linear-gradient(180deg,#a855f7 0%,#7c3aed 100%)"
                : "linear-gradient(180deg,#c084fc 0%,#833AFD 100%)",
              opacity: isLast ? 1 : 0.35 + 0.022 * i,
            }}
            onMouseEnter={(e) => {
              if (!containerRef.current) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const cRect = containerRef.current.getBoundingClientRect();
              setTooltip({ x: rect.left - cRect.left + rect.width / 2, y: rect.top - cRect.top - 6, label, count: bar.count });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        );
      })}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="bg-[#1a1a2e] border border-purple-500/40 rounded-lg px-2.5 py-1 text-[10px] text-white shadow-xl whitespace-nowrap">
            <span className="text-white/60">{tooltip.label}: </span>
            <span className="font-bold text-purple-300">{tooltip.count}</span>
            <span className="text-white/50 ml-0.5">user{tooltip.count !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}
const CHART_RANGES = [
  { value: "1d" as const, label: "1D" },
  { value: "7d" as const, label: "14D" },
  { value: "30d" as const, label: "30D" },
];

const GRAPH_RANGES = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

// â”€â”€â”€ page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Analytics() {
  const [graphRange, setGraphRange] = useState("24h");
  const [chartScale, setChartScale] = useState<"1d" | "7d" | "30d">("7d");

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

  const [realUsers, setRealUsers] = useState({
    "24h": 0, "7d": 0, "30d": 0,
    weekly: 0, monthly: 0,
    prev24h: 0, prev7d: 0, prev30d: 0,
    prevWeekly: 0, prevMonthly: 0,
    totalYesterday: 0,
  });

  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  const [usersByDay, setUsersByDay] = useState<{ day: string; date: string; count: number }[]>([]);
  const [usersByHour, setUsersByHour] = useState<{ hour: number; label: string; count: number }[]>([]);
  const [tomorrowName, setTomorrowName] = useState("");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          prevUsers24h: number;
          prevUsers7d: number;
          prevUsers30d: number;
          prevActiveWeekly: number;
          prevActiveMonthly: number;
          totalUsersYesterday: number;
        };
        totalReferrals: number;
        totalQuests: number;
        totalQuestsCompleted: number;
        totalCampaignsCompleted: number;
        joinRatio: number;
        totalTrustDistributed: number;
        usersByDay: { day: string; date: string; count: number }[];
        usersByHour: { hour: number; label: string; count: number }[];
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
          prev24h: a.user.prevUsers24h ?? 0,
          prev7d: a.user.prevUsers7d ?? 0,
          prev30d: a.user.prevUsers30d ?? 0,
          prevWeekly: a.user.prevActiveWeekly ?? 0,
          prevMonthly: a.user.prevActiveMonthly ?? 0,
          totalYesterday: a.user.totalUsersYesterday ?? 0,
        });
        setUsersJoined(a.totalCampaignsCompleted);
        setTasksCompleted(a.totalQuestsCompleted);
        setTotalQuests(a.totalQuests);
        setTotalCampaigns(a.totalCampaigns);
        setTotalTrustDistributed(a.totalTrustDistributed);
        setTotalOnchainInteractions(a.totalOnchainInteractions);
        setTotalOnchainClaims(a.totalOnchainClaims);
        setUsersByDay(a.usersByDay ?? []);
        setUsersByHour(a.usersByHour ?? []);
        setTomorrowName(a.tomorrowName ?? "");
        setNewUsers(a.user.users24h);
        setActiveUsers(a.user.activeUsersWeekly);
        setAnalyticsLoaded(true);
      })
      .catch(() => {/* keep defaults */});
  }, []);

  useEffect(() => {
    if (!analyticsLoaded) return;
    const map: Record<string, number> = { "24h": realUsers["24h"], "7d": realUsers["7d"], "30d": realUsers["30d"] };
    setNewUsers(map[graphRange] ?? 0);
  }, [graphRange, analyticsLoaded, realUsers]);

  useEffect(() => {
    if (!analyticsLoaded) return;
    setActiveUsers(activeUsersRange === "Weekly" ? realUsers.weekly : realUsers.monthly);
  }, [activeUsersRange, analyticsLoaded, realUsers]);

  // â”€â”€ derived % changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalUsersPct = pctChange(totalUsers, realUsers.totalYesterday);

  const newUsersPctMap: Record<string, number | null> = {
    "24h": pctChange(realUsers["24h"], realUsers.prev24h),
    "7d":  pctChange(realUsers["7d"],  realUsers.prev7d),
    "30d": pctChange(realUsers["30d"], realUsers.prev30d),
  };

  const activeUsersPct = activeUsersRange === "Weekly"
    ? pctChange(realUsers.weekly, realUsers.prevWeekly)
    : pctChange(realUsers.monthly, realUsers.prevMonthly);

  // â”€â”€ chart data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const now = new Date();
  const currentHour = now.getUTCHours();
  const todayDayOfWeek = now.getUTCDay();

  const chartBars: BarData[] = (() => {
    if (chartScale === "1d") {
      // 12 bars â€” every 2 hours. Show 00:00â†’22:00 labels (12 pairs)
      const pairs = Array.from({ length: 12 }, (_, i) => {
        const h = i * 2;
        const count =
          (usersByHour[h]?.count ?? 0) + (usersByHour[h + 1]?.count ?? 0);
        const label = `${String(h).padStart(2, "0")}h`;
        return { label, count };
      });
      return pairs;
    }
    if (chartScale === "7d") {
      // 14 bars â€” last 14 days (two weeks, showing day abbreviation + date)
      return usersByDay.slice(-14).map((d) => ({
        label: `${d.day} ${d.date}`,
        count: d.count,
      }));
    }
    // 30d â€” all 30 bars
    return usersByDay.map((d) => ({ label: d.date, count: d.count }));
  })();

  const currentBarIndex = (() => {
    if (chartScale === "1d") return Math.floor(currentHour / 2);
    if (chartScale === "7d") return chartBars.length - 1 - (13 - Math.min(13, chartBars.length - 1));
    return chartBars.length - 1; // today is always the last bar
  })();

  const chartSubtitle = {
    "1d": "Daily Trajectory \u2014 today (UTC)",
    "7d": "Daily Trajectory \u2014 last 14 days",
    "30d": "Daily Trajectory \u2014 last 30 days",
  }[chartScale];

  const chartTotal = {
    "1d": realUsers["24h"],
    "7d": realUsers["7d"],
    "30d": realUsers["30d"],
  }[chartScale];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden overflow-y-auto p-3 sm:p-6 relative pb-28 sm:pb-6">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-4 animate-slide-up delay-100">
            Platform Performance Metrics
          </h1>
          <p className="text-sm text-white/50 animate-slide-up delay-200">Live overview of your ecosystem activity</p>
        </div>

        {/* â”€â”€ Stat Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-6 sm:pb-12">

          {/* Total Users */}
          <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-1 animate-slide-up delay-300 flex flex-col group cursor-default">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-medium text-white/60 mb-1 uppercase tracking-widest">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-auto pt-4">
                <div className="flex items-end w-full gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-3xl sm:text-5xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">{totalUsers}</p>
                    <PctBadge value={totalUsersPct} />
                  </div>
                  <p className="mt-1 text-xs text-white/50">vs yesterday</p>
                </div>
                <img src="/ref-icon.png" alt="Ref Icon" className="w-7 h-7 sm:w-10 sm:h-10 ml-auto shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
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
                  {GRAPH_RANGES.map((r) => (
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
            <CardContent className="p-0 flex-1 flex flex-col justify-end pt-2">
              <div className="flex items-end gap-2 w-full">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-3xl sm:text-5xl font-semibold group-hover:text-purple-300 transition-colors duration-300">{newUsers}</p>
                    <PctBadge value={newUsersPctMap[graphRange] ?? null} />
                  </div>
                  <p className="mt-1 text-xs text-white/50"> </p>
                </div>
                <img src="/ref-icon.png" alt="Ref Icon" className="w-7 h-7 sm:w-10 sm:h-10 ml-auto shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
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
            <CardContent className="p-0 mt-2">
              <div className="flex items-end w-full gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-3xl sm:text-5xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">{activeUsers}</p>
                    <PctBadge value={activeUsersPct} />
                  </div>
                  <p className="mt-1 text-xs text-white/50"> </p>
                </div>
                <div className="ml-auto shrink-0">
                  <MiniBarChart bars={usersByDay} range={activeUsersRange as "Weekly" | "Monthly"} />
                </div>
              </div>
              <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-pink-500/60 via-purple-400/40 to-transparent rounded-full" />
            </CardContent>
          </Card>
        </div>

        {/* â”€â”€ Bar Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Card className="relative glass rounded-2xl sm:rounded-3xl p-3 sm:p-8 animate-slide-up delay-600 mt-4 sm:mt-8 mb-8 sm:mb-12 overflow-hidden">
          <CardHeader className="relative w-full mb-4 sm:mb-8 p-0">
            <div className="grid grid-cols-3 items-center gap-2">
              {/* Left: title + subtitle */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <CardTitle className="text-base sm:text-2xl font-bold text-white tracking-wide">
                  New User Growth Trend
                </CardTitle>
                <p className="text-[10px] sm:text-sm text-white/50 truncate">{chartSubtitle}</p>
              </div>

              {/* Center: scale dropdown */}
              <div className="flex justify-center">
                <select
                  value={chartScale}
                  onChange={(e) => setChartScale(e.target.value as "1d" | "7d" | "30d")}
                  className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs sm:text-sm text-white/80 focus:outline-none focus:border-purple-500/60 cursor-pointer appearance-none"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {CHART_RANGES.map((r) => (
                    <option key={r.value} value={r.value} style={{ background: '#1a1a2e', color: '#fff' }}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right: total badge */}
              <div className="flex justify-end">
                <div className="relative w-9 h-9 sm:w-14 sm:h-14 shrink-0">
                  <img src="/trend-icon.png" alt="Trend" className="w-full h-full opacity-80" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-sm font-bold text-white">
                    {chartTotal}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <BarChart bars={chartBars} scale={chartScale} currentBucket={currentBarIndex} />

            {/* legend */}
            <div className="mt-4 flex items-center gap-2 text-white/30 text-xs">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "linear-gradient(180deg,#c084fc,#833AFD)" }} />
              <span>New signups</span>
              <span className="ml-2 inline-block w-3 h-3 rounded-sm" style={{ background: "linear-gradient(180deg,#a855f7,#7c3aed)" }} />
              <span>Current period</span>
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
