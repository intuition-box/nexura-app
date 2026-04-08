import { useState } from "react";
import Chart from "react-apexcharts";
import AnimatedBackground from "../components/AnimatedBackground";
import { ResponsivePie } from "@nivo/pie";
import { ChevronDown } from "lucide-react";

export default function Analytics() {
  const ranges = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 3 months", "All Time"];
  const [activeRange, setActiveRange] = useState("Last 24 Hrs");
  const [usersJoined, setUsersJoined] = useState(500);
  const [tasksCompleted, setTasksCompleted] = useState(400);
  const [totalTransactions, setTotalTransactions] = useState(100);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);

  const transactionPercentages = {
    Nexons: 0.3,   // 30%
    Claims: 0.2,   // 20%
    Payments: 0.38, // 38%
    Others: 0.12,  // 12%
  };

    const transactionsData = Object.entries(transactionPercentages).map(([id, pct]) => ({
    id,
    value: Math.round(pct * totalTransactions),
    color:
      id === "Claims"
        ? "#00E1A2"
        : id === "Nexons"
        ? "#B65FC8"
        : id === "Payments"
        ? "#8A3FFD"
        : "#FFFFFF",
  }));

const totalUsersData = {
  "Last 24 Hrs": 500,
  "Last 7 days": 700,
  "Last 30 days": 1200,
  "Last 3 months": 2200,
  "All Time": 5400,
};

const activeUsersData = {
  "Last 24 Hrs": 320,
  "Last 7 days": 450,
  "Last 30 days": 750,
  "Last 3 months": 1400,
  "All Time": 3800,
};

const chartData = {
  "Last 24 Hrs": [40, 85, 140, 220, 320, 410, 500],

  "Last 7 days": [90, 180, 260, 350, 470, 590, 700],

  "Last 30 days": [120, 260, 430, 610, 790, 980, 1200],

  "Last 3 months": [150, 320, 480, 670, 860, 1050, 1230, 1420, 1610, 1810, 2010, 2200],

  "All Time": [120, 240, 380, 540, 720, 920, 1150, 1400, 1680, 1980, 2310, 2670, 3060, 3480, 3930, 4410, 4920, 5400],
};

  // New users = current total - previous total (or same as total for the first range)
  const rangeOrder = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 3 months", "All Time"];
  const newUsersData = {};
  rangeOrder.forEach((range, idx) => {
    if (idx === 0) {
      newUsersData[range] = totalUsersData[range];
    } else {
      const prevRange = rangeOrder[idx - 1];
      newUsersData[range] = totalUsersData[range] - totalUsersData[prevRange];
    }
  });

const cards = [
  {
    title: "Total Users",
    value: totalUsersData[activeRange],
    rate: (() => {
      const idx = rangeOrder.indexOf(activeRange);
      if (idx === 0) return null; // no previous period
      const prev = totalUsersData[rangeOrder[idx - 1]];
      return ((totalUsersData[activeRange] - prev) / prev) * 100;
    })(),
    description: `during ${activeRange.toLowerCase()}`,
    icon: "referrals.png",
  },
  {
    title: "New Users",
    value: newUsersData[activeRange],
    rate: (() => {
      const idx = rangeOrder.indexOf(activeRange);
      if (idx === 0) return null;
      const prev = newUsersData[rangeOrder[idx - 1]];
      return ((newUsersData[activeRange] - prev) / prev) * 100;
    })(),
    description: "vs last period",
    icon: "new-users.png",
  },
  {
    title: "Active Users",
    value: activeUsersData[activeRange],
    rate: (() => {
      const idx = rangeOrder.indexOf(activeRange);
      if (idx === 0) return null;
      const prev = activeUsersData[rangeOrder[idx - 1]];
      return ((activeUsersData[activeRange] - prev) / prev) * 100;
    })(),
    description: "vs last period",
    icon: "approved.png",
  },
  {
    title: "Quests Created",
    value: 1, // if you have historical data, replace with dynamic
    rate: null, // dynamic calculation if previous data exists
    description: "vs last period",
    icon: "quest-iconx.png",
  },
  {
    title: "Campaigns Created",
    value: 1, // dynamic if you track historical
    rate: null,
    description: "vs last period",
    icon: "campaign_icon.png",
  },
];

  const chartCategories = {
    "Last 24 Hrs": ["12am", "4am", "8am", "12pm", "4pm", "8pm"],
    "Last 7 days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "Last 30 days": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "Last 3 months": ["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6","Week 7","Week 8","Week 9","Week 10","Week 11","Week 12"],
    "All Time": Array.from({ length: 24 }, (_, i) => `M${i + 1}`),
  };

  const series = [
    { name: "New Users", data: chartData[activeRange] || [] },
  ];

  const options = {
    chart: { id: "new-user-chart", background: "transparent", toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { categories: chartCategories[activeRange], labels: { style: { colors: "#ffffffaa" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: "#ffffffaa" } } },
    grid: { borderColor: "#ffffff11" },
    stroke: { curve: "smooth", width: 2, colors: ["#00E1A2"] },
    fill: {
      type: "gradient",
      gradient: { shade: "dark", type: "vertical", gradientToColors: ["#00E1A21A"], opacityFrom: 0.6, opacityTo: 0.1 },
    },
    markers: { size: 0 },
    tooltip: { theme: "dark" },
    dataLabels: { enabled: false },
  };

  const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  }

  return num.toString();
};

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden overflow-y-auto p-3 sm:p-6 relative pb-28 sm:pb-6 font-geist">
      <AnimatedBackground />
      
      <div className="flex-col flex items-center justify content">Coming Soon</div>
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

         {/* Ranges */}
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

         {/* Mobile */}
<div className="relative mt-12 mb-6 w-[180px] sm:hidden">
  <button
    onClick={() => setShowRangeDropdown((prev) => !prev)}
    className="flex w-full items-center justify-between rounded-2xl border border-[#8B3EFE] bg-black px-4 py-3 text-sm font-medium text-white"
  >
    <span>{activeRange}</span>
    <ChevronDown
      size={18}
      className={`transition-transform duration-200 ${
        showRangeDropdown ? "rotate-180" : ""
      }`}
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
            activeRange === label
              ? "bg-[#8B3EFE]"
              : "bg-black hover:bg-[#1A1A1A]"
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
      {/* Bubble / glow background */}
      <div className="absolute -right-10 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-[#8B3EFE]/20 blur-3xl sm:hidden" />

      {/* Larger blurred icon on mobile */}
      <img
  src={card.icon}
  alt=""
  className="
    absolute right-3 top-2 bottom-3
    w-[30%]
    object-cover object-center
    opacity-20 blur-[2px]
    sm:hidden
  "
/>

      {/* Desktop icon stays normal */}
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
        {card.value}
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
  className="
    mt-10 sm:mt-16
    w-full
    bg-[#170F1F]
    rounded-2xl sm:rounded-3xl
    px-3 py-4 sm:p-6
    h-[20rem] sm:h-[24rem]
    relative
    border-t border-l border-r
    overflow-hidden
  "
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
  {/* Mobile background glow */}
  <div className="absolute -right-10 top-6 h-24 w-24 rounded-full bg-[#00E1A2]/10 blur-3xl sm:hidden" />

  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 max-w-[75%] sm:max-w-none">
    <h2 className="text-sm sm:text-2xl font-semibold text-white leading-tight">
      New User Growth Trend
    </h2>

    <p className="mt-1 text-[11px] sm:text-sm text-white/50 leading-snug">
      Monitor daily new user activity and growth patterns
    </p>
  </div>

  <div className="w-full h-full pt-14 sm:pt-16">
    <Chart
      options={{
        ...options,
        chart: {
          ...options.chart,
          toolbar: {
            show: false,
          },
        },
        legend: {
          show: false,
        },
        xaxis: {
          ...options.xaxis,
          labels: {
            ...options.xaxis?.labels,
            style: {
              fontSize: window.innerWidth < 640 ? "10px" : "12px",
            },
            rotate: window.innerWidth < 640 ? -45 : 0,
          },
        },
        yaxis: {
          ...options.yaxis,
          labels: {
            ...options.yaxis?.labels,
            style: {
              fontSize: window.innerWidth < 640 ? "10px" : "12px",
            },
          },
        },
        grid: {
          ...options.grid,
          padding: {
            left: 0,
            right: 0,
          },
        },
      }}
      series={series}
      type="area"
      height="100%"
    />
  </div>
</div>

         {/* Bottom Cards Section */}
 <div className="mt-16 grid grid-cols-12 gap-4 w-full">
 {/* Left Card A */}
<div
  className="col-span-12 sm:col-span-4 row-span-2 p-4 rounded-3xl flex flex-col justify-between border"
  style={{ borderColor: "#D4BBFF1A", backgroundColor: "#833AFD" }}
>
  {/* Title */}
  <span className="text-lg sm:text-xl font-semibold text-white">
    Join vs Completion ratio
  </span>

  {/* Circle + Capsules */}
  <div className="flex items-center mt-4">
    {/* Circle */}
    <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0">
      <ResponsivePie
  data={[
    { id: "Tasks Completed", value: Math.min(tasksCompleted, usersJoined) },
    { id: "Users Not Completed", value: Math.max(usersJoined - tasksCompleted, 0) },
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
      {/* Square color box */}
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
            : (
                (Math.min(tasksCompleted, usersJoined) / usersJoined) *
                100
              ).toFixed(0)}
          %
        </p>
        <span className="text-white text-[10px] sm:text-xs">
          Completion
        </span>
      </div>
    </div>

    {/* Capsules */}
    <div className="flex flex-col gap-2 sm:gap-3 flex-1 ml-3 sm:ml-6">
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-full border"
        style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-white truncate">
            Joined
          </span>
        </div>

        <span className="text-xs sm:text-sm font-bold text-white ml-2">
          {usersJoined}
        </span>
      </div>

      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-full border"
        style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00E1A2] shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase text-white truncate">
            Completed
          </span>
        </div>

        <span className="text-xs sm:text-sm font-bold text-white ml-2">
          {tasksCompleted}
        </span>
      </div>
    </div>
  </div>

  {/* Drop-off text */}
  <div className="mt-4 text-white/70 text-xs sm:text-sm leading-relaxed">
    {usersJoined
      ? `${Math.round(
          ((usersJoined - tasksCompleted) / usersJoined) * 100
        )}% of users drop before completion`
      : "0% of users drop before completion"}
  </div>

  {/* Legend — desktop only */}
  <div
    className="hidden sm:flex mt-2 p-2 rounded-3xl border flex-col gap-2"
    style={{ borderColor: "#D4BBFF4D", backgroundColor: "#632DBB" }}
  >
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-white"></div>
      <span className="text-white text-[10px]">
        JOINED: Total users who joined a quest, campaign & lesson
      </span>
    </div>

    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
      <span className="text-white text-[10px]">
        COMPLETED: Total users who completed a quest, campaign & lesson
      </span>
    </div>
  </div>
</div>

   {/* Middle Card B */}
<div
  className="col-span-12 sm:col-span-5 row-span-2 p-3 sm:p-2 rounded-3xl flex flex-col border"
  style={{ backgroundColor: "#170F1F", borderColor: "#D4BBFF66" }}
>
  {/* Title */}
  <span className="text-xs font-semibold uppercase text-white/90 text-center">
    On-Chain Activity
  </span>

  {/* Paragraph */}
  <p className="text-center text-[11px] sm:text-[12px] text-white/70 mt-2">
    Overview of transaction distribution across all on-chain activities
  </p>

  {/* Main content container - centers vertically */}
<div className="flex-1 flex flex-col justify-center mt-4 sm:mt-0">
  <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 sm:gap-6 w-full">
    {/* Pie Chart */}
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
        arcLabel={(d) =>
          `${Math.round((d.value / totalTransactions) * 100)}%`
        }
        tooltip={({ datum }) => (
          <div className="bg-black text-white px-2 py-1 rounded text-xs">
            {datum.id}: {datum.value} (
            {((datum.value / totalTransactions) * 100).toFixed(1)}%)
          </div>
        )}
      />
    </div>

        {/* Transactions Summary */}
    <div className="w-full sm:ml-2 sm:pr-2 flex flex-col sm:justify-center sm:items-center">
      <div className="text-center sm:text-center mb-3 sm:mb-4">
        <div className="text-xl sm:text-2xl font-bold text-white">
          {totalTransactions}
        </div>
        <div className="text-[10px] sm:text-[0.7rem] font-semibold text-white/30 uppercase">
          Transactions
        </div>
      </div>

      <div
  className="flex flex-col gap-2 p-4 rounded-[1.5rem] border w-full sm:w-[220px]"
  style={{
    borderColor: "rgba(212,187,255,0.3)",
    backgroundColor: "transparent",
  }}
>
        {transactionsData.map((t) => (
          <div
            key={t.id}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-full border border-white shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-[10px] sm:text-[0.7rem] font-semibold text-white/80 uppercase truncate">
                {t.id}
              </span>
            </div>

            <span className="text-[10px] sm:text-[0.7rem] font-bold text-white/80 ml-2">
              {t.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
</div>

 {/* Top Right Card C with Blur */}
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
  {/* Intuition Icon */}
  {/* Desktop: small top-right */}
  <img
    src="/intuition-icon.png"
    alt="Intuition Logo"
    className="hidden sm:block absolute top-4 right-4 w-7 h-7 object-contain z-10"
  />
  {/* Mobile: big right-side bubble */}
  <img
    src="/intuition-icon.png"
    alt="Intuition Logo"
    className="block sm:hidden absolute right-2 top-1/2 transform -translate-y-1/2 w-24 h-24 opacity-20 pointer-events-none"
  />

  {/* Top row: title */}
  <div className="relative z-10">
    <span className="text-xs font-semibold uppercase text-white">
      TOTAL TRUST DISTRIBUTED
    </span>
  </div>

  {/* Main revenue number + trust icon */}
  <div className="flex items-center gap-3 relative z-10 mt-4">
    <span className="text-2xl font-bold text-white">{formatNumber(8000.03)}</span>
    <img
      src="/trust-icon.png"
      alt="Trust Icon"
      className="w-12 h-8 object-contain"
    />
  </div>
</div>

{/* Bottom Right Cards D & E side by side */}
<div className="col-span-12 sm:col-span-3 grid grid-cols-2 gap-4">
  {/* Card D */}
  <div
    className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border col-span-1"
    style={{ borderColor: "#D4BBFF66" }}
  >
    {/* Top row: title left, logo right */}
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase text-white/70">
        TOTAL CLAIMS CREATED
      </span>
      <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
    </div>

    {/* Number below */}
    <div className="mt-4">
      <span className="text-xl font-bold text-white">{formatNumber(1550)}</span>
    </div>
  </div>

  {/* Card E */}
  <div
    className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border col-span-1"
    style={{ borderColor: "#D4BBFF66" }}
  >
    {/* Top row: title left, logo right */}
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase text-white/70">
        TOTAL LESSONS CREATED
      </span>
      <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
    </div>

    {/* Number + trust icon */}
    <div className="flex items-center gap-3 mt-4">
      <span className="text-xl font-bold text-white">1</span>
      {/* <img src="/trust-icon.png" alt="Trust Icon" className="w-10 h-8 object-contain" /> */}
    </div>
  </div>
</div>
 </div>
      </div>
    </div>
  );
}
