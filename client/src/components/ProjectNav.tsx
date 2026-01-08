import React from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
} from "./ui/sidebar";
import { useAuth } from "../lib/auth";
import { Layout, Calendar, BarChart2, Trophy, Users, Settings } from "lucide-react";

export default function ProjectNav({ base, projectName }: { base: string; projectName?: string }) {
  const [location, setLocation] = useLocation();
  const auth = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const tabs: { key: string; label: string; to: string; Icon: any }[] = [
    { key: "overview", label: "Overview", to: `${base}/dashboard`, Icon: Layout },
    { key: "campaigns", label: "Campaigns", to: `${base}/campaigns`, Icon: Calendar },
    { key: "analytics", label: "Analytics", to: `${base}/analytics`, Icon: BarChart2 },
    { key: "leaderboard", label: "Leaderboard", to: `${base}/leaderboard`, Icon: Trophy },
    { key: "collabs", label: "Collaborators", to: `${base}/collabs`, Icon: Users },
    { key: "settings", label: "Settings", to: `${base}/settings`, Icon: Settings },
  ];

  const isActive = (to: string) => {
    if (to === `${base}/dashboard`) return location === `${base}` || location === to;
    return location.startsWith(to);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r border-border/40">
        <SidebarContent className="bg-background">
          {/* Project header mirrors the site header styling for parity */}
          <div className="p-6 border-b border-border/40 project-sidebar-header">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                {projectName ? projectName.charAt(0).toUpperCase() : "P"}
              </div>
              <div className="font-extrabold text-lg text-foreground truncate">{projectName ?? "Project"}</div>
            </div>
          </div>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className={`transform transition-all duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                {tabs.map((item) => {
                  const active = isActive(item.to);
                  // Overview should not have a persistent glow even when active; only hover.
                  const shouldPersistentGlow = active && item.key !== "overview";
                  const btnClass = `${shouldPersistentGlow ? "nav-project-active" : ""} nav-project-button`;
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={active} className={btnClass}>
                        <Link href={item.to} className="w-full" data-testid={`project-nav-${item.key}`}>
                          <item.Icon className="w-4 h-4" />
                          <div className="flex flex-col items-start">
                            <span className="text-base font-medium">{item.label}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
