"use client";

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Link, useLocation } from "wouter";
import StudioSidebar from "../../pages/studio/StudioSidebar";

interface Campaign {
  title: string;
  name: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  isDraft?: boolean;
  rewardPool?: string;
}

export default function CampaignsTab() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "drafts" | "completed">("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [location, setLocation] = useLocation();

  // Load campaigns from localStorage
  const loadCampaigns = () => {
    const savedCampaigns = JSON.parse(localStorage.getItem("campaigns") || "[]");
    setCampaigns(savedCampaigns);
  };

  useEffect(() => {
    loadCampaigns();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "campaigns") loadCampaigns();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return new Date(c.endDate) > new Date();
    if (activeTab === "completed") return new Date(c.endDate) <= new Date();
    if (activeTab === "drafts") return c.isDraft;
    return true;
  });

  const tabs = [
    { id: "all", label: "All Campaigns", count: campaigns.length },
    { id: "active", label: "Active", count: campaigns.filter(c => new Date(c.endDate) > new Date()).length },
    { id: "drafts", label: "Drafts", count: campaigns.filter(c => c.isDraft).length },
    { id: "completed", label: "Completed", count: campaigns.filter(c => new Date(c.endDate) <= new Date()).length },
  ];

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const now = new Date();
    let status = "Published";
    let statusColor = "bg-green-500";

    if (campaign.isDraft) {
      status = "Draft";
      statusColor = "bg-yellow-500";
    } else if (new Date(campaign.endDate) <= now) {
      status = "Completed";
      statusColor = "bg-gray-500";
    }

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
      <Card className="w-72 bg-gray-900 text-white rounded-2xl overflow-hidden shadow-lg flex flex-col">
        {campaign.coverImage ? (
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
            <span className="text-white/50 text-sm">No Image</span>
          </div>
        )}

        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-bold text-lg">{campaign.title}</h3>
          <p className="text-white/70 text-sm">
            {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
          </p>
          {status === "Published" && !campaign.isDraft && (
            <p className="text-purple-400 font-medium">
              Reward Pool: {campaign.rewardPool || "N/A"} TRUST
            </p>
          )}
          <button
  className="mt-2 px-4 py-2 text-sm bg-purple-600 rounded-lg hover:bg-purple-700 transition"
  onClick={() => {
    // Save the selected campaign in localStorage so MyCampaign page can load it
    localStorage.setItem("selectedCampaign", JSON.stringify(campaign));
    // Navigate to the MyCampaign page
    setLocation("/studio-dashboard/my-campaign");
  }}
>
  View Details
</button>

          <span className={`px-2 py-1 text-xs rounded mt-2 self-start ${statusColor}`}>
            {status}
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Fixed Sidebar */}
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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Nexura Studio</h1>
          <p className="text-white/60 text-lg">
            Track and manage your community engagement campaigns
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 gap-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-purple-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* "Create New Campaign" Card (only on "all" tab) */}
  {activeTab === "all" && (
    <Link
      href="/studio-dashboard/create-new-campaign"
      className="w-full p-6 flex flex-col items-center justify-center gap-3
                 border-2 border-dashed border-purple-500 rounded-2xl
                 bg-white/10 backdrop-blur-md hover:bg-white/15 hover:border-purple-400
                 transition cursor-pointer no-underline"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full
                      bg-purple-500/20 text-purple-400 text-2xl font-bold">
        +
      </div>
      <p className="font-semibold text-white text-center text-lg">
        Create New Campaign
      </p>
      <p className="text-white/60 text-center text-sm">
        Launch a New Campaign now
      </p>
    </Link>
  )}

  {/* Actual Campaign Cards */}
  {filteredCampaigns.length === 0 ? (
    <p className="text-white/60 col-span-full">No campaigns.</p>
  ) : (
    filteredCampaigns.map((c) => <CampaignCard key={c.title} campaign={c} />)
  )}
</div>


        {/* Floating Subscription Badge */}
        <div
          className="fixed bottom-6 right-6 bg-purple-600/90 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm cursor-move hover:shadow-2xl hover:bg-purple-500 transition"
          draggable
          onDragStart={(e) => {
            const style = window.getComputedStyle(e.currentTarget, null);
            const str = (parseInt(style.getPropertyValue("left"), 10) - e.clientX) + ',' + 
                        (parseInt(style.getPropertyValue("top"), 10) - e.clientY);
            e.dataTransfer.setData("text/plain", str);
          }}
          onDragEnd={(e) => {
            const badge = e.currentTarget;
            badge.style.left = `${e.clientX}px`;
            badge.style.top = `${e.clientY}px`;
          }}
        >
          Subscription ends in 240 days
        </div>
      </div>
    </div>
  );
}
