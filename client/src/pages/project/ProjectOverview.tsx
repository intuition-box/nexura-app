import React, { useEffect, useState } from "react";

// Use Vite env var if provided, otherwise fall back to the deployed backend URL.
// `import.meta.env` may not be typed in this project, so access defensively.
// Prefer a runtime-injected backend URL (window.__BACKEND_URL__), then Vite env var.
const RUNTIME_BACKEND = (typeof window !== 'undefined' && (window as any).__BACKEND_URL__) || undefined;
const BACKEND_BASE = RUNTIME_BACKEND || ((import.meta as any).env?.VITE_BACKEND_URL as string) || "";

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = (BACKEND_BASE || "").replace(/\/+$/g, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
}

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
