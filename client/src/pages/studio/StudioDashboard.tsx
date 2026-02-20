"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import AnimatedBackground from "../../components/AnimatedBackground.tsx";
import StudioSidebar from "./StudioSidebar";
import { AddAdminModal } from "../../components/AddAdminModal";
import { ManageAdminModal } from "../../components/ManageAdminModal";
import { apiRequest } from "../../lib/config.ts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import { getStoredAdminInfo } from "../../lib/config.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Zap, Calendar, Shield, LayoutDashboard, Search, Bell, Plus, RefreshCw, Check, X, Eye, Clock, CheckCircle2, XCircle, Menu, ChevronDown, Users, FileText } from "lucide-react";
import { StatsOverview } from "../../components/admin/StatsOverview";
import CampaignSubmissions from "../../components/admin/CampaignSubmissions";
import { TASKS } from "../../types/admin";
import AdminManagement, { AdminType as Admin } from "../../components/admin/AdminManagement";
import CampaignsTab from "../../components/admin/CampaignsTab.tsx";
import CreateNewCampaigns from "../../components/admin/CreateNewCampaign.tsx";
interface StudioDashboardProps {
  onLogout: () => void;
}


type BannedUser = {
  _id: string;
  walletAddress: string;
  username: string; 
  bannedAt: string;
}

type TabType = "campaignSubmissions" | "adminManagement" | "campaignsTab";

export default function StudioDashboard({ onLogout }: StudioDashboardProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("campaignSubmissions");
  const [viewedSubmissions, setViewedSubmissions] = useState<Set<string>>(new Set());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
const [campaignTasks, setCampaignTasks] = useState<TASKS[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TASKS | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ message?: string; pendingTasks?: TASKS[] }>({ endpoint: "/api/admin/get-campaigns", method: "GET" });
      const pendingTasks = res?.pendingTasks ?? [];

      const pendingcampaignTasks = pendingTasks.filter((task) => task.page === "campaign");

      setCampaignTasks(pendingcampaignTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      // No fallback data for production - API must be available
      setCampaignTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const res = await apiRequest<{ message?: string; admins?: Admin[] }>({ endpoint: "/api/admin/get-admins", method: "GET" });
      const adminList = res?.admins ?? [];
      setAdmins(adminList);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      // For development/testing, show empty list - current admin is not in this list
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleView = (id: string, _taskType: string, _link: string) => {
    try {
      // Always show modal instead of opening links directly
      const allTasks = [...campaignTasks];
      const task = allTasks.find(t => t._id === id);
      if (task) {
        setSelectedTask(task);
        setViewModalOpen(true);
        setViewedSubmissions((prev) => new Set(prev).add(id));
      }
    } catch (error) {
      console.error("Error in handleView:", error);
    }
  };

  const handleAction = async (id: string, action: "accept" | "reject") => {
    try {
      setLoading(true);
      await apiRequest<{ message?: string }>({
        method: "POST",
        endpoint: "/api/admin/validate-task",
        data: {
          id,
          action,
          validatedBy: "current-admin"
        }
      });

      // Refresh tasks after action
      await fetchTasks();

      // Remove from viewed submissions
      setViewedSubmissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error(`Failed to ${action} submission:`, error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { title: "Campaign Tasks", icon: Zap, id: "campaignSubmissions" as TabType },
    { title: "Campaigns", icon: Users, id: "campaignsTab" as TabType },
    { title: "Admin Management", icon: Shield, id: "adminManagement" as TabType },
  ];

const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

const toggleUserSelection = (id: string) => {
  setSelectedUsers(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return newSet;
  });
};

const unbanUser = async (id: string) => {
  try {
    setLoading(true);
    await apiRequest({ method: "POST", endpoint: "/api/admin/unban-user", data: { id } });
    // Refresh banned users
    fetchBannedUsers();
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const fetchBannedUsers = async () => {
  try {
    setLoading(true);
    const res = await apiRequest<{ bannedUsers: BannedUser[] }>({ method: "GET", endpoint: "/api/admin/get-banned-users" });
    setBannedUsers(res.bannedUsers || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 animate-gradient" />
      <AnimatedBackground/>
      {/* Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#8a3ffc]/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#6366f1]/15 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-[#a855f7]/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex h-screen flex-col md:flex-row">

{/* ////////////  Sidebar */}
        <StudioSidebar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <AnimatedBackground/>
          {/* Mobile Header with Hamburger */}
          <div className="md:hidden border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src="/nexura-logo.png" alt="Nexura" className="h-6 w-auto" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5 h-9 w-9">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Sliding Nav Overlay */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 z-50 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Sliding Panel */}
              <div
                className="absolute top-0 left-0 h-full w-72 bg-[#0a0a15]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl animate-slide-in-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nav Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <img src="/nexura-logo.png" alt="Nexura" className="h-7 w-auto" />
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Items */}
                <nav className="p-3 space-y-1">
                  {sidebarItems.map((item) => (
  <button
    key={item.id}
    onClick={() => {
      setActiveTab(item.id);
      setLocation(
        item.id === "campaignsTab"
          ? "/studio-dashboard/campaigns-tab"
          : `/studio-dashboard/${item.id}`
      );
    }}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
      activeTab === item.id
        ? "text-[#8a3ffc] bg-[#8a3ffc]/10 border border-[#8a3ffc]/30"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    )}
  >
    <item.icon
      className={cn(
        "w-5 h-5",
        activeTab === item.id ? "text-[#8a3ffc]" : "text-white/50"
      )}
    />
    {item.title}
  </button>
))}
                </nav>

                {/* Actions */}
                <div className="px-4 py-3">
                  <AddAdminModal>
                    <Button
                      variant="outline"
                      className="w-full border-[#8a3ffc] text-[#8a3ffc] hover:bg-[#8a3ffc] hover:text-white gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Admin
                    </Button>
                  </AddAdminModal>
                </div>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a3ffc] to-[#6366f1] flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Administrator</span>
                      <span className="text-xs text-white/50">Online</span>
                    </div>
                  </div>
<Button
  variant="ghost"
  onClick={() => {
    setMobileNavOpen(false);
    onLogout();
    setLocation("/studio");
  }}
  className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start gap-2"
>
  Logout
</Button>
                </div>
              </div>
            </div>
          )}

          <header className="hidden md:flex h-16 border-b border-white/10 items-center justify-between px-6 backdrop-blur-sm bg-black/30">
  <div className="flex items-center gap-4 flex-1">
    <h2 className="text-lg font-semibold text-white whitespace-nowrap min-w-[200px]">
      {activeTab === "campaignSubmissions" && "Nexura Studio"}
      {activeTab === "adminManagement" && "User Administration"}
      {activeTab === "campaignsTab" && "Campaigns"}
    </h2>
  </div>

  <div className="flex items-center gap-4">
    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
      <Bell className="w-5 h-5" />
    </Button>

    {activeTab === "adminManagement" && (
      <AddAdminModal onSuccess={fetchAdmins}>
        <Button
          variant="outline"
          className="border-[#8a3ffc] text-[#8a3ffc] hover:bg-[#8a3ffc] hover:text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </AddAdminModal>
    )}

    {activeTab === "campaignsTab" && "create" && (
      <Button
        variant="outline"
        className="border-[#8a3ffc] text-[#8a3ffc] hover:bg-[#8a3ffc] hover:text-white gap-2"
        onClick={() => {
          // Open your "Create Campaign" modal or navigate
          console.log("Open Create Campaign Modal");
        }}
      >
        <img
          src="/campaign-icon.png"
          alt="Campaign Icon"
          className="w-4 h-4"
        />
        Create Campaign
      </Button>
    )}

    <div className="h-6 w-px bg-white/10 mx-2" />

    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        onLogout();
        setLocation("/studio");
      }}
      className="text-white/70 hover:text-white hover:text-red-400"
    >
      Logout
    </Button>
  </div>
</header>


          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-black/20">
            <div className="max-w-7xl mx-auto">
              {activeTab !== "adminManagement" && activeTab !== "campaignsTab" && (
                <StatsOverview key={activeTab} tasks={activeTab === "campaignSubmissions" ? campaignTasks : []} />
              )}
              {activeTab === "campaignsTab" && <CampaignsTab />}

              {activeTab === "campaignSubmissions" && (
<CampaignSubmissions
  tasks={campaignTasks}
  loading={loading}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  selectedUsers={selectedUsers}
  viewedSubmissions={viewedSubmissions}
  toggleUserSelection={toggleUserSelection}
  handleView={handleView}
  handleAction={handleAction}
  onRefresh={fetchTasks}
/>

)}

              {activeTab === "adminManagement" && <AdminManagement />}
            </div>
          </main>
        </div>
      </div>

      {/* View Task Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/5 border-white/10 backdrop-blur-[125px] text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <div className="p-2 rounded-full bg-[#8a3ffc]/20">
                <Eye className="w-5 h-5 text-[#8a3ffc]" />
              </div>
              View {selectedTask?.taskType} Submission
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Submission details for validation
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-white/70">Task Type</Label>
                <div className="text-white capitalize">{selectedTask.taskType}</div>
              </div>

              {selectedTask.taskType && ["follow", "like"].includes(selectedTask.taskType.toLowerCase()) ? (
                <div className="grid gap-2">
                  <Label className="text-white/70">Username to {selectedTask.taskType}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={(() => {
                        // For both follow and like tasks, extract username from submissionLink
                        const urlMatch = selectedTask.submissionLink.match(/https?:\/\/(?:twitter\.com|x\.com)\/([^\/]+)/);
                        return urlMatch ? `x.com/${urlMatch[1]}` : selectedTask.submissionLink;
                      })()}
                      readOnly
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#8a3ffc] flex-1"
                    />
                    <Button
                      onClick={() => {
                        const urlMatch = selectedTask.submissionLink.match(/https?:\/\/(?:twitter\.com|x\.com)\/([^\/]+)/);
                        const targetUrl = urlMatch ? `https://x.com/${urlMatch[1]}` : selectedTask.submissionLink;
                        if (targetUrl) window.open(targetUrl, "_blank");
                      }}
                      disabled={!selectedTask.submissionLink}
                      className="bg-[#8a3ffc] hover:bg-[#7b2fec] text-white px-4"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label className="text-white/70">Submission Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={selectedTask.submissionLink}
                      readOnly
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#8a3ffc] flex-1"
                    />
                    <Button
                      onClick={() => window.open(selectedTask.submissionLink, "_blank")}
                      className="bg-[#8a3ffc] hover:bg-[#7b2fec] text-white px-4"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label className="text-white/70">Campaign ID</Label>
                <div className="text-white/60 text-sm">{selectedTask.campaignId}</div>
              </div>

              <div className="grid gap-2">
                <Label className="text-white/70">Status</Label>
                <Badge className={cn(
                  "w-fit",
                  selectedTask.status === "pending" && "bg-yellow-500/20 text-yellow-400",
                  selectedTask.status === "done" && "bg-green-500/20 text-green-400",
                  selectedTask.status === "retry" && "bg-red-500/20 text-red-400"
                )}>
                  {selectedTask.status}
                </Badge>
              </div>
            </div>
          )}

          {/* Review Actions for Completed Tasks */}
          {selectedTask && selectedTask.status !== "pending" && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={() => handleAction(selectedTask._id, "accept")}
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border border-green-500/50 rounded-full px-6 py-2"
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => handleAction(selectedTask._id, "reject")}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/50 rounded-full px-6 py-2"
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}