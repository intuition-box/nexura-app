"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Camera, Loader2, Save, Pencil } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "../../hooks/use-toast";
import {
  projectApiRequest,
  base64ToBlob,
} from "../../lib/projectApi";
import {
  getStoredUserSession,
  storeUserSession,
} from "../../lib/userSession";

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const user = getStoredUserSession();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

//   useEffect(() => {
//   if (user?.type === "user") {
//     setName(user.username || "");
//     setBio(user.bio || "");
//     setImagePreview(user.avatar || "");
//   }

//   userApiRequest<{ user: any }>({
//     method: "GET",
//     endpoint: "/user/me",
//   })
//     .then(({ user }) => {
//       if (user) {
//         setName(user.name ?? "");
//         setBio(user.bio ?? "");
//         setImagePreview(user.avatar ?? "");
//       }
//     })
//     .catch(() => {
//       toast({
//         title: "Error",
//         description: "Failed to load profile.",
//         variant: "destructive",
//       });
//     })
//     .finally(() => setLoading(false));
// }, []);

useEffect(() => {
  const user = getStoredUserSession();

  if (user?.type === "user") {
    setName(user.username || "");
    setBio(user.bio || "");
    setImagePreview(user.avatar || "");
  }

  setLoading(false);
}, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
  if (!name.trim()) {
    toast({
      title: "Missing name",
      description: "Name is required.",
      variant: "destructive",
    });
    return;
  }

  setSaving(true);

  try {
    const currentUser = getStoredUserSession(); // 🔥 ALWAYS FRESH READ

    const updatedUser = {
      ...currentUser,
      type: "user",
      role: "user",
      username: name.trim(),
      bio: bio || "",
      avatar: imagePreview || currentUser?.avatar || "",
    };

    storeUserSession(updatedUser);

    window.dispatchEvent(new Event("user-session-update"));

    toast({
      title: "Profile updated",
      description: "Your profile has been saved.",
    });

    setIsEditing(false);
  } catch (err: any) {
    toast({
      title: "Error",
      description: err?.message || "Failed to update profile.",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">User Profile</h2>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-white/20 text-white"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Card className="w-full max-w-2xl bg-white/[0.04] border border-white/10 rounded-2xl p-8">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 pb-8 border-b border-white/10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20">
              <img
                src={imagePreview || "/default-avatar.png"}
                className="w-full h-full object-cover"
              />
            </div>

            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full">
                <Camera className="text-white" />
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6 pt-8">

          {/* Name */}
          <div>
            <label className="text-sm text-white/60">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className="bg-white/[0.06] text-white"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm text-white/60">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              className="bg-white/[0.06] text-white h-28"
              placeholder="Tell people about yourself"
            />
          </div>
        </div>

        {/* Save */}
        {isEditing && (
          <div className="flex justify-end pt-8 border-t border-white/10 mt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#8B3EFE]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}

      </Card>
    </div>
  );
}