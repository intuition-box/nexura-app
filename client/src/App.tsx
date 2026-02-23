import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
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
import Projects from "./pages/studio/Projects";
import ProjectCreate from "./pages/studio/ProjectCreate";
import ProjectDashboard from "./pages/project/ProjectDashboard";
import NexuraSidebar from "./components/QuestflowSidebar";
import ProfileBar from "./components/ProfileBar";
import { WalletProvider } from "./lib/wallet";
import { AuthProvider } from "./lib/auth";
import OrgSignInButton from "./components/OrgSignInButton";
import ProjectLogoutButton from "./components/ProjectLogoutButton";
import ErrorBoundary from "./components/ErrorBoundary";
import PortalClaims from "./pages/PortalClaims";
import AnimatedBackground from "./components/AnimatedBackground";
import Home from "./pages/Home.tsx";
import Analytics from "./pages/Analytics.tsx";
import NexuraStudio from "./pages/NexuraStudio.tsx"
import CreateHub from "./pages/studio/CreateHub.tsx"
import SignInToHub from "./pages/studio/SignInToHub.tsx"
import TheHub from "./pages/studio/TheHub.tsx";
import ConnectTwitter from "./pages/studio/ConnectTwitter.tsx";
import ConnectedTwitter from "./pages/studio/ConnectedTwitter.tsx"
import StudioDashboard from "./pages/studio/StudioDashboard.tsx"
import CampaignsTab from "./components/admin/CampaignsTab.tsx";
import { getStoredAccessToken, apiRequest } from './lib/config'
import { clearProjectSession, getStoredProjectToken, projectApiRequest } from './lib/projectApi'
import CreateNewCampaigns from "./components/admin/CreateNewCampaign.tsx";
import MyCampaign from "./components/admin/MyCampaign.tsx"
import AdminManagement from "./components/admin/AdminManagement.tsx";
import AdminSignUp from "./pages/studio/AdminSignUp.tsx";

function Router() {
   const [isAuthenticated, setIsAuthenticated] = useState(false)
   
    const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('nexura-admin:token');
    localStorage.removeItem('nexura-admin:info');
    // Clear project session and call server logout if project is signed in
    if (getStoredProjectToken()) {
      projectApiRequest({ method: 'POST', endpoint: '/project/logout' }).catch(() => {});
    }
    clearProjectSession();
    setIsAuthenticated(false);
  }

  return (
    // <Home />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
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
      <Route path="/analytics" component={Analytics} />
      <Route path="/portal-claims" component={PortalClaims} />
      <Route path="/studio" component={NexuraStudio} />
      {/* Profile pages */}
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={EditProfile} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/leaderboard" component={Leaderboard} />
      {/* Developer pages */}
      <Route path="/projects" component={Projects} />
      <Route path="/projects/create" component={ProjectCreate} />
      <Route path="/projects/create/create-hub" component={CreateHub} />
      <Route path="/projects/create/signin-to-hub" component={SignInToHub} />
      <Route path="/projects/create/the-hub" component={TheHub} />
      <Route path="/connect-twitter" component={ConnectTwitter} />
      <Route path="/connected-twitter" component={ConnectedTwitter} />
      <Route path="/studio-dashboard">
  <StudioDashboard onLogout={handleLogout} />
</Route>
<Route path="/studio-dashboard/create-new-campaign" component={CreateNewCampaigns} />
<Route path="/studio-dashboard/campaigns-tab" component={CampaignsTab} />
<Route path="/studio-dashboard/admin-management" component={AdminManagement} />
<Route path="/studio-dashboard/my-campaign" component={MyCampaign} />


      <Route path="/studio/register" component={AdminSignUp} />
      {/* <Route path="/studio" component={StudioIndex} /> */}
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
  const [location] = useLocation();
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
                

                const isHome = location === "/" || location === "/home";
                const isStudio = location.startsWith("/studio-dashboard");
                const isProject = location.startsWith("/project/");
                return (
                  <div className="flex h-screen w-full text-white selection:bg-blue-500/30 relative">

                    {/* {BACKGROUND FOR ALL PAGES} */}
                    <AnimatedBackground />

                    {/* Sidebar */}
                    {!isHome && !isStudio && <NexuraSidebar />}

                    {/* Main content */}
                    <div className="flex-1 flex flex-col relative z-10">
                      {!isHome && !isStudio &&(
                        <header className="flex items-center justify-between p-4 app-header">
                          <SidebarTrigger data-testid="button-sidebar-toggle" />
                          <ProfileBar />
                        </header>
                      )}
                      <main className="flex-1 overflow-y-auto">
                        <Router />
                      </main>
                    </div>

                    {/* {!isHome && !isStudio && !isProject && <OrgSignInButton />} */}
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