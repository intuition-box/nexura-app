import { cn } from "../../lib/utils";
import { Zap, Shield, Users } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useEffect, useState } from "react";
import { getStoredProjectInfo } from "../../lib/projectApi";

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
  const [location, setLocation] = useLocation();

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

  return (
    <div className="w-[18rem] border-r border-white/10 hidden md:flex flex-col z-20">
      <div className="p-6 border-b border-white/10 relative">
        {/* Keep your AnimatedBackground behind the content */}
        <AnimatedBackground className="absolute inset-0 z-0" />

        {/* Nexura logo stays the same */}
        <div className="flex items-center mb-4 relative z-10">
          <img src="/nexura-logo.png" alt="Nexura" className="w-40 h-auto" />
        </div>

        {/* Project info: logo + Twitter handle */}
        <div className="inline-flex items-center gap-3 border-2 border-purple-500 rounded-2xl px-3 py-2 relative z-10">
          <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src={projectLogo}
              alt="Project Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-white/60 text-xs">Project</span>
            <span className="text-white font-semibold text-sm">
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
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === "campaignsTab") {
  setLocation("/studio-dashboard/campaigns-tab");
} else if (item.id === "adminManagement") {
  setLocation("/studio-dashboard/admin-management");
} else {
  setLocation("/studio-dashboard");
}
            }}
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
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              Administrator
            </span>
            <span className="text-xs text-white/50">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
