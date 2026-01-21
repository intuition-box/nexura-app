import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import NotFound from "./pages/not-found";
import Discover from "./pages/Discover";
// import Rewards from "./pages/Rewards";
import Learn from "./pages/Learn";
import Campaigns from "./pages/Campaigns";
import Quests from "./pages/Quests";
import EcosystemDapps from "./pages/EcosystemDapps";
import Referrals from "./pages/Referrals";
import QuestEnvironment from "./pages/QuestEnvironment";
import CampaignEnvironment from "./pages/CampaignEnvironment";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import DiscordCallback from "./pages/DiscordCallback";
import XCallback from "./pages/XCallback";
import Levels from "./pages/Levels";
import UserReferred from "./pages/UserReferred";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectDashboard from "./pages/project/ProjectDashboard";
import StudioIndex from "./pages/studio/StudioIndex";
import ProjectRegistration from "./pages/studio/ProjectRegistration";
import NexuraSidebar from "./components/QuestflowSidebar";
import ProfileBar from "./components/ProfileBar";
import { WalletProvider } from "./lib/wallet";
import { AuthProvider } from "./lib/auth";
import OrgSignInButton from "./components/OrgSignInButton";
import ProjectLogoutButton from "./components/ProjectLogoutButton";
import ErrorBoundary from "./components/ErrorBoundary";
import PortalClaims from "./pages/PortalClaims";
import AnimatedBackground from "./components/AnimatedBackground";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    // <Home />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/discover" component={Discover} />
      <Route path="/levels" component={Levels} />
      {/* NEXURA pages */}
      <Route path="/learn" component={Learn} />
      <Route path="/quests" component={Quests} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/ecosystem-dapps" component={EcosystemDapps} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/quest/:questId" component={QuestEnvironment} />
      <Route path="/campaign/:campaignId" component={CampaignEnvironment} />
      <Route path="/discord/callback" component={DiscordCallback} />
      <Route path="/x/callback" component={XCallback} />
      <Route path="/campaigns/tasks" component={CampaignEnvironment} />
      <Route path="/quests/tasks-card" component={QuestEnvironment} />
      <Route path="/portal-claims" component={PortalClaims} />
      {/* Profile pages */}
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={EditProfile} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/leaderboard" component={Leaderboard} />
      {/* Developer pages */}
      <Route path="/projects" component={Projects} />
      <Route path="/projects/create" component={ProjectCreate} />
      <Route path="/studio" component={StudioIndex} />
      <Route path="/studio/register" component={ProjectRegistration} />
      <Route path="/project/:projectId/*" component={ProjectDashboard} />
      <Route path="/project/:projectId/:rest*" component={ProjectDashboard} />
      {/* Referral */}
      <Route path="/ref/:referrerCode" component={UserReferred} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // NEXURA-style sidebar configuration
  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider style={sidebarStyle as React.CSSProperties}>
              {(() => {
                const [location] = useLocation();

const isHome = location === "/" || location === "/home";
const isStudio = location.startsWith("/studio");
const isProject = location.startsWith("/project/");
const isAdmin = location.startsWith("/admin");
                return (
                  <div className="flex h-screen w-full text-white selection:bg-blue-500/30 relative">
  {/* Background behind everything */}
  <AnimatedBackground />

{/* Sidebar */}
{!isHome && !isStudio && !isProject && !isAdmin && <NexuraSidebar />}

  {/* Main content */}
  <div className="flex-1 flex flex-col relative z-10">
    {!isHome && !isStudio && !isProject && !isAdmin && (
      <header className="flex items-center justify-between p-4 app-header">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <ProfileBar />
      </header>
    )}
    <main className="flex-1 overflow-y-auto">
      <Router />
    </main>
  </div>

{!isHome && !isStudio && !isProject && !isAdmin && <OrgSignInButton />}
  {isProject && <ProjectLogoutButton />}
</div>
);
              })()}
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;