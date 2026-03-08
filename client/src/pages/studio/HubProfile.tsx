"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "../../hooks/use-toast";
import {
  projectApiRequest,
  getStoredProjectInfo,
  getStoredProjectToken,
  storeProjectSession,
  base64ToBlob,
} from "../../lib/projectApi";

export default function HubProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const info = getStoredProjectInfo();
  const isSuperAdmin = (info?.role ?? "admin") === "superadmin";

  // Fetch current hub data
  useEffect(() => {
    projectApiRequest<{ hub: Record<string, any> }>({ method: "GET", endpoint: "/hub/me" })
      .then(({ hub }) => {
        if (hub) {
          setName(hub.name ?? "");
          setDescription(hub.description ?? "");
          setLogoUrl(hub.logo ?? "");
        }
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load hub info.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(file);
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const descTooShort = description.length > 0 && description.length < 150;

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Hub name is required.", variant: "destructive" });
      return;
    }
    if (description.length > 0 && description.length < 150) {
      toast({ title: "Description too short", description: "Minimum 150 characters required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description ?? "");

      if (imagePreview) {
        const blob = base64ToBlob(imagePreview);
        fd.append("logo", blob, "logo.png");
      }

      await projectApiRequest({ method: "PATCH", endpoint: "/hub/update-hub", formData: fd });

      // Update cached session
      const token = getStoredProjectToken();
      const existing = getStoredProjectInfo() ?? {};
      if (token) {
        storeProjectSession(token, {
          ...existing,
          name: name.trim(),
          logo: imagePreview || logoUrl,
        });
      }

      toast({ title: "Hub updated", description: "Your hub profile has been saved." });
      setLocation("/studio-dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update hub.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const displayLogo = imagePreview || logoUrl || "/default-project-logo.png";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Back button + title */}
      <div className="w-full max-w-2xl flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/studio-dashboard")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-white">Hub Profile</h2>
      </div>

      <Card className="w-full max-w-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(138,63,252,0.08)]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 pb-8 border-b border-white/10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-purple-500/60 shadow-lg shadow-purple-500/10">
              <img src={displayLogo} alt="Hub Logo" className="w-full h-full object-cover" />
            </div>
            {isSuperAdmin && (
              <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] text-white/80 font-medium">Change</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">{name || "Untitled Hub"}</h3>
            {isSuperAdmin && (
              <p className="text-xs text-white/40 mt-1">Click the logo to upload a new image</p>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 pt-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium block">Hub Name</label>
            {isSuperAdmin ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter hub name"
                className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-purple-500/60 transition-colors"
              />
            ) : (
              <p className="text-white text-lg font-semibold">{name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60 font-medium">Description</label>
              {isSuperAdmin && (
                <span className={`text-xs ${descTooShort ? "text-red-400" : "text-white/30"}`}>
                  {description.length}/300
                </span>
              )}
            </div>
            {isSuperAdmin ? (
              <>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your hub or project (150–300 characters)"
                  maxLength={300}
                  className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 resize-none h-32 focus:border-purple-500/60 transition-colors"
                />
                {descTooShort && (
                  <p className="text-xs text-red-400">
                    Minimum 150 characters — {150 - description.length} more needed
                  </p>
                )}
              </>
            ) : (
              <p className="text-white/80 leading-relaxed">{description || "No description set."}</p>
            )}
          </div>
        </div>

        {/* Save button — superadmin only */}
        {isSuperAdmin && (
          <div className="flex justify-end pt-8 mt-2 border-t border-white/10">
            <Button
              onClick={handleSave}
              disabled={saving || descTooShort}
              className="bg-[#8a3ffc] hover:bg-[#7c3ce0] text-white gap-2 px-6 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="w-4 h-4" />Save Changes</>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
