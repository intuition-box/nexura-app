"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { ArrowLeft, Camera, Loader2, Save, Globe, Twitter } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "../../hooks/use-toast";
import {
  projectApiRequest,
  getStoredProjectInfo,
  getStoredProjectToken,
  storeProjectSession,
  base64ToBlob,
} from "../../lib/projectApi";
import { beginStudioDiscordConnect } from "../../lib/studioDiscord";

export default function HubProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [xAccount, setXAccount] = useState("");
  const [discordServer, setDiscordServer] = useState("");
  const [discordConnected, setDiscordConnected] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnectingDiscord, setDisconnectingDiscord] = useState(false);
  const [showDisconnectWarning, setShowDisconnectWarning] = useState(false);

  const info = getStoredProjectInfo();
  const isSuperAdmin = (info?.role ?? "admin") === "superadmin";

  // Fetch current hub data
  useEffect(() => {
    projectApiRequest<{ hub: Record<string, any> }>({ method: "GET", endpoint: "/hub/me" })
      .then(({ hub }) => {
        if (hub) {
          setName(hub.name ?? "");
          setDescription(hub.description ?? "");
          setWebsite(hub.website ?? "");
          setXAccount(hub.xAccount ?? "");
          setDiscordServer(hub.discordServer ?? "");
          setDiscordConnected(Boolean(hub.discordConnected));
          setLogoUrl(hub.logo ?? "");
        }
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load project info.", variant: "destructive" });
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
      toast({ title: "Missing name", description: "Project name is required.", variant: "destructive" });
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
      fd.append("website", website.trim());
      fd.append("xAccount", xAccount.trim());

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

      toast({ title: "Project updated", description: "Your project profile has been saved." });
      setLocation("/studio-dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update project.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const disconnectDiscord = async () => {
    setDisconnectingDiscord(true);
    try {
      await projectApiRequest({ method: "PATCH", endpoint: "/hub/disconnect-discord" });

      const token = getStoredProjectToken();
      const existing = getStoredProjectInfo() ?? {};
      if (token) {
        storeProjectSession(token, {
          ...existing,
          discordSessionId: "",
        });
      }

      setDiscordConnected(false);
      setDiscordServer("");
      setShowDisconnectWarning(false);
      toast({ title: "Discord disconnected", description: "You can reconnect Discord any time from this profile." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to disconnect Discord.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDisconnectingDiscord(false);
    }
  };

  const handleDiscordButtonClick = async () => {
    if (!discordConnected) {
      beginStudioDiscordConnect("/studio-dashboard/hub-profile");
      return;
    }

    setShowDisconnectWarning(true);
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
      <AlertDialog
        open={showDisconnectWarning}
        onOpenChange={(open) => {
          if (!disconnectingDiscord) setShowDisconnectWarning(open);
        }}
      >
        <AlertDialogContent className="border border-white/10 bg-[#140d24] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Discord?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Discord is optional for the studio overall, but disconnecting it can stop users from completing any Discord tasks tied to this project. If a live campaign with Discord tasks is already running, you will need to reconnect the same Discord server before that campaign ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={disconnectingDiscord}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={disconnectingDiscord}
              onClick={(event) => {
                event.preventDefault();
                void disconnectDiscord();
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {disconnectingDiscord ? "Disconnecting..." : "Proceed anyway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        <h2 className="text-2xl font-bold text-white">Project Profile</h2>
      </div>

      <Card className="w-full max-w-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(138,63,252,0.08)]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 pb-8 border-b border-white/10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-purple-500/60 shadow-lg shadow-purple-500/10">
              <img src={displayLogo} alt="Project Logo" className="w-full h-full object-cover" />
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
            <h3 className="text-lg font-semibold text-white">{name || "Untitled Project"}</h3>
            {isSuperAdmin && (
              <p className="text-xs text-white/40 mt-1">Click the logo to upload a new image</p>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 pt-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium block">Project Name</label>
            {isSuperAdmin ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
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
                  placeholder="Describe your project (150–300 characters)"
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

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium block">Project Website (Optional)</label>
            {isSuperAdmin ? (
              <div className="relative">
                <Globe className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-purple-500/60 transition-colors pl-10"
                />
              </div>
            ) : (
              <p className="text-white/80">{website || "Not set"}</p>
            )}
          </div>

          {/* X Account */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium block">X Account (Optional)</label>
            {isSuperAdmin ? (
              <div className="relative">
                <Twitter className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={xAccount}
                  onChange={(e) => setXAccount(e.target.value)}
                  placeholder="@project_handle"
                  className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus:border-purple-500/60 transition-colors pl-10"
                />
              </div>
            ) : (
              <p className="text-white/80">{xAccount || "Not set"}</p>
            )}
          </div>

          {/* Connected Discord Server */}
          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium block">Connected Discord Server</label>
            <div className="bg-white/[0.06] border border-white/15 text-white rounded-md px-3 py-2 text-sm">
              {discordConnected
                ? (discordServer || "Connected")
                : "Not connected"}
            </div>
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium block">Discord Verification</label>
              <Button
                type="button"
                onClick={() => void handleDiscordButtonClick()}
                disabled={disconnectingDiscord}
                className={discordConnected ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#8B3EFE] hover:bg-[#7b35e6] text-white"}
              >
                {disconnectingDiscord
                  ? "Disconnecting..."
                  : discordConnected
                    ? "Disconnect Discord"
                    : "Connect Discord"}
              </Button>
              <p className="text-xs leading-relaxed text-white/55">
                To enable auto validation of Discord tasks, add the Nexura Guide Bot and grant it Admin permission.
                Nexura does not have access to or control over your server. The bot is used only to validate tasks and requires these permissions, just like other Discord bots.
              </p>
            </div>
          )}
        </div>

        {/* Save button — superadmin only */}
        {isSuperAdmin && (
          <div className="flex justify-end pt-8 mt-2 border-t border-white/10">
            <Button
              onClick={handleSave}
              disabled={saving || descTooShort}
              className="bg-[#8B3EFE] hover:bg-[#7b35e6] text-white gap-2 px-6 disabled:opacity-50"
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
