import { cn } from "../../lib/utils";
import { Zap, Users, User } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useEffect, useState, useCallback } from "react";
import { getStoredUserSession } from "../../lib/userSession";

type TabType = "userProfile" | "questsTab" | "questSubmissions";

interface UserSidebarProps {
  activeTab: TabType;
}

export default function UserSidebar({ activeTab }: UserSidebarProps) {
  const [, setLocation] = useLocation();

  const [userAvatar, setUserAvatar] = useState("/default-avatar.png");
  const [username, setUsername] = useState("@user");

const syncUser = useCallback(() => {
  const user = getStoredUserSession(); // ALWAYS fresh

  if (user?.type === "user") {
    setUsername(user.username || "@user");
    setUserAvatar(user.avatar || "/default-avatar.png");
  }
}, []);

useEffect(() => {
  syncUser();

  const handler = () => {
    syncUser();
  };

  window.addEventListener("user-session-update", handler);

  return () => {
    window.removeEventListener("user-session-update", handler);
  };
}, []);

  const sidebarItems: { title: string; icon: any; id: TabType }[] = [
    { title: "Profile", icon: User, id: "userProfile" },
    { title: "Quests", icon: Users, id: "questsTab" },
    { title: "Dashboard", icon: Zap, id: "questSubmissions" },
  ];

  const routeByTab: Record<TabType, string> = {
    userProfile: "/user-dashboard/user-profile",
    questsTab: "/user-dashboard/quests-tab",
    questSubmissions: "/user-dashboard",
  };

  const navigate = (id: TabType) => {
    setLocation(routeByTab[id]);
  };

  return (
    <>
      <div className="w-[16rem] border-r border-white/10 hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-white/10 relative">
          <AnimatedBackground className="absolute inset-0 z-0" />

          <div className="flex items-center mb-4 relative z-10">
            <img src="/nexura-logo.png" alt="Nexura" className="w-40 h-auto" />
          </div>

          <button className="flex items-center gap-3 border-2 border-purple-500 rounded-2xl px-3 py-2 relative z-10 w-full min-w-0 hover:bg-white/5 transition-colors text-left">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-white/60 text-xs">User</span>
              <span className="text-white font-semibold text-sm truncate">
                {username}
              </span>
            </div>
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === item.id
                  ? "text-[#9a58ff] bg-white/5"
                  : "text-white hover:bg-purple-600/20"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <img src="/nexura-logo.png" alt="Nexura" className="h-7 w-auto" />

        <div className="flex items-center gap-2 border border-purple-500 rounded-xl px-2 py-1 max-w-[55%] min-w-0">
          <div className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
            <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
          </div>
          <span className="text-white text-xs font-semibold truncate">
            {username}
          </span>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex bg-black/90 backdrop-blur-xl border-t border-white/10">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium",
              activeTab === item.id ? "text-[#9a58ff]" : "text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </button>
        ))}
      </nav>
    </>
  );
}