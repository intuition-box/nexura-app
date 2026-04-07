﻿// import { useState } from "react";
// import Chart from "react-apexcharts";
// import AnimatedBackground from "../components/AnimatedBackground";
// import { ResponsivePie } from "@nivo/pie";
// import { useEffect } from "react";
// import { apiRequestV2 } from "../lib/queryClient";

// export default function Analytics() {
//   const ranges = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 3 months", "All Time"];
//   const [activeRange, setActiveRange] = useState("Last 24 Hrs");
//   const [analytics, setAnalytics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   if (loading) return <div>Loading analytics...</div>;
// if (error) return <div>{error}</div>;
// if (!analytics) return null; 

//   useEffect(() => {
//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);

//       const data = await apiRequestV2("GET", "/api/analytics");

//       setAnalytics(data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load analytics");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAnalytics();
// }, []);

//   const rangesData = analytics?.ranges || {};
// const currentRange = rangesData[activeRange] || {};

// const totalUsersData = Object.fromEntries(
//   Object.entries(rangesData).map(([key, value]) => [key, value?.totalUsers || 0])
// );

// const activeUsersData = Object.fromEntries(
//   Object.entries(rangesData).map(([key, value]) => [key, value?.activeUsers || 0])
// );

// const newUsersData = Object.fromEntries(
//   Object.entries(rangesData).map(([key, value]) => [key, value?.newUsers || 0])
// );

// const chartData = Object.fromEntries(
//   Object.entries(rangesData).map(([key, value]) => [key, value?.chart || []])
// );

// const calculateRate = (current, prev) => {
//   if (prev === 0 || prev === null || prev === undefined) return null;
//   return ((current - prev) / prev) * 100;
// };

//   // New users = current total - previous total (or same as total for the first range)
//   const rangeOrder = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 3 months", "All Time"];

// const cards = [
//   {
//     title: "Total Users",
//     value: totalUsersData[activeRange],
//     rate: (() => {
//       const idx = rangeOrder.indexOf(activeRange);
//       if (idx === 0) return null; // no previous period
//       const prev = totalUsersData[rangeOrder[idx - 1]];
//       return prev ? ((totalUsersData[activeRange] - prev) / prev) * 100 : null;
//     })(),
//     description: `during ${activeRange.toLowerCase()}`,
//     icon: "referrals.png",
//   },
//   {
//     title: "New Users",
//     value: newUsersData[activeRange || 0],
//     rate: (() => {
//       const idx = rangeOrder.indexOf(activeRange);
//       if (idx === 0) return null;
//       const prev = newUsersData[rangeOrder[idx - 1]] || 0;
//       return calculateRate(newUsersData[activeRange], prev);
//     })(),
//     description: "vs last period",
//     icon: "new-users.png",
//   },
//   {
//     title: "Active Users",
//     value: activeUsersData[activeRange] || 0,
//     rate: (() => {
//       const idx = rangeOrder.indexOf(activeRange);
//       if (idx === 0) return null;
//       const prev = activeUsersData[rangeOrder[idx - 1]] || 0;
//       return calculateRate(activeUsersData[activeRange], prev);
//     })(),
//     description: "vs last period",
//     icon: "approved.png",
//   },
//   {
//     title: "Quests Created",
//     value: currentRange.questsCreated, 
//     rate: null,
//     description: "vs last period",
//     icon: "quest-iconx.png",
//   },
//   {
//     title: "Campaigns Created",
//     value: currentRange.campaignsCreated, 
//     rate: null,
//     description: "vs last period",
//     icon: "campaign_icon.png",
//   },
// ];

//   const chartCategories = {
//     "Last 24 Hrs": ["12am", "4am", "8am", "12pm", "4pm", "8pm"],
//     "Last 7 days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//     "Last 30 days": ["Week 1", "Week 2", "Week 3", "Week 4"],
//     "Last 3 months": ["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6","Week 7","Week 8","Week 9","Week 10","Week 11","Week 12"],
//     "All Time": Array.from({ length: 24 }, (_, i) => `M${i + 1}`),
//   };

//   const series = [
//     { name: "New Users", data: chartData[activeRange] || [] },
//   ];

//   const options = {
//     chart: { id: "new-user-chart", background: "transparent", toolbar: { show: false }, zoom: { enabled: false } },
//     xaxis: { categories: chartCategories[activeRange], labels: { style: { colors: "#ffffffaa" } }, axisBorder: { show: false }, axisTicks: { show: false } },
//     yaxis: { labels: { style: { colors: "#ffffffaa" } } },
//     grid: { borderColor: "#ffffff11" },
//     stroke: { curve: "smooth", width: 2, colors: ["#00E1A2"] },
//     fill: {
//       type: "gradient",
//       gradient: { shade: "dark", type: "vertical", gradientToColors: ["#00E1A21A"], opacityFrom: 0.6, opacityTo: 0.1 },
//     },
//     markers: { size: 0 },
//     tooltip: { theme: "dark" },
//     dataLabels: { enabled: false },
//   };

//   const formatNumber = (num) => {
//   if (num >= 1000000) {
//     return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
//   }

//   if (num >= 1000) {
//     return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
//   }

//   return num.toString();
// };

// const transactionColors = {
//   Nexons: "#B65FC8",
//   Claims: "#00E1A2",
//   Payments: "#8A3FFD",
//   Others: "#FFFFFF",
// };

// const totalTransactions = analytics?.transactionBreakdown 
//   ? Object.values(analytics.transactionBreakdown).reduce((sum, value) => sum + value, 0)
//   : 0;

// const transactionsData = Object.entries(analytics.transactionBreakdown).map(
//   ([id, value]) => ({
//     id,
//     value,
//     color: transactionColors[id],
//   })
// );

//   if (loading) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-white">
//       Loading analytics...
//     </div>
//   );
// }

// if (error || !analytics) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
//       {error || "No analytics data found"}
//     </div>
//   );
// } return (
//     <div className="min-h-screen bg-black text-white overflow-x-hidden overflow-y-auto p-3 sm:p-6 relative pb-28 sm:pb-6 font-geist">
//       <AnimatedBackground />

//       <div className="max-w-6xl mx-auto relative z-10 space-y-2">
//         {/* Header */}
//         <div className="space-y-1 mb-4">
//           <div className="flex items-center gap-2 mb-3">
//             <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
//             <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
//               Analytics
//             </span>
//           </div>
//           <h1 className="text-2xl sm:text-4xl bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-4 animate-slide-up delay-100">
//             Platform Performance Metrics
//           </h1>
//           <p className="text-sm text-white/50 animate-slide-up delay-200">
//             Track live platform activity and growth metrics on Nexura
//           </p>
//         </div>

//         {/* Ranges */}
//         <div className="mt-12 flex gap-2 max-w-[45vw] mb-6">
//           {ranges.map((label) => (
//             <button
//               key={label}
//               onClick={() => setActiveRange(label)}
//               className={`rounded-full border px-2 py-1.5 text-xs font-medium text-white transition-all duration-200 ${
//                 activeRange === label
//                   ? "bg-[#8B3EFE] border-[#8B3EFE]"
//                   : "bg-transparent border-[#8B3EFE] hover:bg-[#8B3EFE]"
//               }`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

// {/* Cards Row */}
// <div className="mt-12 flex gap-4 w-full">
//   {cards.map((card, idx) => (
//     <div
//       key={idx}
//       className="flex-1 bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border border-gray-700 mt-4"
//     >
//       <div className="flex justify-between items-start mb-2">
//         <span className="text-xs font-semibold uppercase text-white/70">{card.title}</span>
//         <img src={card.icon} alt="" className="w-5 h-5" />
//       </div>
//       <div className="text-2xl font-bold text-white mb-2">{card.value}</div>
//       {card.rate !== null && card.rate !== undefined ? (
//         <div className="flex items-center gap-1 text-xs">
//           <img src="/rate.png" alt="" className="w-5 h-3" />
//           <span className={card.rate >= 0 ? "text-[#00E1A2]" : "text-red-500"}>
//             {card.rate >= 0 ? "+" : ""}
//             {card.rate.toFixed(1)}% {card.description}
//           </span>
//         </div>
//       ) : (
//         <div className="text-xs text-white/50">{card.description}</div>
//       )}
//     </div>
//   ))}
// </div>

//         {/* Graph Section */}
//         <div
//           className="mt-16 w-full bg-[#170F1F] rounded-3xl p-6 h-[24rem] relative border-t border-l border-r"
//           style={{
//             borderTopColor: "#00E1A266",
//             borderLeftColor: "#00E1A222",
//             borderRightColor: "#00E1A222",
//             borderBottomWidth: 0,
//             borderLeftWidth: 1,
//             borderRightWidth: 1,
//             borderTopWidth: 2,
//           }}
//         >
//           <div className="absolute top-6 left-6 space-y-1 z-10">
//             <h2 className="text-lg sm:text-2xl font-semibold text-white">
//               New User Growth Trend
//             </h2>
//             <p className="text-sm text-white/50">
//               Monitor daily new user activity and growth patterns
//             </p>
//           </div>

//           <div className="w-full h-full pt-16">
//             <Chart options={options} series={series || []} type="area" height="100%" />
//           </div>
//         </div>

//         {/* Bottom Cards Section */}
// <div className="mt-16 grid grid-cols-12 gap-4 w-full">
// {/* Left Card A */}
// <div className="col-span-4 row-span-2 p-4 rounded-3xl flex flex-col justify-between border"
//      style={{ borderColor: "#D4BBFF1A", backgroundColor: "#833AFD" }}>
  
//   {/* Title */}
//   <span className="text-xl font-semibold text-white">
//     Join vs Completion ratio
//   </span>

//   {/* Circle + Capsules */}
// <div className="flex items-center mt-2">
//   {/* Circle with Joined vs Completed */}
//         <div className="relative w-36 h-36">
//           <ResponsivePie
//             data={[
//               { id: 'Tasks Completed', value: Math.min(analytics.tasksCompleted, analytics.usersJoined) },
//               { id: 'Users Not Completed', value: Math.max(analytics.usersJoined - analytics.tasksCompleted, 0) },
//             ]}
//             margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
//             innerRadius={0.7}
//             padAngle={0.7}
//             cornerRadius={3}
//             activeOuterRadiusOffset={8}
//             colors={["#00E1A2", "#FFFFFF"]}
//             borderWidth={1}
//             borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
//             enableArcLinkLabels={false}
//             enableArcLabels={false}
//             animate={true}
//             theme={{
//               tooltip: {
//                 container: {
//                   background: '#333333',
//                   color: '#FFFFFF',
//                   fontSize: '12px',
//                   padding: '6px 10px',
//                   borderRadius: '6px',
//                 },
//               },
//             }}
//           />

//           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//             <p className="text-white font-bold text-xl">
//               {analytics.usersJoined === 0
//                 ? 0
//                 : ((Math.min(analytics.tasksCompleted, analytics.usersJoined) / analytics.usersJoined) * 100).toFixed(2)}%
//             </p>
//             <span className="text-white text-xs">Completion</span>
//           </div>
//         </div>

// {/* Capsules container */}
// <div className="flex flex-col gap-3 flex-1 ml-6">
//   {/* Joined capsule */}
//   <div
//     className="flex items-center justify-between px-4 py-2 rounded-full border"
//     style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
//   >
//     <div className="flex items-center gap-2">
//       <div className="w-3 h-3 rounded-full bg-white"></div>
//       <span className="text-xs font-semibold uppercase">Joined</span>
//     </div>
//     <span className="text-sm font-bold">{analytics.usersJoined}</span>
//   </div>

// {/* Completed capsule */}
// <div
//   className="flex items-center justify-between px-4 py-2 rounded-full border"
//   style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
// >
//   <div className="flex items-center gap-2">
//     <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
//     <span className="text-xs font-semibold uppercase">Completed</span>
//   </div>
//   <span className="text-sm font-bold ml-2">{analytics.tasksCompleted}</span>
// </div>
//   </div>
// </div>

// {/* Drop-off text */}
// <div className="mt-4 text-white/70 text-sm">
//   {analytics.usersJoined
//     ? `${Math.round(((analytics.usersJoined - analytics.tasksCompleted) / analytics.usersJoined) * 100)}% of users drop before completion`
//     : "0% of users drop before completion"}
// </div>

//   {/* Container with JOINED/COMPLETED legend */}
//   <div className="mt-2 p-2 rounded-3xl border flex flex-col gap-2"
//        style={{ borderColor: "#D4BBFF4D", backgroundColor: "#632DBB" }}>
    
//     {/* Joined legend */}
//     <div className="flex items-center gap-2">
//       <div className="w-3 h-3 rounded-full bg-white"></div>
//       <span className="text-white text-[10px]">JOINED: Total users who joined a quest, campaign & lesson</span>
//     </div>

//     {/* Completed legend */}
//     <div className="flex items-center gap-2">
//       <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
//       <span className="text-white text-[10px]">COMPLETED: Total users who completed a quest, campaign & lesson</span>
//     </div>
//   </div>
// </div>

//   {/* Middle Card B */}
// <div className="col-span-5 row-span-2 p-2 rounded-3xl flex flex-col border"
//      style={{ backgroundColor: "#170F1F", borderColor: "#D4BBFF66" }}>
  
//   {/* Title */}
//   <span className="text-xs font-semibold uppercase text-white/90 text-center">
//     On-Chain Activity
//   </span>

//   {/* Paragraph */}
//   <p className="text-center text-[12px] text-white/70 mt-2">
//     Overview of transaction distribution across all on-chain activities
//   </p>

//   {/* Main content: Left image + Right stats */}
// <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginTop: "-1rem" }}>
//   <div style={{ width: "100%", height: "12rem", marginLeft: "auto", cursor: "pointer", transform: "translateY(70px)" }}>
// <ResponsivePie
//   data={transactionsData || []}
//   margin={{ top: 20, right: 64, bottom: 20, left: 87 }}
//   innerRadius={0}
//   padAngle={0.7}
//   cornerRadius={3}
//   activeOuterRadiusOffset={8}
//   colors={(d) => d.data.color}
//   borderWidth={1}
//   borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
  
//   enableArcLinkLabels={true}
//   arcLinkLabelsTextColor={(d) => d.data.color}
//   arcLinkLabelsThickness={2}
//   arcLinkLabelsColor={{ from: "color" }}
//   arcLinkLabelsStraightLength={20}
//   arcLinkLabelsDiagonalLength={15}
//   arcLinkLabelsSkipAngle={3}
//   arcLinkLabelsTextOffset={5}
//   arcLinkLabelsText={(d) => `${d.id} (${Math.round((d.value / totalTransactions) * 100)}%)`}
//   enableArcLabels={false}

//   tooltip={({ datum }) => (
//     <div className="bg-black text-white px-2 py-1 rounded text-xs">
//       {datum.id}: {datum.value} ({((datum.value / totalTransactions) * 100).toFixed(1)}%)
//     </div>
//   )}
// />
//   </div>

// <div
//   style={{
//     marginTop: "2rem", 
//     marginLeft: "",
//     marginRight: "",
//     maxWidth: "100%",
//   }}
// >
//   <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
//     <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
//       {totalTransactions}
//     </div>
//     <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
//       TRANSACTIONS
//     </div>
//   </div>

//   <div
//     style={{
//       display: "flex",
//       flexDirection: "column",
//       gap: "0.5rem",
//       padding: "0.75rem",
//       borderRadius: "0.75rem",
//       border: "1px solid rgba(212,187,255,0.3)",
//       backgroundColor: "transparent",
//     }}
//   >
//     {transactionsData.map((t) => (
//       <div
//         key={t.id}
//         style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
//       >
//         <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
//           <div
//             style={{
//               width: "0.75rem",
//               height: "0.75rem",
//               borderRadius: "50%",
//               border: "1px solid #fff",
//               backgroundColor: t.color,
//             }}
//           ></div>
//           <span
//             style={{
//               fontSize: "0.7rem",
//               fontWeight: 600,
//               color: "rgba(255,255,255,0.8)",
//               textTransform: "uppercase",
//             }}
//           >
//             {t.id}
//           </span>
//         </div>
//         <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: "rgba(255,255,255,0.8)" }}>
//           {t.value}
//         </span>
//       </div>
//     ))}
//   </div>
// </div>
// </div>
// </div>

// {/* Top Right Card C with Blur */}
// <div className="col-span-3 rounded-3xl p-4 flex flex-col justify-between border backdrop-blur-[20px]"
//      style={{ backgroundColor: "rgba(23, 15, 31, 0.7)", borderColor: "#D4BBFF66" }}>
  
//   {/* Top row: title left, logo right */}
//   <div className="flex items-center justify-between">
//     <span className="text-xs font-semibold uppercase">
//       TOTAL REVENUE GENERATED
//     </span>
//     <img src="/intuition-icon.png" alt="Intuition Logo" className="w-7 h-7 object-contain" />
//   </div>

//   {/* Main revenue number + trust icon */}
//   <div className="flex items-center gap-3 mt-4">
//     <span className="text-xl font-bold text-white">{formatNumber(analytics.revenue)}</span>
//     <img src="/trust-icon.png" alt="Trust Icon" className="w-12 h-8 object-contain" />
//   </div>

//   {/* Bottom-left rate */}
//   <div className="flex items-center gap-2 mt-6">
//     <img src="/rate.png" alt="Rate Icon" className="w-4 h-4 object-contain" />
//     <span className="text-xs font-semibold text-[#00E1A2]">+31.2% vs 24hrs</span>
//   </div>
// </div>

//   {/* Bottom Right Cards D & E side by side */}
//   <div className="col-span-3 grid grid-cols-2 gap-4">

// {/* Card D */}
// <div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border"
//      style={{ borderColor: "#D4BBFF66" }}>
  
//   {/* Top row: title left, logo right */}
//   <div className="flex items-center justify-between">
//     <span className="text-xs font-semibold uppercase text-white/70">
//       TOTAL CLAIMS CREATED
//     </span>
//     <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
//   </div>

//   {/* Number below */}
//   <div className="mt-4">
//     <span className="text-xl font-bold text-white">{formatNumber(analytics.claimsCreated)}</span>
//   </div>
// </div>

// {/* CARD E  */}
// <div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border"
//      style={{ borderColor: "#D4BBFF66" }}>
  
//   {/* Top row: title left, logo right */}
//   <div className="flex items-center justify-between">
//     <span className="text-xs font-semibold uppercase text-white/70">
//       TOTAL LESSONS CREATED
//     </span>
//     <img src="/intuition-icon.png" alt="Intuition Logo" className="w-6 h-6 object-contain" />
//   </div>

//   {/* Number + trust icon */}
//   <div className="flex items-center gap-3 mt-4">
//     <span className="text-xl font-bold text-white">{analytics.lessonsCreated}</span>
//     {/* <img src="/trust-icon.png" alt="Trust Icon" className="w-10 h-8 object-contain" /> */}
//   </div>
// </div>
//   </div>
// </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import Chart from "react-apexcharts";
import AnimatedBackground from "../components/AnimatedBackground";
import { ResponsivePie } from "@nivo/pie";

export default function Analytics() {
  const ranges = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 3 months", "All Time"];
  const [activeRange, setActiveRange] = useState("Last 24 Hrs");
  const [usersJoined, setUsersJoined] = useState(500);
  const [tasksCompleted, setTasksCompleted] = useState(400);
  const [totalTransactions, setTotalTransactions] = useState(100);

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
       {card.rate !== null && card.rate !== undefined ? (
         <div className="flex items-center gap-1 text-xs">
           <img src="/rate.png" alt="" className="w-5 h-3" />
           <span className={card.rate >= 0 ? "text-[#00E1A2]" : "text-red-500"}>
             {card.rate >= 0 ? "+" : ""}
             {card.rate.toFixed(1)}% {card.description}
           </span>
         </div>
       ) : (
         <div className="text-xs text-white/50">{card.description}</div>
       )}
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
         <div className="relative w-36 h-36">
           <ResponsivePie
             data={[
               { id: 'Tasks Completed', value: Math.min(tasksCompleted, usersJoined) },
               { id: 'Users Not Completed', value: Math.max(usersJoined - tasksCompleted, 0) },
             ]}
             margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
             innerRadius={0.7}
             padAngle={0.7}
             cornerRadius={3}
             activeOuterRadiusOffset={8}
             colors={["#00E1A2", "#FFFFFF"]}
             borderWidth={1}
             borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
             enableArcLinkLabels={false}
             enableArcLabels={false}
             animate={true}
             theme={{
               tooltip: {
                 container: {
                   background: '#333333',
                   color: '#FFFFFF',
                   fontSize: '12px',
                   padding: '6px 10px',
                   borderRadius: '6px',
                 },
               },
             }}
           />

           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <p className="text-white font-bold text-xl">
               {usersJoined === 0
                 ? 0
                 : ((Math.min(tasksCompleted, usersJoined) / usersJoined) * 100).toFixed(2)}%
             </p>
             <span className="text-white text-xs">Completion</span>
           </div>
         </div>

 {/* Capsules container */}
 <div className="flex flex-col gap-3 flex-1 ml-6">
   {/* Joined capsule */}
   <div
     className="flex items-center justify-between px-4 py-2 rounded-full border"
     style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
   >
     <div className="flex items-center gap-2">
       <div className="w-3 h-3 rounded-full bg-white"></div>
       <span className="text-xs font-semibold uppercase">Joined</span>
     </div>
     <span className="text-sm font-bold">{usersJoined}</span>
   </div>

 {/* Completed capsule */}
 <div
   className="flex items-center justify-between px-4 py-2 rounded-full border"
   style={{ borderColor: "#FFFFFF66", backgroundColor: "#632DBB" }}
 >
   <div className="flex items-center gap-2">
     <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
     <span className="text-xs font-semibold uppercase">Completed</span>
   </div>
   <span className="text-sm font-bold ml-2">{tasksCompleted}</span>
 </div>
   </div>
 </div>

 {/* Drop-off text */}
 <div className="mt-4 text-white/70 text-sm">
   {usersJoined
     ? `${Math.round(((usersJoined - tasksCompleted) / usersJoined) * 100)}% of users drop before completion`
     : "0% of users drop before completion"}
 </div>

   {/* Container with JOINED/COMPLETED legend */}
   <div className="mt-2 p-2 rounded-3xl border flex flex-col gap-2"
        style={{ borderColor: "#D4BBFF4D", backgroundColor: "#632DBB" }}>
    
     {/* Joined legend */}
     <div className="flex items-center gap-2">
       <div className="w-3 h-3 rounded-full bg-white"></div>
       <span className="text-white text-[10px]">JOINED: Total users who joined a quest, campaign & lesson</span>
     </div>

     {/* Completed legend */}
     <div className="flex items-center gap-2">
       <div className="w-3 h-3 rounded-full bg-[#00E1A2]"></div>
       <span className="text-white text-[10px]">COMPLETED: Total users who completed a quest, campaign & lesson</span>
     </div>
   </div>
 </div>

   {/* Middle Card B */}
 <div className="col-span-5 row-span-2 p-2 rounded-3xl flex flex-col border"
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
 <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginTop: "-1rem" }}>
   <div style={{ width: "100%", height: "12rem", marginLeft: "auto", cursor: "pointer", transform: "translateY(70px)" }}>
 <ResponsivePie
   data={transactionsData}
   margin={{ top: 20, right: 64, bottom: 20, left: 87 }}
   innerRadius={0}
   padAngle={0.7}
   cornerRadius={3}
   activeOuterRadiusOffset={8}
   colors={(d) => d.data.color}
   borderWidth={1}
   borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
  
   enableArcLinkLabels={true}
   arcLinkLabelsTextColor={(d) => d.data.color}
   arcLinkLabelsThickness={2}
   arcLinkLabelsColor={{ from: "color" }}
   arcLinkLabelsStraightLength={20}
   arcLinkLabelsDiagonalLength={15}
   arcLinkLabelsSkipAngle={3}
   arcLinkLabelsTextOffset={5}
   arcLinkLabelsText={(d) => `${d.id} (${Math.round((d.value / totalTransactions) * 100)}%)`}
   enableArcLabels={false}

   tooltip={({ datum }) => (
     <div className="bg-black text-white px-2 py-1 rounded text-xs">
       {datum.id}: {datum.value} ({((datum.value / totalTransactions) * 100).toFixed(1)}%)
     </div>
   )}
 />
   </div>

 <div
   style={{
     marginTop: "2rem", 
     marginLeft: "",
     marginRight: "",
     maxWidth: "100%",
   }}
 >
   <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
     <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
       {totalTransactions}
     </div>
     <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
       TRANSACTIONS
     </div>
   </div>

   <div
     style={{
       display: "flex",
       flexDirection: "column",
       gap: "0.5rem",
       padding: "0.75rem",
       borderRadius: "0.75rem",
       border: "1px solid rgba(212,187,255,0.3)",
       backgroundColor: "transparent",
     }}
   >
     {transactionsData.map((t) => (
       <div
         key={t.id}
         style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
       >
         <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
           <div
             style={{
               width: "0.75rem",
               height: "0.75rem",
               borderRadius: "50%",
               border: "1px solid #fff",
               backgroundColor: t.color,
             }}
           ></div>
           <span
             style={{
               fontSize: "0.7rem",
               fontWeight: 600,
               color: "rgba(255,255,255,0.8)",
               textTransform: "uppercase",
             }}
           >
             {t.id}
           </span>
         </div>
         <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: "rgba(255,255,255,0.8)" }}>
           {t.value}
         </span>
       </div>
     ))}
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
     <span className="text-xl font-bold text-white">{formatNumber(8000.03)}</span>
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
     <span className="text-xl font-bold text-white">{formatNumber(1550)}</span>
   </div>
 </div>

 {/* CARD E  */}
 <div className="bg-[#170F1F] rounded-3xl p-4 flex flex-col justify-between border"
      style={{ borderColor: "#D4BBFF66" }}>
  
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
