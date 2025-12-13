import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/hooks/use-wallet";
import { createProject } from "@/lib/remoteDb";
import { ProjectSchema } from "@/schemas/project.schema";
import SignUpPopup from "@/components/SignUpPopup";
import { useLocation } from "wouter";
import AnimatedBackground from "@/components/AnimatedBackground";
import { buildUrl } from "@/lib/queryClient";

export default function Projects() {
  const { isConnected, connectWallet, address } = useWallet();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = ProjectSchema.parse({
        name: title,
        ownerAddress: address ?? "",
        description,
      });

      createProject(payload)
        .then((res) => {
          setTitle("");
          setDescription("");
          alert("Project created — server response received.");
          console.log("createProject response:", res);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to create project: " + err.message);
        });
    } catch (err: any) {
      alert("Validation error: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black text-white min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10">
      <h1 className="text-3xl font-bold mb-4 text-white">Projects (Developer Console)</h1>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-white/60">Connect your wallet to create and manage projects.</p>
          <div className="flex gap-2">
            <Button onClick={async () => {
              const ok = await connectWallet({ noReload: true });
              if (!ok) return alert("Failed to connect wallet");
              try {
                // ask server for projects and navigate to existing project dashboard if owned
                const res = await fetch(buildUrl(`/projects`));
                if (res.ok) {
                  const list = await res.json();
                  const my = list.find((p: any) => p.ownerAddress && p.ownerAddress.toLowerCase() === (address || "").toLowerCase());
                  if (my) {
                    setLocation(`/project/${my.id}/dashboard`);
                    return;
                  }
                }
              } catch (e) {
                // ignore and fallthrough to create
              }
              setLocation("/projects/create");
            }}>Are you a project? Create one</Button>
            <SignUpPopup mode="project" action="signup" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-white/60">Connected as <code className="text-white">{address}</code></p>

          <div className="flex gap-2">
            {/* Allow explicit project sign-in (upsert project account) even when wallet is connected */}
            <SignUpPopup mode="project" action="signin" triggerLabel="Project Sign In" />
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-1">Project Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="glass border-white/10 text-white" />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-1">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="glass border-white/10 text-white" />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit">Create Project</Button>
              <Button variant="ghost" onClick={() => { setTitle(""); setDescription(""); }}>Reset</Button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
}