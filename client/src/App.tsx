import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Discover from "@/pages/Discover";
import Rewards from "@/pages/Rewards";
import Learn from "@/pages/Learn";
import Campaigns from "@/pages/Campaigns";
import Quests from "@/pages/Quests";
import EcosystemDapps from "@/pages/EcosystemDapps";
import Referrals from "@/pages/Referrals";
import QuestEnvironment from "@/pages/QuestEnvironment";
import CampaignEnvironment from "@/pages/CampaignEnvironment";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Achievements from "@/pages/Achievements";
import Leaderboard from "@/pages/Leaderboard";
import Levels from "@/pages/Levels";
import Projects from "@/pages/Projects";
import ProjectCreate from "@/pages/ProjectCreate";
import ProjectDashboard from "@/pages/project/ProjectDashboard";
import StudioIndex from "@/pages/studio/StudioIndex";
import ProjectRegistration from "@/pages/studio/ProjectRegistration";
import NexuraSidebar from "@/components/QuestflowSidebar";
import { useLocation } from "wouter";
import ProfileBar from "@/components/ProfileBar";
import { WalletProvider } from "@/lib/wallet";
import { AuthProvider } from "@/lib/auth";
import OrgSignInButton from "@/components/OrgSignInButton";
import ProjectLogoutButton from "@/components/ProjectLogoutButton";
import ErrorBoundary from "@/components/ErrorBoundary";
import PortalClaims from "./pages/PortalClaims";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
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
              const isStudio = location?.startsWith?.("/studio");
              const isProject = location?.startsWith?.("/project/");
              return (
                <div className="flex h-screen w-full bg-black text-white selection:bg-blue-500/30">
                  {!isStudio && !isProject && <NexuraSidebar />}
                  <div className={`flex flex-col flex-1 ${isStudio ? '' : ''}`}>
                    {/* Top Header with Profile Bar (hide on Studio and Project dashboard pages) */}
                    {!isStudio && !isProject && (
                      <header className="flex items-center justify-between p-4 app-header">
                        <SidebarTrigger data-testid="button-sidebar-toggle" />
                        <ProfileBar />
                      </header>
                    )}
                    {/* Main Content with Better Scrolling */}
                    <main className="flex-1 overflow-y-auto main-shell">
                      <div className="container max-w-7xl mx-auto">
                        <div className="card-glass p-6">
                          <ErrorBoundary>
                            <Router />
                          </ErrorBoundary>
                        </div>
                      </div>
                    </main>
                  </div>
                  {!isStudio && !isProject && <OrgSignInButton />}
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
