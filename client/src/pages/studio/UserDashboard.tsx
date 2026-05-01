import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import AnimatedBackground from "../../components/AnimatedBackground.tsx";
import UserSidebar from "./userSidebar.tsx";
import { projectApiRequest, isProjectSignedIn } from "../../lib/projectApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";

import { Button } from "../../components/ui/button";
import { Check, X } from "lucide-react";
import { TASKSS } from "../../types/admin";
import QuestSubmissions from "../../components/admin/QuestsSubmissions.tsx";

interface StudioDashboardProps {
  onLogout: () => void;
}

type TabType =
  | "userProfile"
  | "questTab"
  | "questSubmissions";

export default function userDashboard({ onLogout }: StudioDashboardProps) {
  const [location, setLocation] = useLocation();

  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    if (!isProjectSignedIn()) {
      setLocation("/studio");
    }
  }, []);

  // ---------------- TAB DERIVATION (SOURCE: URL ONLY) ----------------
  const activeTab: TabType =
    location.includes("/user-dashboard/user-profile")
      ? "userProfile"
      : location.includes("/user-dashboard/quests-tab")
      ? "questTab"
      : "questSubmissions";

  // ---------------- STATE ----------------
  const [viewedSubmissions, setViewedSubmissions] = useState<Set<string>>(new Set());
  const [questTasks, setQuestTasks] = useState<TASKSS[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TASKSS | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // ---------------- FETCH QUESTS ----------------
  const fetchQuests = async () => {
    try {
      setLoading(true);

      const res = await projectApiRequest<{
        pendingTasks?: TASKSS[];
      }>({
        endpoint: "/hub/quest-submissions",
        method: "GET",
      });

      const pendingTasks = res?.pendingTasks ?? [];

      setQuestTasks(
        pendingTasks.filter((task) => task.page === "quest")
      );
    } catch (err) {
      console.error("Failed to fetch quests:", err);
      setQuestTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH ON DASHBOARD ONLY ----------------
  useEffect(() => {
    if (location.includes("/user-dashboard")) {
      fetchQuests();
    }
  }, [location]);

  // ---------------- VIEW ----------------
  const handleView = (id: string) => {
    const task = questTasks.find((t) => t._id === id);
    if (!task) return;

    setSelectedTask(task);
    setViewModalOpen(true);

    setViewedSubmissions((prev) => new Set(prev).add(id));
  };

  // ---------------- ACTION ----------------
  const handleAction = async (
    id: string,
    action: "accept" | "reject"
  ) => {
    try {
      setLoading(true);

      await projectApiRequest({
        method: "POST",
        endpoint: "/hub/validate-quest-submissions",
        data: { submissionId: id, action },
      });

      await fetchQuests();

      setViewedSubmissions((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- NAVIGATION ----------------
  const navigate = (tab: TabType) => {
    if (tab === "userProfile") setLocation("/user-dashboard/user-profile");
    if (tab === "questTab") setLocation("/user-dashboard/quests-tab");
    if (tab === "questSubmissions") setLocation("/user-dashboard");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex h-screen flex-col md:flex-row">

        {/* SIDEBAR */}
        <UserSidebar activeTab={activeTab} />

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">

          <header className="hidden md:flex h-16 border-b border-white/10 items-center px-6">
            <h2 className="text-white font-semibold">
              {activeTab === "userProfile" && "User Profile"}
              {activeTab === "questTab" && "Quests"}
              {activeTab === "questSubmissions" && "Dashboard"}
            </h2>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-6">

            {activeTab === "questSubmissions" && (
              <QuestSubmissions
                tasks={questTasks}
                loading={loading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedUsers={selectedUsers}
                viewedSubmissions={viewedSubmissions}
                toggleUserSelection={toggleUserSelection}
                handleView={handleView}
                handleAction={handleAction}
                onRefresh={fetchQuests}
              />
            )}

            {activeTab === "questTab" && (
              <div className="text-white">Quests Page</div>
            )}

            {activeTab === "userProfile" && (
              <div className="text-white">User Profile Page</div>
            )}

          </main>
        </div>
      </div>

      {/* MODAL */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission</DialogTitle>
            <DialogDescription>
              {selectedTask?.taskType}
            </DialogDescription>
          </DialogHeader>

          <div className="text-white">
            {selectedTask?.submissionLink}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              disabled={!selectedTask}
              onClick={() =>
                selectedTask && handleAction(selectedTask._id, "accept")
              }
            >
              <Check className="w-4 h-4" />
            </Button>

            <Button
              disabled={!selectedTask}
              onClick={() =>
                selectedTask && handleAction(selectedTask._id, "reject")
              }
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}