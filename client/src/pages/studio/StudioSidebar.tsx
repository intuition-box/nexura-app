import { cn } from "../../lib/utils";
import { Zap, Shield, Users, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useEffect, useState } from "react";
import { getStoredProjectInfo, clearProjectSession } from "../../lib/projectApi";

type TabType = "campaignSubmissions" | "adminManagement" | "campaignsTab";

interface StudioSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function StudioSidebar({
  activeTab,
  setActiveTab,
}: StudioSidebarProps) {
  const sidebarItems = [
    { title: "Dashboard", icon: Zap, id: "campaignSubmissions" as TabType },
    { title: "Campaigns", icon: Users, id: "campaignsTab" as TabType },
    { title: "Admin Management", icon: Shield, id: "adminManagement" as TabType },
  ];
  const [, setLocation] = useLocation();

  // State to hold project info
  const [projectLogo, setProjectLogo] = useState("/default-project-logo.png");
  const [projectHandle, setProjectHandle] = useState("@project");

  useEffect(() => {
    const info = getStoredProjectInfo();
    if (info) {
      const name = (info.name ?? info.email ?? "project") as string;
      setProjectHandle(name.startsWith("@") ? name : `@${name}`);
      if (info.logo) setProjectLogo(info.logo as string);
    }
  }, []);

  const navigate = (id: TabType) => {
    setActiveTab(id);
    if (id === "campaignsTab") setLocation("/studio-dashboard/campaigns-tab");
    else if (id === "adminManagement") setLocation("/studio-dashboard/admin-management");
    else setLocation("/studio-dashboard");
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="w-[18rem] border-r border-white/10 hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-white/10 relative">
          <AnimatedBackground className="absolute inset-0 z-0" />

          <div className="flex items-center mb-4 relative z-10">
            <img src="/nexura-logo.png" alt="Nexura" className="w-40 h-auto" />
          </div>

          {/* Project pill — full width with truncation */}
          <div className="flex items-center gap-3 border-2 border-purple-500 rounded-2xl px-3 py-2 relative z-10 w-full min-w-0">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src={projectLogo}
                alt="Project Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white/60 text-xs">Project</span>
              <span className="text-white font-semibold text-sm truncate">
                {projectHandle}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                activeTab === item.id
                  ? "text-[#8a3ffc] bg-white/5"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === item.id
                    ? "text-[#8a3ffc]"
                    : "text-white/70 group-hover:text-white"
                )}
              />
              {item.title}
            </button>
          ))}
        </nav>

        {/* Administrator info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-purple-400 font-bold">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">Administrator</span>
              <span className="text-xs text-white/50">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <img src="/nexura-logo.png" alt="Nexura" className="h-7 w-auto" />
        <div className="flex items-center gap-2 border border-purple-500 rounded-xl px-2 py-1 max-w-[55%] min-w-0">
          <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
            <img src={projectLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-white text-xs font-semibold truncate">{projectHandle}</span>
        </div>
      </div>

      {/* ── Mobile bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors",
              activeTab === item.id ? "text-[#8a3ffc]" : "text-white/50"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title === "Admin Management" ? "Admins" : item.title}</span>
          </button>
        ))}
        <button
          onClick={() => { clearProjectSession(); setLocation("/projects/create/signin-to-hub"); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-white/50"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}
