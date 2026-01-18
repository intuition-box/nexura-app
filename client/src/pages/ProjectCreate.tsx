import React, { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { createProject } from "../lib/remoteDb";
import { ProjectSchema } from "../schemas/project.schema";
import { useWallet } from "../hooks/use-wallet";
import { uploadFile } from "../lib/upload";

export default function ProjectCreate() {
  const { isConnected, connectWallet, address } = useWallet();
  const [, setLocation] = useLocation();

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ensureConnected = async () => {
    if (!isConnected) await connectWallet({ noReload: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ensureConnected();
    if (!address) return alert("Wallet required");

    try {
      setSubmitting(true);
      let imageUrl: string | undefined = undefined;
      if (file) {
        const url = await uploadFile(file, `projects/${address}`);
        if (url) imageUrl = url;
      }

      const payload = ProjectSchema.parse({
        name,
        ownerAddress: address,
        description,
        website: website || undefined,
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      const res: any = await createProject(payload);
      // server returns created project with `id`
      const created = Array.isArray(res) ? res[0] : res;
      const id = created?.id || created?.projectId || created?.name;
      setSubmitting(false);
      setLocation(`/project/${id}/dashboard`);
    } catch (err: any) {
      setSubmitting(false);
      alert("Failed to create project: " + (err?.message || String(err)));
    }
  };

  return (
    <div className="glass rounded-3xl p-10 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Create Your Project</h2>
        <p className="text-white/60">Fill in the details below to launch your project on Nexura</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-3">Project Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-lg h-12 glass border-white/10 text-white focus:border-purple-500"
                placeholder="Enter your project name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3">Website</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourproject.com"
                className="h-12 glass border-white/10 text-white focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3">Social</label>
              <Input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@handle or https://twitter.com/handle"
                className="h-12 glass border-white/10 text-white focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-sm font-bold text-white mb-3">Project Image</label>
            <div className="w-48 h-48 border-2 border-dashed border-purple-500/50 rounded-2xl flex items-center justify-center overflow-hidden bg-white/5 hover:border-purple-400 transition-all duration-300">
              {file ? (
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-sm text-white/60 p-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-700 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">+</div>
                  <div>Drop or choose</div>
                  <div>an image</div>
                </div>
              )}
            </div>
            <div className="mt-4 flex space-x-3">
              <label className="inline-flex items-center px-5 py-2.5 bg-white text-black rounded-full cursor-pointer hover:scale-105 transition-transform shadow-lg font-bold">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                Upload
              </label>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="px-5 py-2.5 glass border-white/10 rounded-full text-sm text-white hover:bg-white/10 transition-all font-bold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-32 glass border-white/10 text-white focus:border-purple-500 resize-none"
            placeholder="Describe your project, its goals, and what makes it unique..."
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
          <Button variant="outline" onClick={() => setLocation("/projects")} className="rounded-full">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-full font-bold"
          >
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
