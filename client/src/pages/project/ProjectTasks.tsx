import React from "react";
import { useLocation, Link } from "wouter";
import { Button } from "../../components/ui/button";

export default function ProjectTasks() {
  const [location, setLocation] = useLocation();

  // extract projectId from URL like /project/:projectId/... 
  const m = location.match(/^\/project\/([^\/]+)/);
  const projectId = m ? m[1] : undefined;
  const base = projectId ? `/project/${projectId}` : "/projects";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and manage campaigns for your project here.</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-4">Campaigns let you group activities and rewards. Launch campaigns to attract contributors and track progress.</p>
        <Link href={`${base}/campaigns/create`}>
          <Button variant="default">Create campaign</Button>
        </Link>
      </div>
    </div>
  );
}
