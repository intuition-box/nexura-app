"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import StudioSidebar from "../../pages/studio/StudioSidebar";
import { Card } from "../ui/card";

export default function MyCampaign() {
  const [location, setLocation] = useLocation();
  const [campaign, setCampaign] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const selected = localStorage.getItem("selectedCampaign");
    if (selected) {
      const parsed = JSON.parse(selected);
      setCampaign(parsed);
      setTasks(parsed.tasks || []);
    }
  }, []);

  const formatDateRange = (start: string, end: string) => {
  const startD = new Date(start);
  const endD = new Date(end);

  const startDay = startD.getDate();
  const startMonth = startD.toLocaleString("en-GB", { month: "short" });

  const endDay = endD.getDate();
  const endMonth = endD.toLocaleString("en-GB", { month: "short" });

  const year = startD.getFullYear();

  // If same year, shorten format
  if (startD.getFullYear() === endD.getFullYear()) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth}, ${year}`;
  }

  // Different years, fallback to full format
  return `${startDay} ${startMonth}, ${startD.getFullYear()} – ${endDay} ${endMonth}, ${endD.getFullYear()}`;
};


  if (!campaign) return <p className="text-white/60 p-6">No campaign selected.</p>;

  const {
    title,
    name,
    coverImage,
    startDate,
    endDate,
    rewardPool,
    participants,
  } = campaign;

  return (
    <div className="relative min-h-screen flex">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen flex">
        <StudioSidebar
          activeTab="campaignsTab"
          setActiveTab={(tab) => {
            if (tab === "campaignSubmissions") setLocation("/studio-dashboard");
            if (tab === "campaignsTab") setLocation("/studio-dashboard/create-new-campaign");
            if (tab === "adminManagement") setLocation("/studio-dashboard");
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-[18rem] p-6 space-y-6">

{/* Top Row: Campaign Title + Buttons */}
<div className="flex justify-between items-center pr-4 mb-6 border-b border-purple-500/50 pb-3">
  {/* Left side: Back Button + Title + Duration + Active */}
  <div className="flex items-center gap-4">
    {/* Back Button */}
    <button
      onClick={() => setLocation("/studio-dashboard/campaigns-tab")}
      className=""
    >
      <img src="/back-button.png" alt="Back" className="w-12 h-12 object-contain" />
    </button>

    {/* Title + Duration */}
    <div className="flex flex-col">
      <h3 className="text-2xl font-bold text-white">{title || "Untitled Campaign"}</h3>

      {/* Dates with calendar icon */}
      <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
        <img src="/calendar.png" alt="Calendar" className="w-4 h-4" />
        <span>
          {startDate && endDate
            ? formatDateRange(startDate, endDate)
            : "Dates not set"}
        </span>
      </div>
    </div>

    {/* Active Status Button */}
    <button className="">
      <img src="/active.png" alt="Active" className="w-12 h-12 object-contain" />
    </button>
  </div>

  {/* Right side: Pause + Edit */}
  <div className="flex items-center gap-3">
    <button className="">
      <img src="/pause.png" alt="Pause" className="w-18 h-8 object-contain" />
    </button>

    <button
      onClick={() => setLocation("/studio-dashboard/create-new-campaign")}
    >
      <img src="/edit-campaign.png" alt="Edit Campaign" className="w-18 h-8 object-contain" />
    </button>
  </div>
</div>

{/* Three Horizontal Cards */}
<div className="flex gap-6 mt-6">
  {/* Card 1 */}
  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
    <img src="/ref-icon.png" alt="Icon 1" className="w-10 h-10 object-contain" />
    <div className="flex flex-col">
      <h4 className="text-lg font-semibold text-white">Total Participants</h4>
      <p className="text-white/70 text-xl">
        5
      </p>
    </div>
  </div>

  {/* Card 2 */}
  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
    <img src="/approved.png" alt="Icon 2" className="w-10 h-10 object-contain" />
    <div className="flex flex-col">
      <h4 className="text-lg font-semibold text-white">Total Tasks Completed</h4>
      <p className="text-white/70 text-xl">
        3
      </p>
    </div>
  </div>

  {/* Card 3 */}
  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-start gap-4 border-2 border-white">
    <img src="/intuition-icon.png" alt="Icon 3" className="w-10 h-10 object-contain" />
    <div className="flex flex-col">
      <h4 className="text-lg font-semibold text-white">Rewards Distributed</h4>
      <p className="text-white/70 text-xl">
        50,000 TRUST
      </p>
    </div>
  </div>
</div>


          {/* Task Overview */}
          <div className="flex items-center justify-between mt-6">
            <h3 className="text-xl font-semibold text-white">Task Overview</h3>
            <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition">
              Manage Tasks
            </button>
          </div>

        <Card className="p-8 space-y-6 bg-white/10 backdrop-blur-md">
          {tasks.length > 0 && (
            <div className="relative mt-2 space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between gap-4 rounded-lg border-2 border-purple-500 px-4 py-3 bg-white/5">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full text-white font-semibold">{index + 1}</div>
                  <p className="flex-1 text-white">{task.type}</p>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                      onClick={() => {
                        if (!task.handleOrUrl) return;
                        let url = task.handleOrUrl.trim();
                        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
                        window.open(url, "_blank");
                      }}
                    >
                      View
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}

              {/* Task counter */}
              <span className="absolute -bottom-8 right-2 text-white/60 text-sm mt-2">
                {tasks.length}/{tasks.length}
              </span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
              onClick={() => setLocation("/studio-dashboard")}
            >
              Back
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition">
              Save
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
