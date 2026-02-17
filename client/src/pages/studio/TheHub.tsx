"use client";

import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";

export default function TheHub() {
  const [hubName, setHubName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    setImageFile(file);
    setImagePreview(reader.result); // Base64 string
  };
  reader.readAsDataURL(file);
};


const handleSubmit = () => {
  if (!hubName.trim()) {
    alert("Hub name is required");
    return;
  }

  if (!imageFile) {
    alert("Project logo is required");
    return;
  }

  const hubData = {
    hubName,
    description,
    imagePreview,
  };

  localStorage.setItem("hubData", JSON.stringify(hubData));

  window.location.href = "/connect-twitter";
};


  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10">

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome to Nexura Studio
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Setup a dedicated hub for your project or community on Nexura
          </p>
        </div>

        {/* Main Container */}
        <Card className="bg-gray-900 border-2 border-purple-500 rounded-3xl p-6 sm:p-8 space-y-8">

          {/* Intro */}
          <div>
            <CardTitle className="text-xl">
              You are ...
            </CardTitle>
          </div>

          {/* Horizontal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border border-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
  <img
    src="/project-icon.png"
    alt="Project icon"
    className="w-10 h-10"
  />

  <CardTitle className="text-lg">
    A project, app or ecosystem
  </CardTitle>

  <CardDescription className="text-white/60 max-w-xs">
    Perfect for building a centralized community hub for your dApp or protocol
  </CardDescription>
</Card>


            <Card className="relative bg-gray-800 border border-purple-500 rounded-2xl p-6 overflow-hidden">

  {/* Blurred content */}
  <div className="flex flex-col items-center justify-center text-center gap-3 blur-sm select-none">
    <img
      src="/members.png"
      alt="Engagement icon"
      className="w-10 h-10"
    />

    <CardTitle className="text-lg">
      Community Access
    </CardTitle>

    <CardDescription className="text-white/60 max-w-xs">
      Allow your team and community to collaborate securely.
    </CardDescription>
  </div>

  {/* Overlay */}
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-white font-semibold text-lg tracking-wide">
      Coming Soon
    </span>
  </div>
</Card>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <CardTitle className="text-lg">Hub Name</CardTitle>
            <Input
  value={hubName}
  onChange={(e) => setHubName(e.target.value)}
  placeholder="Enter your hub name..."
  className="bg-gray-800 border-purple-500 text-white"
/>
          </div>

          {/* Description */}
          <div className="space-y-2 relative">
            <CardTitle className="text-lg">Description</CardTitle>
            <Textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Describe your project or community"
  maxLength={200}
  className="bg-gray-800 border-purple-500 text-white resize-none h-32"
/>
            <span className="absolute bottom-2 right-3 text-xs text-white/40">
              200
            </span>
          </div>

          {/* Logo Upload */}
<div className="space-y-3 w-full">
  <CardTitle className="text-lg text-center">Project Logo</CardTitle>

  <label className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-gray-800 hover:border-purple-400 transition cursor-pointer block">
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />

    {imagePreview ? (
      <div className="flex flex-col items-center gap-3">
        <img
          src={imagePreview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-xl"
        />
        <p className="text-sm text-white/60">Click to change image</p>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center text-center gap-2 text-white/60">
        <img
          src="/upload-icon.png"
          alt="Upload icon"
          className="w-16 h-16"
        />
        <p className="font-medium text-white">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-white/50">
          SVG, PNG, JPG or GIF (max. 10MB)
        </p>
      </div>
    )}
  </label>
</div>

          {/* Action */}
<div className="pt-4">
<Button
  className="w-full bg-purple-500 hover:bg-purple-600"
  onClick={handleSubmit}
>
  Save & Continue
</Button>
</div>
        </Card>
      </div>
    </div>
  );
}