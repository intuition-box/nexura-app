import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "../../components/ui/button";
import AnimatedBackground from "../../components/AnimatedBackground";
import StudioSidebar from "./StudioSidebar";
import { isProjectSignedIn, clearProjectSession, projectApiRequest } from "../../lib/projectApi";
import { getStoredProjectToken } from "../../lib/projectApi";

type TabType = "campaignSubmissions" | "adminManagement" | "campaignsTab";

interface StudioLayoutProps {
  children: React.ReactNode;
  title?: string;
  onLogout?: () => void;
}

/**
 * Shared layout wrapper for all /studio-dashboard/* pages.
 * Renders the StudioSidebar + header chrome around the given children.
 */
export default function StudioLayout({ children, title = "Nexura Studio", onLogout }: StudioLayoutProps) {
  const [location, setLocation] = useLocation();

  // Determine active tab from the current URL
  const deriveTab = (): TabType => {
    if (location.includes("admin-management")) return "adminManagement";
    if (location.includes("campaigns-tab") || location.includes("create-new-campaign") || location.includes("my-campaign"))
      return "campaignsTab";
    return "campaignsTab"; // default
  };

  const [activeTab, setActiveTab] = useState<TabType>(deriveTab);

  // Auth guard
  useEffect(() => {
    if (!isProjectSignedIn()) {
      setLocation("/studio");
    }
  }, []);

  const handleLogout = () => {
    if (getStoredProjectToken()) {
      projectApiRequest({ method: "POST", endpoint: "/hub/logout" }).catch(() => {});
    }
    clearProjectSession();
    onLogout?.();
    setLocation("/studio");
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#8a3ffc]/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#6366f1]/15 blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-[#a855f7]/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 flex h-screen flex-col md:flex-row">
        <StudioSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatedBackground />

          <header className="hidden md:flex h-16 border-b border-white/10 items-center justify-between px-6 backdrop-blur-sm bg-black/30">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-lg font-semibold text-white whitespace-nowrap min-w-[200px]">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
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

          <main className="flex-1 overflow-y-auto pt-4 pb-8 px-4 md:pt-8 md:pb-8 md:px-8 relative bg-black/20">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
