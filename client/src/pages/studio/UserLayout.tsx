import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "../../components/ui/button";
import AnimatedBackground from "../../components/AnimatedBackground";

// 👇 IMPORTANT: user sidebar (you must already have or create this)
import UserSidebar from "./userSidebar";

import { getStoredUserSession } from "../../lib/userSession";

type TabType =
  | "userProfile"
  | "questSubmissions"
  | "questsTab"
  | "myQuest"
  | "adminManagement";

interface UserLayoutProps {
  children: React.ReactNode;
  title?: string;
  onLogout?: () => void;
}

/**
 * Shared layout wrapper for all /user-dashboard/* pages.
 * Mirrors StudioLayout but fully isolated from project/studio logic.
 */
export default function UserLayout({
  children,
  title = "User Dashboard",
  onLogout,
}: UserLayoutProps) {
  const [location, setLocation] = useLocation();

  const user = getStoredUserSession();

  // 🔥 derive active tab from URL
  const deriveTab = (): TabType => {
    if (location.includes("user-profile")) return "userProfile";
    if (location.includes("quests-tab")) return "questsTab";
    if (location.includes("dashboard")) return "questSubmissions";
    if (location.includes("my-quest")) return "myQuest";
    if (location.includes("admin-management")) return "adminManagement";

    return "questsTab";
  };

  const [activeTab, setActiveTab] = useState<TabType>(deriveTab);

  useEffect(() => {
    setActiveTab(deriveTab());
  }, [location]);

  // simple auth guard (NO project dependency)
  useEffect(() => {
    if (!user?.type || user.type !== "user") {
      setLocation("/discover");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nexura-user-session");
    onLogout?.();
    setLocation("/discover");
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* ambient glow (same style as studio for consistency) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#8B3EFE]/20 blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#6366f1]/15 blur-[100px] animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-[#a855f7]/10 blur-[80px] animate-pulse-glow"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 flex h-screen flex-col md:flex-row">
        {/* 👇 USER SIDEBAR ONLY */}
        <UserSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatedBackground />

          {/* HEADER */}
          <header className="hidden md:flex h-16 border-b border-white/10 items-center justify-between px-6 backdrop-blur-sm bg-black/30">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-lg font-semibold text-white whitespace-nowrap min-w-[200px]">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
              </Button>

              <div className="h-6 w-px bg-white/10 mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/70 hover:text-white hover:text-red-400"
              >
                Logout
              </Button>
            </div>
          </header>

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-y-auto pt-4 pb-8 px-4 md:pt-8 md:pb-8 md:px-8 relative bg-black/20">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}