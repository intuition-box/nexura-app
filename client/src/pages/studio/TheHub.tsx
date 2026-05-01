"use client";

import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link, useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { projectApiRequest, storeProjectSession, getStoredProjectToken, getStoredProjectInfo, base64ToBlob } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";
import { Globe, Twitter } from "lucide-react";
import { setStudioDiscordReturnPath } from "../../lib/studioDiscord";
import { storeUserSession } from "../../lib/userSession";

export default function TheHub() {
  const [hubName, setHubName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [xAccount, setXAccount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"project" | "community">("project");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(file);
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!hubName.trim()) {
      toast({ title: "Missing Project Name", description: "Please enter a project name.", variant: "destructive" });
      return;
    }

    if (description.length > 0 && description.length < 150) {
      toast({ title: "Description too short", description: "Minimum 150 characters required.", variant: "destructive" });
      return;
    }

    if (!imageFile) {
      toast({ title: "Missing Logo", description: "Please upload a project logo.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", hubName.trim());
      fd.append("description", description ?? "");
      fd.append("website", website.trim());
      fd.append("xAccount", xAccount.trim());

      if (imagePreview) {
        const blob = base64ToBlob(imagePreview);
        fd.append("logo", blob, "logo.png");
      }

      await projectApiRequest({ method: "POST", endpoint: `/hub/create-hub`, formData: fd });

      const token = getStoredProjectToken();
      const existingInfo = getStoredProjectInfo() ?? {};
      if (token) {
        storeProjectSession(token, {
          ...existingInfo,
          name: hubName.trim(),
          logo: imagePreview ?? "",
        });
      }

      setStudioDiscordReturnPath("/studio-dashboard");
      setLocation("/studio-dashboard/connect-discord");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-up failed. Please try again.";
      toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

// const handleUserSubmit = async () => {
//   if (!username.trim()) {
//     toast({
//       title: "Missing username",
//       description: "Please enter a username.",
//       variant: "destructive",
//     });
//     return;
//   }

//   try {
//     const res = await userApiRequest<{
//       token: string;
//       user: {
//         username: string;
//         bio: string;
//         avatar?: string;
//       };
//     }>({
//       method: "POST",
//       endpoint: "/user/create-user",
//       data: {
//         username: username.trim(),
//         bio,
//       },
//       auth: false,
//     });

//     storeUserSession({
//       type: "user",
//       role: "user",
//       token: res.token,
//       username: res.user.username,
//       bio: res.user.bio,
//       avatar: res.user.avatar || imagePreview,
//     });

//     setLocation("/user-dashboard/user-profile");
//   } catch (err: any) {
//     toast({
//       title: "User creation failed",
//       description: err?.message || "Please try again.",
//       variant: "destructive",
//     });
//   }
// };

const handleUserSubmit = async () => {
  if (!username.trim()) {
    toast({
      title: "Missing username",
      description: "Please enter a username.",
      variant: "destructive",
    });
    return;
  }

  const userSession = {
    type: "user",
    role: "user",
    sessionId: crypto.randomUUID(),
    username: username.trim(),
    bio: bio || "",
    avatar: imagePreview || "",
  };

  storeUserSession(userSession);

  setLocation("/user-dashboard/user-profile");
};

  const [bio, setBio] = useState("");

const wordCount = bio.trim() === "" ? 0 : bio.trim().split(/\s+/).length;
const remainingWords = 200 - wordCount;

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-xl mx-auto relative z-10 space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">
            Welcome to Nexura Studio
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Set up a dedicated project space for your project or community on Nexura
          </p>
        </div>

        <Card className="bg-gray-900 border-2 border-purple-500 rounded-3xl p-5 sm:p-6 space-y-5">

          <div>
            <CardTitle className="text-sm">
              You are ...
            </CardTitle>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <button
              type="button"
              onClick={() => setActiveTab("project")}
              className={`bg-gray-800 border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition
              ${activeTab === "project" ? "border-[#8B3EFE] scale-[1.02]" : "border-purple-500 opacity-70"}`}
            >
              <img src="/project-icon.png" alt="Project icon" className="w-10 h-10" />

              <CardTitle className="text-lg">
                a project
              </CardTitle>

              <CardDescription className="text-white/60 max-w-xs">
                A project or team looking to plan, launch, and grow structured community engagement.
              </CardDescription>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("community")}
              className={`bg-gray-800 border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition
              ${activeTab === "community" ? "border-[#8B3EFE] scale-[1.02]" : "border-purple-500 opacity-70"}`}
            >
              <img src="/single-user.png" alt="User icon" className="w-10 h-10" />

              <CardTitle className="text-lg">
                a Nexura user
              </CardTitle>

              <CardDescription className="text-white/60 max-w-xs">
                An individual creator or contributor looking to share ideas, participate in campaigns, and connect within Nexura.
              </CardDescription>
            </button>
          </div>

          {/* PROJECT FLOW */}
          {activeTab === "project" && (
            <>
              <div className="space-y-2">
                <CardTitle className="text-xs">Project Name</CardTitle>
                <Input
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  placeholder="Enter your Project Name..."
                  className="bg-gray-800 border-purple-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs">Description</CardTitle>
                  <span className={`text-xs ${description.length > 0 && description.length < 150 ? "text-red-400" : "text-white/40"}`}>
                    {description.length}/300
                  </span>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project or community (150–300 characters)"
                  maxLength={300}
                  className="bg-gray-800 border-purple-500 text-white resize-none h-32"
                />
                {description.length > 0 && description.length < 150 && (
                  <p className="text-xs text-red-400">
                    Minimum 150 characters — {150 - description.length} more needed
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <CardTitle className="text-xs">Project Links (Optional)</CardTitle>
                <div className="relative">
                  <Globe className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Project website (e.g. https://example.com)"
                    className="bg-gray-800 border-purple-500 text-white pl-10"
                  />
                </div>
                <div className="relative">
                  <Twitter className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={xAccount}
                    onChange={(e) => setXAccount(e.target.value)}
                    placeholder="X account (e.g. @myproject or https://x.com/myproject)"
                    className="bg-gray-800 border-purple-500 text-white pl-10"
                  />
                </div>
                <p className="text-xs text-white/50">
                  Discord server is now set through Discord connection after this step.
                </p>
              </div>

              <div className="space-y-3 w-full">
                <CardTitle className="text-xs text-center">Project Logo</CardTitle>

                <label className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-black hover:border-[#8B3EFE] transition cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                      <p className="text-xs text-white/60">Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-2 text-white/60">
                      <img src="/upload-icon.png" alt="Upload icon" className="w-16 h-16" />
                      <p className="font-medium text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-white/50">
                        SVG, PNG, JPG or GIF (max. 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full bg-[#8B3EFE] border-0 text-white hover:bg-[#8B3EFE] hover:shadow-[0_0_28px_rgba(131,58,253,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Creating Project..." : "Create Project"}
                </Button>
              </div>
            </>
          )}

          {/* USER FLOW */}
          {activeTab === "community" && (
            <>
              <div className="space-y-2">
                <CardTitle className="text-xs">Username</CardTitle>
                <Input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter your name..."
  className="bg-gray-800 border-purple-500 text-white"
/>
              </div>

<div className="space-y-2">
  <div className="flex items-center justify-between text-xs">
    <CardTitle className="text-xs">Short bio</CardTitle>
    <span className={`text-xs ${wordCount >= 200 ? "text-red-400" : "text-white/40"}`}>
      {wordCount}/200
    </span>
  </div>

  <Textarea
    value={bio}
    onChange={(e) => {
      const text = e.target.value;
      const words = text.trim().split(/\s+/);

      if (words.length <= 200) {
        setBio(text);
      } else {
        setBio(words.slice(0, 200).join(" "));
      }
    }}
    placeholder="Tell us about yourself (max 200 words)"
    className={`bg-gray-800 border-purple-500 text-white resize-none h-24 text-xs ${
      wordCount >= 200 ? "border-red-500 focus:ring-red-500" : ""
    }`}
  />

  {wordCount >= 200 && (
    <p className="text-xs text-red-400">
      Word limit reached — you cannot add more than 200 words.
    </p>
  )}
</div>

              <div className="space-y-3 w-full">
                <CardTitle className="text-xs text-center">Avatar</CardTitle>

                <label className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-black hover:border-[#8B3EFE] transition cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                      <p className="text-xs text-white/60">Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-2 text-white/60">
                      <img src="/upload-icon.png" alt="Upload icon" className="w-16 h-16" />
                      <p className="font-medium text-xs text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-white/50">
                        SVG, PNG, JPG or GIF (max. 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">

  {/* Back Button */}
  <button
    type="button"
    onClick={() => setActiveTab("project")}
    className="bg-[#1B1032] text-white px-5 py-2 rounded-xl border border-[#7E39E6] hover:opacity-90 transition text-xs"
  >
    Back
  </button>

  {/* Save & Continue */}
<button
  type="button"
  onClick={handleUserSubmit}
  className="bg-[#8B3EFE] text-white px-5 py-2 rounded-xl hover:opacity-90 transition text-xs"
>
  Save and Continue
</button>

</div>
            </>
          )}

        </Card>
      </div>
    </div>
  );
}