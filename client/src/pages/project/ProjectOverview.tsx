import React, { useEffect, useState } from "react";
import { buildUrl } from "@/lib/queryClient";

export default function ProjectOverview({ params }: any) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(buildUrl(`/projects/${params.projectId}`));
        if (!res.ok) throw new Error("not found");
        const json = await res.json();
        setProject(json);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.projectId]);

  if (loading) return <div>Loading project…</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <h2 className="text-xl font-bold">{project.name}</h2>
      <p className="text-sm text-muted-foreground">Owner: {project.ownerAddress}</p>
      <div className="mt-4">
        <p>{project.description}</p>
      </div>
    </div>
  );
}
