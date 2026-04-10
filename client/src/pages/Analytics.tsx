import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import AnimatedBackground from "../components/AnimatedBackground";
import { ResponsivePie } from "@nivo/pie";
import { ChevronDown } from "lucide-react";
import { apiRequest } from "../lib/config";

interface AnalyticsData {
  totalOnchainInteractions: number;
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
  lessonsCreated: number;
  claimsCreated: number;
  payments: number;
  totalQuests: number;
  totalQuestsCompleted: number;
  totalCampaignsCompleted: number;
  joinRatio: number;
  totalTrustDistributed: number;
  totalXpInCirculation: number;
  usersByDay: { day: string; date: string; count: number }[];
  usersByHour: { hour: number; label: string; count: number }[];
  tomorrowName: string;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export default function Analytics() {
  const ranges = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "All Time"] as const;
  type Range = (typeof ranges)[number];
  const [activeRange, setActiveRange] = useState<Range>("Last 24 Hrs");
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    apiRequest<{ analytics: AnalyticsData }>({
      method: "GET",
      endpoint: "/api/get-analytics",
    })
      .then((res) => setData(res.analytics))
      .catch(() => {});
  }, []);

  const rangeDescriptions: Record<Range, string> = {
    "Last 24 Hrs": "Monitor daily new user activity and growth patterns",
    "Last 7 days": "Monitor user activity and growth over the last 7 days",
    "Last 30 days": "Monitor user activity and growth over the last 30 days",
    "All Time": "Monitor overall user activity and growth since launch",
  };

  // Derive range-specific values from API data
  const totalUsersForRange: Record<Range, number> = {
    "Last 24 Hrs": data?.user.users24h ?? 0,
    "Last 7 days": data?.user.users7d ?? 0,
    "Last 30 days": data?.user.users30d ?? 0,
    "All Time": data?.user.totalUsers ?? 0,
  };

  const activeUsersForRange: Record<Range, number> = {
    "Last 24 Hrs": data?.user.users24h ?? 0,
    "Last 7 days": data?.user.activeUsersWeekly ?? 0,
    "Last 30 days": data?.user.activeUsersMonthly ?? 0,
    "All Time": data?.user.totalUsers ?? 0,
  };

  const prevNewUsersForRange: Record<Range, number> = {
    "Last 24 Hrs": data?.user.prevUsers24h ?? 0,
    "Last 7 days": data?.user.prevUsers7d ?? 0,
    "Last 30 days": data?.user.prevUsers30d ?? 0,
    "All Time": 0,
  };

  const prevActiveForRange: Record<Range, number> = {
    "Last 24 Hrs": data?.user.prevUsers24h ?? 0,
    "Last 7 days": data?.user.prevActiveWeekly ?? 0,
    "Last 30 days": data?.user.prevActiveMonthly ?? 0,
    "All Time": 0,
  };

  const onchainInteractions = data?.totalOnchainInteractions ?? 0;
  const totalJoined = data
    ? (data.totalQuestsCompleted + (data.totalCampaignsCompleted ?? 0) + (data.joinRatio ? Math.round((data.totalQuestsCompleted + data.totalCampaignsCompleted) / (data.joinRatio / 100)) : 0))
    : 0;
  const usersJoined = totalJoined || (data ? data.user.totalUsers : 0);
  const tasksCompleted = data
    ? data.totalQuestsCompleted + data.totalCampaignsCompleted
    : 0;

  const claimsCount = data?.claimsCreated ?? 0;
  const paymentsCount = data?.payments ?? 0;
  const nexonsMintedCount = Math.max(0, onchainInteractions - claimsCount - paymentsCount);
  const othersCount = 0;
  const totalTransactions = claimsCount + paymentsCount + nexonsMintedCount + othersCount;

  const transactionsData = [
    { id: "Claims", value: claimsCount, color: "#00E1A2" },
    { id: "Payments", value: paymentsCount, color: "#8A3FFD" },
    { id: "Nexons", value: nexonsMintedCount, color: "#B65FC8" },
    { id: "Others", value: othersCount, color: "#FFFFFF" },
  ];

  // Build chart data from API buckets
  const chartDataForRange = (): number[] => {
    if (!data) return [];
    if (activeRange === "Last 24 Hrs") {
      return data.usersByHour.map((h) => h.count);
    }
    if (activeRange === "Last 7 days") {
      // Last 7 entries of usersByDay
      return data.usersByDay.slice(-7).map((d) => d.count);
    }
    if (activeRange === "Last 30 days") {
      return data.usersByDay.map((d) => d.count);
    }
    // All Time — cumulative from usersByDay
    let cum = data.user.totalUsers - data.usersByDay.reduce((s, d) => s + d.count, 0);
    return data.usersByDay.map((d) => {
      cum += d.count;
      return cum;
    });
  };

  const chartCategoriesForRange = (): string[] => {
    if (!data) return [];
    if (activeRange === "Last 24 Hrs") {
      return data.usersByHour.map((h) => h.label);
    }
    if (activeRange === "Last 7 days") {
      return data.usersByDay.slice(-7).map((d) => d.day);
    }
    if (activeRange === "Last 30 days") {
      return data.usersByDay.map((d) => d.date);
    }
    return data.usersByDay.map((d) => d.date);
  };

  const cards = [
    {
      title: "New Users",
      value: totalUsersForRange[activeRange],
      rate: pctChange(totalUsersForRange[activeRange], prevNewUsersForRange[activeRange]),
      description: activeRange === "All Time" ? "total signups" : "vs previous period",
      icon: "new-users.png",
    },
    {
      title: "Total Users",
      value: data?.user.totalUsers ?? 0,
      rate: pctChange(data?.user.totalUsers ?? 0, data?.user.totalUsersYesterday ?? 0),
      description: "day-over-day growth",
      icon: "referrals.png",
    },
    {
      title: "Active Users",
      value: activeUsersForRange[activeRange],
      rate: pctChange(activeUsersForRange[activeRange], prevActiveForRange[activeRange]),
      description: activeRange === "All Time" ? "all active users" : "vs previous period",
      icon: "approved.png",
    },
    {
      title: "Quests Created",
      value: data?.totalQuests ?? 0,
      rate: null,
      description: "total quests",
      icon: "quest-iconx.png",
    },
    {
      title: "Campaigns Created",
      value: data?.totalCampaigns ?? 0,
      rate: null,
      description: "total campaigns",
      icon: "campaign_icon.png",
    },
  ];

  const series = [{ name: "New Users", data: chartDataForRange() }];

  const options = {
    chart: { id: "new-user-chart", background: "transparent", toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: {
      categories: chartCategoriesForRange(),
      labels: { style: { colors: "#ffffffaa" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#ffffffaa" } } },
    grid: { borderColor: "#ffffff11" },
    stroke: { curve: "smooth" as const, width: 2, colors: ["#00E1A2"] },
    fill: {
      type: "gradient" as const,
      gradient: { shade: "dark" as const, type: "vertical" as const, gradientToColors: ["#00E1A21A"], opacityFrom: 0.6, opacityTo: 0.1 },
    },
    markers: { size: 0 },
    tooltip: { theme: "dark" as const },
    dataLabels: { enabled: false },
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden overflow-y-auto p-3 sm:p-6 relative pb-28 sm:pb-6 font-geist">
      <AnimatedBackground />

       <div className="max-w-6xl mx-auto relative z-10 space-y-2">
         {/* Header */}
         <div className="space-y-1 mb-4">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
             <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
               Analytics
             </span>
           </div>
           <h1 className="text-2xl sm:text-4xl bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-4 animate-slide-up delay-100">
             Platform Performance Metrics
           </h1>
           <p className="text-sm text-white/50 animate-slide-up delay-200">
             Track live platform activity and growth metrics on Nexura
           </p>
         </div>

         {/* Ranges — Desktop */}
         <div className="hidden sm:flex mt-12 gap-2 max-w-[45vw] mb-6">
           {ranges.map((label) => (
             <button
               key={label}
               onClick={() => setActiveRange(label)}
               className={`rounded-full border px-2 py-1.5 text-xs font-medium text-white transition-all duration-200 ${
                 activeRange === label
                   ? "bg-[#8B3EFE] border-[#8B3EFE]"
                   : "bg-transparent border-[#8B3EFE] hover:bg-[#8B3EFE]"
               }`}
             >
               {label}
             </button>
           ))}
         </div>

         {/* Ranges — Mobile Dropdown */}
<div className="relative mt-12 mb-6 w-[180px] sm:hidden">
  <button
    onClick={() => setShowRangeDropdown((prev) => !prev)}
    className="flex w-full items-center justify-between rounded-2xl border border-[#8B3EFE] bg-black px-4 py-3 text-sm font-medium text-white"
  >
    <span>{activeRange}</span>
    <ChevronDown
      size={18}
      className={`transition-transform duration-200 ${showRangeDropdown ? "rotate-180" : ""}`}
    />
  </button>

  {showRangeDropdown && (
    <div className="absolute left-0 top-[110%] z-50 w-full overflow-hidden rounded-2xl border border-[#8B3EFE] bg-black shadow-[0_0_20px_rgba(139,62,254,0.35)]">
      {ranges.map((label) => (
        <button
          key={label}
          onClick={() => {
            setActiveRange(label);
            setShowRangeDropdown(false);
          }}
          className={`w-full border-b border-[#2A2A2A] px-4 py-3 text-left text-sm text-white transition-all last:border-b-0 ${
            activeRange === label ? "bg-[#8B3EFE]" : "bg-black hover:bg-[#1A1A1A]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )}
</div>

 <div className="mt-12 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
  {cards.map((card, idx) => (
    <div
      key={idx}
      className="
        relative overflow-hidden
        w-full sm:flex-1
        rounded-3xl
        border border-gray-700
        bg-[#170F1F]
        p-4
        flex flex-col justify-between
        mt-2 sm:mt-4
      "
    >
      <div className="absolute -right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-[#8B3EFE]/20 blur-3xl sm:hidden" />

      <img
        src={card.icon}
        alt=""
        className="absolute right-3 top-2 bottom-3 w-[30%] object-cover object-center opacity-20 blur-[2px] sm:hidden"
      />

      <img
        src={card.icon}
        alt=""
        className="hidden sm:block absolute top-4 right-4 w-5 h-5"
      />

      <div className="relative z-10 flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase text-white/70 max-w-[70%]">
          {card.title}
        </span>
      </div>

      <div className="relative z-10 text-2xl font-bold text-white mb-2">
        {formatNumber(card.value)}
      </div>

      {card.rate !== null && card.rate !== undefined ? (
        <div className="relative z-10 flex items-center gap-1 text-xs">
          <img src="/rate.png" alt="" className="w-5 h-3" />
          <span className={card.rate >= 0 ? "text-[#00E1A2]" : "text-red-500"}>
            {card.rate >= 0 ? "+" : ""}
            {card.rate.toFixed(1)}% {card.description}
          </span>
        </div>
      ) : (
        <div className="relative z-10 text-xs text-white/50">
          {card.description}
        </div>
      )}
    </div>
  ))}
</div>

{/* Graph Section */}
<div
  className="mt-10 sm:mt-16 w-full bg-[#170F1F] rounded-2xl sm:rounded-3xl px-3 py-4 sm:p-6 h-[20rem] sm:h-[24rem] relative border-t border-l border-r overflow-hidden"
  style={{
    borderTopColor: "#00E1A266",
    borderLeftColor: "#00E1A222",
    borderRightColor: "#00E1A222",
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 2,
  }}
>
  <div className="absolute -right-10 top-6 h-24 w-24 rounded-full bg-[#00E1A2]/10 blur-3xl sm:hidden" />

  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 max-w-[75%] sm:max-w-none">
    <h2 className="text-sm sm:text-2xl font-semibold text-white leading-tight">
      New User Growth Trend
    </h2>
    <p className="mt-1 text-[11px] sm:text-sm text-white/50 leading-snug">
      {rangeDescriptions[activeRange]}
    </p>
  </div>

  <div className="w-full h-full pt-14 sm:pt-16">
    <Chart
      options={{
        ...options,
        chart: { ...options.chart, toolbar: { show: false } },
        legend: { show: false },
        xaxis: {
          ...options.xaxis,
          labels: {
            ...options.xaxis?.labels,
            style: { fontSize: window.innerWidth < 640 ? "10px" : "12px" },
            rotate: window.innerWidth < 640 ? -45 : 0,
          },
        },
        yaxis: {
          ...options.yaxis,
          labels: {
            ...options.yaxis?.labels,
            style: { fontSize: window.innerWidth < 640 ? "10px" : "12px" },
          },
        },
        grid: { ...options.grid, padding: { left: 0, right: 0 } },
      }}
      series={series}
      type="area"
      height="100%"
    />
  </div>
</div>

         {/* Bottom Cards Section */}
 <div className="mt-16 grid grid-cols-12 gap-4 w-full">
 {/* Left Card — Join vs Completion ratio */}
<div
  className="col-span-12 sm:col-span-4 row-span-2 p-4 rounded-3xl flex flex-col justify-between border"
  style={{ borderColor: "#D4BBFF1A", backgroundColor: "#833AFD" }}
>
  <span className="text-lg sm:text-xl font-semibold text-white">
    Join vs Completion ratio
  </span>

  <div className="flex items-center mt-4">
    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0">
      <ResponsivePie
        data={[
          { id: "Tasks Completed", value: Math.min(tasksCompleted, usersJoined || 1) },
          { id: "Users Not Completed", value: Math.max((usersJoined || 1) - tasksCompleted, 0) },
        ]}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        innerRadius={0.7}
        padAngle={0}
        cornerRadius={0}
        activeOuterRadiusOffset={0}
        colors={["#00E1A2", "#FFFFFF"]}
        borderWidth={0}
        enableArcLinkLabels={false}
        enableArcLabels={false}
        animate={true}
        tooltip={({ datum }) => (
          <div
            className={`flex items-center justify-start gap-2 px-2 py-1 rounded text-xs ${
              datum.id === "Tasks Completed" ? "bg-white text-black" : "bg-gray-800 text-white"
            }`}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: datum.id === "Tasks Completed" ? "#00E1A2" : "#FFFFFF",
              }}
            />
            <span className="whitespace-nowrap">{datum.id}: {datum.value}</span>
          </div>
        )}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-white font-bold text-base sm:text-xl leading-none">
          {usersJoined === 0
            ? 0
            : ((Math.min(tasksCompleted, usersJoined) / usersJoined) * 100).toFixed(0)}
          %
        </p>
        <span className="text-white text-[10px] sm:text-xs">Completion</span>
      </div>
    </div>

    <div className="flex flex-col gap-2 sm:gap-3 flex-1 ml-3 sm:ml-6">
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-full border"
        style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-white truncate">Joined</span>
        </div>
        <span className="text-xs sm:text-sm font-bold text-white ml-2">{usersJoined}</span>
      </div>

      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-full border"
        style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00E1A2] shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-white truncate">Completed</span>
        </div>
        <span className="text-xs sm:text-sm font-bold text-white ml-2">{tasksCompleted}</span>
      </div>
    </div>
  </div>

  <div className="mt-4 text-white/70 text-xs sm:text-sm leading-relaxed">
    {usersJoined
      ? `${Math.round(((usersJoined - tasksCompleted) / usersJoined) * 100)}% of users drop before completion`
      : "0% of users drop before completion"}
  </div>

  <div
    className="hidden sm:flex mt-2 p-2 rounded-3xl border flex-col gap-2"
    style={{ borderColor: "#D4BBFF4D", backgroundColor: "#632DBB" }}
  >
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-white" />
      <span className="text-white text-[10px]">JOINED: Total users who joined a quest, campaign & lesson</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#00E1A2]" />
      <span className="text-white text-[10px]">COMPLETED: Total users who completed a quest, campaign & lesson</span>
    </div>
  </div>
</div>

   {/* Middle Card — On-Chain Activity */}
<div
  className="col-span-12 sm:col-span-5 row-span-2 p-3 sm:p-2 rounded-3xl flex flex-col border"
  style={{ backgroundColor: "#170F1F", borderColor: "#D4BBFF66" }}
>
  <span className="text-xs font-semibold uppercase text-white/90 text-center">On-Chain Activity</span>
  <p className="text-center text-[11px] sm:text-[12px] text-white/70 mt-2">
    Overview of transaction distribution across all on-chain activities
  </p>

  <div className="flex-1 flex flex-col justify-center mt-4 sm:mt-0">
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 sm:gap-6 w-full">
      <div className="w-full h-[14rem] sm:h-[12rem] cursor-pointer sm:translate-y-0">
        <ResponsivePie
          data={transactionsData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          innerRadius={0}
          padAngle={0}
          cornerRadius={0}
          activeOuterRadiusOffset={0}
          colors={(d) => d.data.color}
          borderWidth={0}
          enableArcLinkLabels={false}
          enableArcLabels={true}
          arcLabelsSkipAngle={5}
          arcLabelsTextColor={(d) => (d.id === "Others" ? "#000000" : "#FFFFFF")}
          arcLabel={(d) => totalTransactions > 0 ? `${Math.round((d.value / totalTransactions) * 100)}%` : "0%"}
          tooltip={({ datum }) => (
            <div className="bg-black text-white px-2 py-1 rounded text-xs">
              {datum.id}: {datum.value} ({totalTransactions > 0 ? ((datum.value / totalTransactions) * 100).toFixed(1) : 0}%)
            </div>
          )}
        />
      </div>

      <div className="w-full sm:ml-2 sm:pr-2 flex flex-col sm:justify-center sm:items-center">
        <div className="text-center sm:text-center mb-3 sm:mb-4">
          <div className="text-xl sm:text-2xl font-bold text-white">{totalTransactions}</div>
          <div className="text-[10px] sm:text-[0.7rem] font-semibold text-white/30 uppercase">Transactions</div>
        </div>

        <div
          className="flex flex-col gap-2 p-4 rounded-[1.5rem] border w-full sm:w-[220px]"
          style={{ borderColor: "rgba(212,187,255,0.3)", backgroundColor: "transparent" }}
        >
          {transactionsData.map((t) => (
            <div key={t.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 rounded-full border border-white shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] sm:text-[0.7rem] font-semibold text-white/80 uppercase truncate">{t.id}</span>
              </div>
              <span className="text-[10px] sm:text-[0.7rem] font-bold text-white/80 ml-2">{t.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>

 {/* Top Right Card — Total Trust Distributed */}
<div
  className="col-span-12 sm:col-span-3 rounded-3xl p-4 flex flex-col justify-between border relative backdrop-blur-[15px] sm:backdrop-blur-[20px]"
  style={{
    backgroundColor: "rgba(23, 15, 31, 0.7)",
    borderColor: "#D4BBFF66",
    paddingTop: "1rem",
    paddingBottom: "1rem",
    paddingRight: "1.5rem",
  }}
>
  <img src="/intuition-icon.png" alt="Intuition Logo" className="hidden sm:block absolute top-4 right-4 w-7 h-7 object-contain z-10" />
  <img src="/intuition-icon.png" alt="Intuition Logo" className="block sm:hidden absolute right-2 top-1/2 transform -translate-y-1/2 w-24 h-24 opacity-20 pointer-events-none" />

  <div className="relative z-10">
    <span className="text-xs font-semibold uppercase text-white">TOTAL TRUST DISTRIBUTED</span>
  </div>

  <div className="flex items-center gap-3 relative z-10 mt-4">
    <span className="text-2xl font-bold text-white">{formatNumber(data?.totalTrustDistributed ?? 0)}</span>
    <img src="/trust-icon.png" alt="Trust Icon" className="w-12 h-8 object-contain" />
  </div>
</div>

{/* Bottom Right Cards */}
<div className="col-span-12 sm:col-span-3 grid grid-cols-2 gap-4">
  {/* Claims Created */}
  <div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border col-span-1" style={{ borderColor: "#D4BBFF66" }}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase text-white/70">TOTAL CLAIMS CREATED</span>
      <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
    </div>
    <div className="mt-4">
      <span className="text-xl font-bold text-white">{formatNumber(data?.claimsCreated ?? 0)}</span>
    </div>
  </div>

  {/* Lessons Created */}
  <div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border col-span-1" style={{ borderColor: "#D4BBFF66" }}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase text-white/70">TOTAL LESSONS CREATED</span>
      <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
    </div>
    <div className="flex items-center gap-3 mt-4">
      <span className="text-xl font-bold text-white">{formatNumber(data?.lessonsCreated ?? 0)}</span>
    </div>
  </div>
</div>
 </div>
      </div>
    </div>
  );
}
