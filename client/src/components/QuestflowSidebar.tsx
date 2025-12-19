import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { 
  BookOpen, 
  Compass, 
  Users, 
  Trophy,
  Zap, 
  Calendar, 
  Target, 
  Orbit,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "wouter";

const mainNavItems = [
  { title: "Learn", subtitle: "", icon: BookOpen, href: "/learn", activeClass: "nav-learn-active" },
  { title: "Explore", icon: Compass, href: "/", activeClass: "nav-explore-active" },
  { title: "Referrals", icon: Users, href: "/referrals", activeClass: "nav-referrals-active" },
  { title: "Quests", icon: Zap, href: "/quests", activeClass: "nav-quests-active" },
  { title: "Campaigns", icon: Calendar, href: "/campaigns", activeClass: "nav-campaigns-active" },
  { title: "Ecosystem Dapps", icon: Target, href: "/ecosystem-dapps", activeClass: "nav-ecosystem-dapps-active" },
  { title: "Leaderboard", icon: Trophy, href: "/leaderboard", activeClass: "nav-leaderboard-active" },
  { title: "Portal Claims", icon: Orbit, href: "/portal-claims", activeClass: "nav-portal-claims-active" }
];

export default function NexuraSidebar() {
  const [location] = useLocation();
  const [mounted, setMounted] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleLinkClick = () => {
    // Only close sidebar on mobile (screen width < 768px)
    if (window.innerWidth < 768 && sidebarRef.current) {
      const closeEvent = new CustomEvent("closeSidebar");
      sidebarRef.current.dispatchEvent(closeEvent);
    }
  };

  return (
    <Sidebar ref={sidebarRef} className="border-r border-border/40">
      <SidebarContent className="bg-background">
        {/* Logo */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center">
            <img src="/nexura-logo.png" alt="Nexura" className="w-40 h-auto" />
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={`transform transition-all duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
              {mainNavItems.map((item) => {
                const isActive = location === item.href || (item.href === "/" && (location === "/" || location === "/discover"));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={isActive ? item.activeClass : ""}
                    >
                      <Link
                        href={item.href}
                        onClick={handleLinkClick} // closes sidebar on mobile
                        className="w-full flex items-center gap-2"
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <div className="flex flex-col items-start">
                          <span className="text-base font-medium">{item.title}</span>
                          {item.subtitle && (
                            <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                          )}
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
  );
}
