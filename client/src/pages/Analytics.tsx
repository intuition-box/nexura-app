import { useState } from "react";
import Chart from "react-apexcharts";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Analytics() {
  const ranges = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 3 months", "All Time"];
  const [activeRange, setActiveRange] = useState("Last 24 Hrs");
  

  const cards = [
    { title: "Total Users", value: "200", rate: "+12.4%", description: "vs last 24hrs", icon: "referrals.png" },
    { title: "Active Users", value: "120", rate: "+8.1%", description: "vs last 24hrs", icon: "approved.png" },
    { title: "New Users", value: "10", rate: "+5.7%", description: "vs last 24hrs", icon: "new-users.png" },
    { title: "Quests Created", value: "1", rate: "+9.2%", description: "vs last 24hrs", icon: "quest-iconx.png" },
    { title: "Campaigns Created", value: "1", rate: "+3.8%", description: "vs last 24hrs", icon: "campaign_icon.png" },
  ];

  const chartData = {
    "Last 24 Hrs": Array.from({ length: 6 }, () => Math.floor(Math.random() * 20)),
    "Last 7 days": Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
    "Last 30 days": Array.from({ length: 4 }, () => Math.floor(Math.random() * 300)),
    "Last 3 months": Array.from({ length: 12 }, () => Math.floor(Math.random() * 500)),
    "All Time": Array.from({ length: 24 }, () => Math.floor(Math.random() * 1000)),
  };

  const chartCategories = {
    "Last 24 Hrs": ["12am", "4am", "8am", "12pm", "4pm", "8pm"],
    "Last 7 days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "Last 30 days": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "Last 3 months": [
      "Week 1","Week 2","Week 3","Week 4","Week 5","Week 6",
      "Week 7","Week 8","Week 9","Week 10","Week 11","Week 12"
    ],
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

        {/* Ranges */}
        <div className="mt-12 flex gap-2 max-w-[45vw] mb-6">
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

        {/* Cards Row */}
        <div className="mt-12 flex gap-4 w-full">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="flex-1 bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border border-gray-700 mt-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase text-white/70">{card.title}</span>
                <img src={card.icon} alt="" className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{card.value}</div>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <img src="/rate.png" alt="" className="w-5 h-3" />
                <span className="text-[#00E1A2]">{card.rate} {card.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div
          className="mt-16 w-full bg-[#170F1F] rounded-3xl p-6 h-[24rem] relative border-t border-l border-r"
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
          <div className="absolute top-6 left-6 space-y-1 z-10">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">
              New User Growth Trend
            </h2>
            <p className="text-sm text-white/50">
              Monitor daily new user activity and growth patterns
            </p>
          </div>

          <div className="w-full h-full pt-16">
            <Chart options={options} series={series} type="area" height="100%" />
          </div>
        </div>

        {/* Bottom Cards Section */}
<div className="mt-16 grid grid-cols-12 gap-4 w-full">
{/* Left Card A */}
<div className="col-span-4 row-span-2 p-4 rounded-3xl flex flex-col justify-between border"
     style={{ borderColor: "#D4BBFF1A", backgroundColor: "#833AFD" }}>
  
  {/* Title */}
  <span className="text-xl font-semibold text-white">
    Join vs Completion ratio
  </span>

  {/* Circle + Capsules */}
<div className="flex items-center mt-2">
  {/* Circle with Joined vs Completed */}
  <div className="w-28 h-28 relative">
    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
      {/* Background circle */}
      <circle
        cx="18"
        cy="18"
        r="16"
        stroke="#833AFD" 
        strokeWidth="4"
        fill="none"
        opacity="0.2"
      />
      {/* Completed segment */}
      <circle
        cx="18"
        cy="18"
        r="16"
        stroke="#00E1A2"
        strokeWidth="4"
        fill="none"
        strokeDasharray="56 100" 
        strokeLinecap="round"
      />
      {/* Joined segment */}
      <circle
        cx="18"
        cy="18"
        r="16"
        stroke="#FFFFFF"
        strokeWidth="4"
        fill="none"
        strokeDasharray="44 100" 
        strokeDashoffset="-56" 
        strokeLinecap="butt"
      />
    </svg>

    {/* Center text */}
    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-base">
      100%
    </div>
  </div>

  {/* Capsules container */}
  <div className="flex flex-col gap-3 flex-1 ml-6">
    {/* Joined capsule */}
    <div className="flex items-center justify-between px-4 py-2 rounded-full border"
         style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-white"></div>
        <span className="text-xs font-semibold uppercase">Joined</span>
      </div>
      <span className="text-sm font-bold">100</span>
    </div>

    {/* Completed capsule */}
    <div className="flex items-center justify-between px-4 py-2 rounded-full border"
         style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
        <span className="text-xs font-semibold uppercase">Completed</span>
      </div>
      <span className="text-sm font-bold">90</span>
    </div>
  </div>
</div>

  {/* Drop-off text */}
  <div className="mt-4 text-white/70 text-sm">
    32% of users drop before completion
  </div>

  {/* Container with JOINED/COMPLETED legend */}
  <div className="mt-2 p-2 rounded-3xl border flex flex-col gap-2"
       style={{ borderColor: "#D4BBFF4D", backgroundColor: "#632DBB" }}>
    
    {/* Joined legend */}
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-white"></div>
      <span className="text-white text-[10px]">JOINED (Total users who joined a quest, campaign & lesson)</span>
    </div>

    {/* Completed legend */}
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
      <span className="text-white text-[10px]">COMPLETED (Total users who completed a quest, campaign & lesson)</span>
    </div>
  </div>
</div>

  {/* Middle Card B */}
<div className="col-span-5 row-span-2 p-4 rounded-3xl flex flex-col justify-between border"
     style={{ backgroundColor: "#170F1F", borderColor: "#D4BBFF66" }}>
  
  {/* Title */}
  <span className="text-xs font-semibold uppercase text-white/90 text-center">
    On-Chain Activity
  </span>

  {/* Paragraph */}
  <p className="text-center text-[12px] text-white/70 mt-2">
    Overview of transaction distribution across all on-chain activities
  </p>

  {/* Main content: Left image + Right stats */}
  <div className="flex items-start mt-4 gap-6">
    {/* Left image */}
    <div className="flex-shrink-0">
      <img src="/onchain.png" alt="On-Chain" className="w-48 h-48 object-contain" />
    </div>

    {/* Right stats */}
    <div className="flex flex-col flex-1 gap-4">
      {/* Transactions summary */}
      <div className="text-center">
        <div className="text-3xl font-bold text-white">1500</div>
        <div className="text-xs font-semibold text-white/30 uppercase">TRANSACTIONS</div>
      </div>

      {/* Detailed breakdown container */}
      <div className="flex flex-col gap-3 p-3 rounded-xl border"
          style={{ borderColor: "#D4BBFF4D", backgroundColor: "#00000000" }}>
        
        {/* Claim */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white bg-[#00E1A2]"></div>
            <span className="text-xs text-white/12 font-semibold uppercase">Claims</span>
          </div>
          <span className="text-xs text-white/12 font-bold">300</span>
        </div>

        {/* Nexons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white bg-[#B65FC8]"></div>
            <span className="text-xs text-white/12 font-semibold uppercase">Nexons</span>
          </div>
          <span className="text-xs text-white/12 font-bold">450</span>
        </div>

        {/* Payments */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white bg-[#8A3FFD]"></div>
            <span className="text-xs text-white/12 font-semibold uppercase">Payments</span>
          </div>
          <span className="text-xs text-white/12 font-bold">570</span>
        </div>

        {/* Others */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white bg-white"></div>
            <span className="text-xs text-white/12 font-semibold uppercase">Others</span>
          </div>
          <span className="text-xs text-white/12 font-bold">180</span>
        </div>

      </div>
    </div>
  </div>
</div>

{/* Top Right Card C with Blur */}
<div className="col-span-3 rounded-3xl p-4 flex flex-col justify-between border backdrop-blur-[20px]"
     style={{ backgroundColor: "rgba(23, 15, 31, 0.7)", borderColor: "#D4BBFF66" }}>
  
  {/* Top row: title left, logo right */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold uppercase">
      TOTAL REVENUE GENERATED
    </span>
    <img src="/intuition-icon.png" alt="Intuition Logo" className="w-7 h-7 object-contain" />
  </div>

  {/* Main revenue number + trust icon */}
  <div className="flex items-center gap-3 mt-4">
    <span className="text-xl font-bold text-white">8,000.03</span>
    <img src="/trust-icon.png" alt="Trust Icon" className="w-12 h-8 object-contain" />
  </div>

  {/* Bottom-left rate */}
  <div className="flex items-center gap-2 mt-6">
    <img src="/rate.png" alt="Rate Icon" className="w-4 h-4 object-contain" />
    <span className="text-xs font-semibold text-[#00E1A2]">+31.2% vs 24hrs</span>
  </div>
</div>

  {/* Bottom Right Cards D & E side by side */}
  <div className="col-span-3 grid grid-cols-2 gap-4">

{/* Card D */}
<div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border"
     style={{ borderColor: "#D4BBFF66" }}>
  
  {/* Top row: title left, logo right */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold uppercase text-white/70">
      TOTAL CLAIMS CREATED
    </span>
    <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
  </div>

  {/* Number below */}
  <div className="mt-4">
    <span className="text-xl font-bold text-white">1550</span>
  </div>
</div>

{/* CARD E  */}
<div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border"
     style={{ borderColor: "#D4BBFF66" }}>
  
  {/* Top row: title left, logo right */}
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold uppercase text-white/70">
      TOTAL TRUST DISTRIBUTED
    </span>
    <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
  </div>

  {/* Number + trust icon */}
  <div className="flex items-center gap-3 mt-4">
    <span className="text-xl font-bold text-white">4000</span>
    <img src="/trust-icon.png" alt="Trust Icon" className="w-10 h-8 object-contain" />
  </div>
</div>
  </div>
</div>
      </div>
    </div>
  );
}