"use client";

import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Zap, Calendar, Users, Shield, LayoutDashboard, Search, Bell, Plus, RefreshCw, Check, X, Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

// Mock data for quest submissions
const MOCK_QUEST_SUBMISSIONS = [
  {
    id: "q1",
    questName: "Social Media Engagement",
    username: "Rchris",
    submissionLink: "https://twitter.com/example/status/123",
    dateSubmitted: "2026-01-19",
    status: "pending",
    validatedBy: "-",
  },
  {
    id: "q2",
    questName: "Discord Community Task",
    username: "Nuel",
    submissionLink: "https://discord.gg/verification",
    dateSubmitted: "2026-01-18",
    status: "pending",
    validatedBy: "-",
  },
  {
    id: "q3",
    questName: "Content Creation Challenge",
    username: "Orion",
    submissionLink: "https://medium.com/@user/article",
    dateSubmitted: "2026-01-17",
    status: "pending",
    validatedBy: "-",
  },
];

// Mock data for campaign submissions
const MOCK_CAMPAIGN_SUBMISSIONS = [
  {
    id: "c1",
    campaignName: "Launch Campaign Q1",
    username: "Promise",
    submissionLink: "https://github.com/user/project",
    dateSubmitted: "2026-01-19",
    status: "pending",
    validatedBy: "-",
  },
  {
    id: "c2",
    campaignName: "NFT Minting Event",
    username: "Beardless",
    submissionLink: "https://opensea.io/collection/example",
    dateSubmitted: "2026-01-18",
    status: "pending",
    validatedBy: "-",
  },
  {
    id: "c3",
    campaignName: "DeFi Integration Challenge",
    username: "Shebah",
    submissionLink: "https://etherscan.io/tx/0x123",
    dateSubmitted: "2026-01-17",
    status: "pending",
    validatedBy: "-",
  },
];

// Mock data for administrators
const MOCK_ADMINS = [
  {
    id: "a1",
    name: "RChris",
    role: "Super Admin",
    lastActivity: "2026-01-20 14:30",
    status: "active",
  },
  {
    id: "a2",
    name: "Nuel",
    role: "Moderator",
    lastActivity: "2026-01-20 12:15",
    status: "active",
  },
  {
    id: "a3",
    name: "Promise",
    role: "Reviewer",
    lastActivity: "2026-01-19 18:45",
    status: "inactive",
  },
  {
    id: "a4",
    name: "Orion",
    role: "Content Manager",
    lastActivity: "2026-01-20 09:00",
    status: "active",
  },
];

import { AddAdminModal } from "../components/AddAdminModal";

type TabType = "questSubmissions" | "campaignSubmissions" | "adminManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("questSubmissions");
  const [viewedSubmissions, setViewedSubmissions] = useState<Set<string>>(new Set());

  const handleView = (id: string, link: string) => {
    window.open(link, "_blank");
    setViewedSubmissions((prev) => new Set(prev).add(id));
  };

  const handleAction = (id: string, action: "accept" | "reject") => {
    console.log(`${action} submission ${id}`);
    // In a real app, this would call an API
  };

  const StatsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
        <div className="flex flex-col relative z-10">
          <span className="text-white/60 text-sm font-medium">Total Pending Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-white">24</span>
            <span className="text-yellow-400 text-xs font-medium">+12% from yesterday</span>
          </div>
        </div>
        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 text-yellow-500/10 group-hover:text-yellow-500/20 transition-colors" />
      </Card>
      
      <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
        <div className="flex flex-col relative z-10">
          <span className="text-white/60 text-sm font-medium">Approved Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-white">156</span>
            <span className="text-green-400 text-xs font-medium">+8% from yesterday</span>
          </div>
        </div>
        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 text-green-500/10 group-hover:text-green-500/20 transition-colors" />
      </Card>
      
      <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6 relative overflow-hidden group hover:bg-white/10 transition-colors">
        <div className="flex flex-col relative z-10">
          <span className="text-white/60 text-sm font-medium">Rejected Today</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-white">12</span>
            <span className="text-red-400 text-xs font-medium">-2% from yesterday</span>
          </div>
        </div>
        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </Card>
    </div>
  );

  const renderQuestSubmissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Quest Submissions</h2>
        <Button size="icon" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
           <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
      <Card className="bg-white/5 border-white/10 backdrop-blur-[125px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/70">User</TableHead>
              <TableHead className="text-white/70">Task Type</TableHead>
              <TableHead className="text-white/70">Submission Date</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70">Validated By</TableHead>
              <TableHead className="text-white/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_QUEST_SUBMISSIONS.map((submission) => (
              <TableRow key={submission.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white/80">{submission.username}</TableCell>
                <TableCell className="font-medium text-white">
                  {submission.questName}
                </TableCell>
                <TableCell className="text-white/80">{submission.dateSubmitted}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  >
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/80">{submission.validatedBy}</TableCell>
                <TableCell className="text-right">
                  {!viewedSubmissions.has(submission.id) ? (
                    <Button
                      size="sm"
                      onClick={() => handleView(submission.id, submission.submissionLink)}
                      className="bg-gradient-to-r from-[#8a3ffc] to-[#522696] shadow-[0px_4px_3px_-3px_#7e39e6] rounded-full text-white px-6 hover:opacity-90 transition-opacity"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                       <Button
                          size="sm"
                          onClick={() => handleAction(submission.id, "accept")}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border border-green-500/50 rounded-full"
                       >
                          <Check className="w-4 h-4 mr-1" /> Accept
                       </Button>
                       <Button
                          size="sm"
                          onClick={() => handleAction(submission.id, "reject")}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/50 rounded-full"
                       >
                          <X className="w-4 h-4 mr-1" /> Reject
                       </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderCampaignSubmissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Campaign Submissions</h2>
        <Button size="icon" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
           <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
      <Card className="bg-white/5 border-white/10 backdrop-blur-[125px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/70">User</TableHead>
              <TableHead className="text-white/70">Task Type</TableHead>
              <TableHead className="text-white/70">Submission Date</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70">Validated By</TableHead>
              <TableHead className="text-white/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_CAMPAIGN_SUBMISSIONS.map((submission) => (
              <TableRow key={submission.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white/80">{submission.username}</TableCell>
                <TableCell className="font-medium text-white">
                  {submission.campaignName}
                </TableCell>
                <TableCell className="text-white/80">{submission.dateSubmitted}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  >
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/80">{submission.validatedBy}</TableCell>
                <TableCell className="text-right">
                  {!viewedSubmissions.has(submission.id) ? (
                    <Button
                      size="sm"
                      onClick={() => handleView(submission.id, submission.submissionLink)}
                      className="bg-gradient-to-r from-[#8a3ffc] to-[#522696] shadow-[0px_4px_3px_-3px_#7e39e6] rounded-full text-white px-6 hover:opacity-90 transition-opacity"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                       <Button
                          size="sm"
                          onClick={() => handleAction(submission.id, "accept")}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border border-green-500/50 rounded-full"
                       >
                          <Check className="w-4 h-4 mr-1" /> Accept
                       </Button>
                       <Button
                          size="sm"
                          onClick={() => handleAction(submission.id, "reject")}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/50 rounded-full"
                       >
                          <X className="w-4 h-4 mr-1" /> Reject
                       </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderAdminManagement = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-white">Administrator Management</h2>
      <Card className="bg-white/5 border-white/10 backdrop-blur-[125px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/70">Administrator</TableHead>
              <TableHead className="text-white/70">Role</TableHead>
              <TableHead className="text-white/70">Last Activity</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ADMINS.map((admin) => (
              <TableRow key={admin.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-white">{admin.name}</TableCell>
                <TableCell className="text-white/80">{admin.role}</TableCell>
                <TableCell className="text-white/80">{admin.lastActivity}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      admin.status === "active"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }
                  >
                    {admin.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const sidebarItems = [
    { title: "Quest Tasks", icon: Zap, id: "questSubmissions" as TabType },
    { title: "Campaign Tasks", icon: Calendar, id: "campaignSubmissions" as TabType },
    { title: "Admin Management", icon: Shield, id: "adminManagement" as TabType },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      <div className="relative z-10 flex h-screen">
        {/* Left Navigation Sidebar - Styled to match Figma/QuestflowSidebar */}
        <div className="w-[18rem] border-r border-white/10 bg-black/55 backdrop-blur-sm flex flex-col z-20">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center mb-4">
              <img src="/nexura-logo.png" alt="Nexura" className="w-40 h-auto" />
            </div>
            <div className="flex items-center gap-2 px-1">
               <LayoutDashboard className="w-4 h-4 text-[#8a3ffc]" />
               <h1 className="text-sm font-semibold text-white tracking-tight">Admin Console</h1>
            </div>
          </div>

          <nav className="flex-1 py-4 px-2 space-y-1">
             {sidebarItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                   activeTab === item.id 
                     ? "text-[#8a3ffc] bg-white/5" 
                     : "text-white/70 hover:bg-white/5 hover:text-white"
                 )}
               >
                 <item.icon className={cn(
                   "w-5 h-5 transition-colors",
                   activeTab === item.id ? "text-[#8a3ffc]" : "text-white/70 group-hover:text-white"
                 )} />
                 {item.title}
               </button>
             ))}
          </nav>
          
          <div className="p-4 border-t border-white/10">
             <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold">
                   A
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-medium text-white">Administrator</span>
                   <span className="text-xs text-white/50">Online</span>
                </div>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-sm bg-black/20">
               <div className="flex items-center gap-4 flex-1">
                 <h2 className="text-lg font-semibold text-white whitespace-nowrap min-w-[200px]">
                    {activeTab === "questSubmissions" && "Quest Task Overview"}
                    {activeTab === "campaignSubmissions" && "Campaign Task Overview"}
                    {activeTab === "adminManagement" && "User Administration"}
                 </h2>
                 <div className="relative max-w-md w-full ml-4">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                   <Input 
                     placeholder="Search user or wallet address..." 
                     className="bg-white/5 border-white/10 text-white pl-9 placeholder:text-white/30 focus-visible:ring-[#8a3ffc]"
                   />
                 </div>
               </div>
               <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                  </Button>
                  <AddAdminModal>
                    <Button 
                        variant="outline" 
                        className="border-[#8a3ffc] text-[#8a3ffc] hover:bg-[#8a3ffc] hover:text-white gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Admin
                    </Button>
                  </AddAdminModal>
                  <div className="h-6 w-px bg-white/10 mx-2" />
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">Help</Button>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-7xl mx-auto">
                    {activeTab !== "adminManagement" && <StatsOverview />}
                    {activeTab === "questSubmissions" && renderQuestSubmissions()}
                    {activeTab === "campaignSubmissions" && renderCampaignSubmissions()}
                    {activeTab === "adminManagement" && renderAdminManagement()}
                </div>
            </main>
        </div>
      </div>
    </div>
  );
}
