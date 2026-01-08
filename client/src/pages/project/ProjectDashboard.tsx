import React from "react";
import { Route, Switch } from "wouter";
import ProjectOverview from "@/pages/project/ProjectOverview";
import ProjectTasks from "@/pages/project/ProjectTasks";
import ProjectAnalytics from "@/pages/project/ProjectAnalytics";
import ProjectSettings from "@/pages/project/ProjectSettings";
import ProjectLeaderboard from "@/pages/project/ProjectLeaderboard";
import ProjectCollabs from "@/pages/project/ProjectCollabs";
import ProjectNav from "../../components/ProjectNav";
import { useLocation } from "wouter";
import ProjectCreateCampaign from "@/pages/project/ProjectCreateCampaign";

export default function ProjectDashboard({ params }: any) {
  const base = `/project/${params.projectId}`;
  const [location] = useLocation();

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      <div className="flex h-full gap-0">
        {/* Left: project sidebar (glowing buttons) - full height */}
        <div className="shrink-0 border-r border-border/40 bg-gradient-to-b from-background/50 to-background/20">
          <ProjectNav base={base} projectName={params?.projectName} />
        </div>

        {/* Right: main content area with full height scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Top bar with breadcrumb and title */}
          <div className="sticky top-0 z-40 border-b border-border/20 bg-gradient-to-b from-background/95 via-background/90 to-background/80 backdrop-blur-md">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</span>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {params?.projectName || "Dashboard"}
                  </h1>
                  {/* Debug path removed for production UI */}
                </div>
              </div>
            </div>
          </div>

          {/* Main content with padding and max-width */}
          <div className="min-h-full px-8 py-8">
            <div className="mx-auto max-w-6xl">
              {/* Content wrapper with glass effect */}
              <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-background/40 via-background/20 to-background/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="p-8">
                  {/* Render create page explicitly when URL matches to avoid router ordering/matching issues */}
                  {location && location.startsWith(`${base}/campaigns/create`) ? (
                    <ProjectCreateCampaign />
                  ) : (
                    <Switch>
                      <Route path={`${base}/dashboard`} component={ProjectOverview} />
                      <Route path={`${base}/campaigns`} component={ProjectTasks} />
                      <Route path={`${base}/analytics`} component={ProjectAnalytics} />
                      <Route path={`${base}/leaderboard`} component={ProjectLeaderboard} />
                      <Route path={`${base}/collabs`} component={ProjectCollabs} />
                      <Route path={`${base}/settings`} component={ProjectSettings} />
                    </Switch>
                  )}
                </div>
              </div>

              {/* Subtle accent elements */}
              <div className="pointer-events-none mt-12 flex justify-between opacity-10">
                <div className="h-40 w-40 rounded-full bg-indigo-500 blur-3xl" />
                <div className="h-40 w-40 rounded-full bg-cyan-500 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
