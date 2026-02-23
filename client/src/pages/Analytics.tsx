"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import AnimatedBackground from "../components/AnimatedBackground";
import { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import DesktopCards from "../components/DesktopCard.tsx";
import MobileCards from "../components/MobileCards.tsx";

const GRAPH_RANGES = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "all", label: "All Time" },
];

export default function Analytics() {
  const [graphRange, setGraphRange] = useState("24h");
  const [graphData, setGraphData] = useState<{ x: string; y: number }[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [activeUsersRange, setActiveUsersRange] = useState("Weekly");
  const [activeUsers, setActiveUsers] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [usersJoined, setUsersJoined] = useState(501);
  const [tasksCompleted, setTasksCompleted] = useState(500);
  const graphDataWithZero = [{ x: graphData[0]?.x || "", y: 0 }, ...graphData];


  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

useEffect(() => {
  const { data, totalUsers, newUsers, activeUsers } = calculateTotals(graphRange);
  setGraphData(data);
  setTotalUsers(totalUsers);
  setNewUsers(newUsers);
}, [graphRange]);

  const MOCK_GRAPH_DATA = {
  "24h": [
    { x: "00:00", y: 4 },
    { x: "02:00", y: 6 },
    { x: "04:00", y: 3 },
    { x: "06:00", y: 5 },
    { x: "08:00", y: 12 },
    { x: "10:00", y: 18 },
    { x: "12:00", y: 15 },
    { x: "14:00", y: 9 },
    { x: "16:00", y: 11 },
    { x: "18:00", y: 14 },
    { x: "20:00", y: 10 },
    { x: "22:00", y: 8 },
  ],
  "7d": [
    { x: "Mon", y: 45 },
    { x: "Tue", y: 52 },
    { x: "Wed", y: 48 },
    { x: "Thu", y: 61 },
    { x: "Fri", y: 57 },
    { x: "Sat", y: 72 },
    { x: "Sun", y: 64 },
  ],
  "30d": [
    { x: "Week 1", y: 310 },
    { x: "Week 2", y: 355 },
    { x: "Week 3", y: 330 },
    { x: "Week 4", y: 390 },
  ],
  "6m": [
    { x: "Month 1", y: 1200 },
    { x: "Month 2", y: 1450 },
    { x: "Month 3", y: 1680 },
    { x: "Month 4", y: 1900 },
    { x: "Month 5", y: 2150 },
    { x: "Month 6", y: 2400 },
  ],
  "all": [
    { x: "2021", y: 3200 },
    { x: "2022", y: 5100 },
    { x: "2023", y: 7800 },
    { x: "2024", y: 11200 },
    { x: "2025", y: 15400 },
  ],
};

const calculateTotals = (range: string) => {
  const data = MOCK_GRAPH_DATA[range] || [];
  const totalUsers = Object.values(MOCK_GRAPH_DATA).flat().reduce((acc, d) => acc + d.y, 0);
  const newUsers = data.at(-1)?.y || 0;
  const activeUsers = Math.floor(totalUsers * 0.5); // mock active users
  return { data, totalUsers, newUsers, activeUsers };
};

const ACTIVE_USERS_MAP: Record<string, string> = {
  Weekly: "7d",
  Monthly: "30d",
};

useEffect(() => {
  const rangeKey = ACTIVE_USERS_MAP[activeUsersRange] || "7d";
  const data = MOCK_GRAPH_DATA[rangeKey] || [];
  setActiveUsers(data.at(-1)?.y || 0);
}, [activeUsersRange]);



  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10 space-y-2">
        <div className="py-4 sm:py-12 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4 animate-slide-up">
            Platform Performance Metrics
          </h1>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-12">

          {/* Total Users */}
            <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-1 animate-slide-up delay-200 flex flex-col">
            <CardHeader className="p-0">
              <CardTitle className="text-lg sm:text-xl font-bold text-white mb-2">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-auto">
              <div className="flex items-center w-full">
              <p className="text-4xl sm:text-5xl font-semibold text-white">{totalUsers}
              </p>
              <img src="/ref-icon.png" alt="Ref Icon" className="w-10 h-10 ml-auto" />
              </div>
            </CardContent>
          </Card>


          {/* New Users */}
            <Card className="
  glass glass-hover
  rounded-2xl sm:rounded-3xl
  p-4 sm:p-6
  flex flex-col
  min-h-[160px] sm:min-h-[200px]
  animate-slide-up delay-300
">
            <CardHeader className="grid grid-cols-2 items-center mb-2 p-0 w-full">
              <CardTitle className="text-lg sm:text-xl font-bold text-white">New Users</CardTitle>
              <div className="flex gap-2 justify-end items-center bg-white/10 rounded-lg p-1">
                {GRAPH_RANGES.slice(0, 3).map((r) => (
                  <button
                    key={r.value}
                    className={`px-2 py-1 rounded-lg text-sm font-medium ${
                      graphRange === r.value ? "bg-primary text-black" : "text-white"
                    }`}
                    onClick={() => setGraphRange(r.value)}
                  >
                    {r.value}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex items-end">
              <div className="flex items-center gap-2 w-full">
              <p className="text-4xl sm:text-5xl font-semibold">{newUsers}</p>
              <img src="/ref-icon.png" alt="Ref Icon" className="w-10 h-10 ml-auto" />
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex-1 animate-slide-up delay-400">
            <CardHeader className="grid grid-cols-2 items-center mb-2 p-0 w-full">
              <CardTitle className="text-lg sm:text-xl font-bold text-white">Active Users</CardTitle>
              <div className="flex gap-2 justify-end items-center bg-white/10 rounded-lg p-1 -ml-3">
    {["Weekly", "Monthly"].map((range) => (
      <button
        key={range}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${
          activeUsersRange === range ? "bg-primary text-black" : "text-white"
        }`}
        onClick={() => setActiveUsersRange(range)}
      >
        {range}
      </button>
    ))}
    </div>
            </CardHeader>
            <CardContent className="p-0 mt-10">
              <div className="flex items-center w-full">
              <p className="text-4xl sm:text-5xl font-semibold text-white mt-8">{activeUsers}
              </p>
              <img src="/graph-icon-1.png" alt="Graph Icon" className="w-48 h-24 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="
  relative
  glass
  glass-hover
  rounded-3xl
  p-6 sm:p-8
  animate-slide-up
  mt-8 mb-12
  border
  border-white/20
  shadow-[0_10px_30px_rgba(212,11,239,0.3)]
  hover:shadow-[0_15px_40px_rgba(212,11,239,0.5)]
  backdrop-blur-md
">
  <CardHeader className="relative w-full mb-6 p-0">
    {/* Title + Subtitle */}
    <div className="flex flex-col items-start gap-1">
      <CardTitle className="text-xl sm:text-2xl font-bold text-white tracking-wide">
        New User Growth Trend
      </CardTitle>
      <p className="text-sm sm:text-base text-white/80">
        {graphRange === "24h"
          ? "Daily Trajectory over last 24 hours"
          : graphRange === "7d"
          ? "Daily Trajectory over last 7 days"
          : graphRange === "30d"
          ? "Daily Trajectory over last 30 days"
          : graphRange === "6m"
          ? "Daily Trajectory over last 6 months"
          : "Daily Trajectory for all time"
        }
      </p>
    </div>

    {/* Trend Icon */}
    <div className="absolute top-0 right-0 w-14 h-14 sm:w-16 sm:h-16">
      <div className="relative w-full h-full">
        <img
          src="/trend-icon.png"
          alt="Trend Icon"
          className="w-full h-full opacity-80"
        />
        <span className="
          absolute inset-0
          flex items-center justify-center
          text-sm sm:text-base
          font-bold text-white
        ">
          {newUsers}
        </span>
      </div>
    </div>

    {/* Dropdown Centered */}
    <div className="absolute left-1/2 top-0 -translate-x-1/2 hidden sm:block">
      <div className="relative">
        <select
          value={graphRange}
          onChange={(e) => setGraphRange(e.target.value)}
          className="
            w-52 sm:w-60
            bg-white/10 backdrop-blur-md
            text-white font-medium
            rounded-lg p-2 pr-10
            text-sm sm:text-base
            appearance-none focus:outline-none
            text-center
          "
        >
          {[
            { value: "24h", label: "Last 24 Hours" },
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
            { value: "6m", label: "Last 6 Months" },
            { value: "all", label: "All Time" },
          ].map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    <div className="w-full h-64 sm:h-96 relative">
      <ResponsiveLine
        data={[{ id: "Users", data: graphDataWithZero }]}
        margin={isDesktop ? { top: 20, right: 40, bottom: 50, left: 60 } : { top: 20, right: 20, bottom: 50, left: 50 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        curve={graphRange === "24h" ? "linear" : "monotoneX"}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: graphRange === "24h" ? -45 : 0,
          legend: "Time",
          legendOffset: 36,
          legendPosition: "middle",
          tickColor: "#FFFFFF",
          legendTextColor: "#FFFFFF"
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Users",
          legendOffset: -50,
          legendPosition: "middle",
          tickColor: "#FFFFFF",
          legendTextColor: "#FFFFFF"
        }}
        enableGridX={false}
        enableGridY={true}
        enablePoints={true}
        pointSize={8}
        pointColor="#FFFFFF"
        pointBorderWidth={2}
        pointBorderColor="#1f1f1f"
        enableArea={true}
        areaOpacity={0.3}
        colors={["rgba(212, 11, 239, 0.97)"]}
        lineWidth={3}
        useMesh={true}
        animate={true}
        motionConfig="gentle"
        tooltip={({ point }) => (
          <div className="bg-white text-black px-2 py-1 rounded shadow">
            {point.data.x}: {point.data.y} users
          </div>
        )}
        colors={['#FFFFFF']}     // line is white
  lineWidth={2}            // optional, thicker line
  useMesh={true}

  tooltip={({ point }) => (
    <div className="bg-black/90 text-white px-2 py-1 rounded-md text-xs">
      {point.data.x}: {point.data.y}
    </div>
  )}

  animate={true}
  motionConfig="gentle"

  theme={{
    axis: {
      ticks: { text: { fill: '#FFFFFF' } },
      legend: { text: { fill: '#FFFFFF' } },
    },
    tooltip: {
      container: {
        background: '#000000',
        color: '#FFFFFF',
        fontSize: '12px',
      },
    },
  }}
      />
    </div>
  </CardContent>
</Card>


        {isDesktop ? (
  <DesktopCards usersJoined={usersJoined} tasksCompleted={tasksCompleted} />
) : (
  <MobileCards usersJoined={usersJoined} tasksCompleted={tasksCompleted} />
)}
      </div>
    </div>
  );
}
