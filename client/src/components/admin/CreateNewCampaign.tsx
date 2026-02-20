"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import React from "react"
import { Card, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Link } from "wouter";
import StudioSidebar from "../../pages/studio/StudioSidebar";
import AnimatedBackground from "../AnimatedBackground";
import { projectApiRequest } from "../../lib/projectApi";
import { useToast } from "../../hooks/use-toast";
import {
  Calendar,
  Clock,
  ImageIcon,
  FileText,
  ListChecks,
  Eye,
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  rewardPool?: string;
  participants?: string;
  xpRewards?: string;
  coverImage?: string;
  tasks: any[];
  isDraft: boolean;
  createdAt: string;
}


export default function CreateNewCampaigns() {
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showTasks, setShowTasks] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [validationType, setValidationType] = useState("manual");
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]); 
  const [newTask, setNewTask] = useState({
  type: "",
  platform: "",
  handleOrUrl: "",
  description: "",
  evidence: "",
  validation: "Manual Validation",
});
const [editingIndex, setEditingIndex] = useState<number | null>(null);
const [error, setError] = useState("");
const [showPublishModal, setShowPublishModal] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [campaignName, setCampaignName] = useState("");
const [campaignTitle, setCampaignTitle] = useState("");

const [startDate, setStartDate] = useState("");
const [startTime, setStartTime] = useState("");
const [endDate, setEndDate] = useState("");
const [endTime, setEndTime] = useState("");
const [imagePreview, setImagePreview] = useState<string | null>(null);

const [coverImage, setCoverImage] = useState<File | null>(null); // raw file
const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null); // for <img>


const [rewardPool, setRewardPool] = useState("");
const [participants, setParticipants] = useState("");
const [xpRewards, setXpRewards] = useState("");
const [publishedCampaign, setPublishedCampaign] = useState<any | null>(null);
const [txHash, setTxHash] = useState("");

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
};


const buildCampaignFormData = (isDraft: boolean): FormData => {
  const fd = new FormData();
  fd.append("title", campaignTitle);
  fd.append("description", campaignName);
  fd.append("nameOfProject", campaignName);
  fd.append("starts_at", startDate && startTime ? `${startDate}T${startTime}` : startDate);
  fd.append("ends_at", endDate && endTime ? `${endDate}T${endTime}` : endDate);
  fd.append("reward", JSON.stringify({ xp: Number(xpRewards) || 0, pool: Number(rewardPool) || 0 }));
  if (coverImage instanceof File) fd.append("coverImage", coverImage);
  if (isDraft) fd.append("isDraft", "true");
  return fd;
};

const handleSaveDraft = async (thenNavigate?: string) => {
  if (!campaignTitle) {
    toast({ title: "Missing title", description: "Please enter a campaign title.", variant: "destructive" });
    return;
  }
  setSaveLoading(true);
  try {
    const fd = buildCampaignFormData(true);
    const params: Record<string, string> = {};
    if (campaignId) params.id = campaignId;
    const res = await projectApiRequest<{ campaignId?: string; message?: string }>({
      method: "PATCH",
      endpoint: "/project/save-campaign",
      formData: fd,
      params,
    });
    if (res.campaignId) setCampaignId(res.campaignId);
    toast({ title: "Campaign saved!", description: "Draft saved successfully." });
    if (thenNavigate) setActiveTab(thenNavigate);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save campaign.";
    toast({ title: "Save failed", description: msg, variant: "destructive" });
  } finally {
    setSaveLoading(false);
  }
};

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setCoverImage(file); // Save the File

  const reader = new FileReader();
  reader.onload = () => {
    setImagePreview(reader.result as string); // Base64 string for preview
  };
  reader.readAsDataURL(file);
};


const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};




const handleSaveTask = () => {
  if (!newTask.type || !newTask.platform || !newTask.handleOrUrl || !newTask.description) {
    return setError("All fields are required.");
  }

  if (editingIndex !== null) {
    const updatedTasks = [...tasks];
    updatedTasks[editingIndex] = newTask;
    setTasks(updatedTasks);
    setEditingIndex(null);
  } else {
    setTasks([...tasks, newTask]);
  }

  setNewTask({ type: "", platform: "", handleOrUrl: "", description: "", evidence: "", validation: "Manual Validation" });
  setShowModal(false);
  setError("");
};



const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setCoverImage(file); // keep the file

  const reader = new FileReader();
  reader.onload = () => setCoverImagePreview(reader.result as string); // preview
  reader.readAsDataURL(file);
};



const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  handleSaveDraft("tasks");
};

const isActive =
  publishedCampaign &&
  new Date(publishedCampaign.endDate) > new Date();



  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="relative z-10 flex h-screen">
        <AnimatedBackground />

<StudioSidebar
  activeTab="campaignsTab"
  setActiveTab={(tab) => {
    if (tab === "campaignSubmissions") setLocation("/studio-dashboard");
    if (tab === "campaignsTab") setLocation("/studio-dashboard/create-new-campaign");
    if (tab === "adminManagement") setLocation("/studio-dashboard");
  }}
/>


        <div className="flex-1 flex flex-col overflow-hidden backdrop-blur-xl">
          <main className="flex-1 overflow-y-auto p-8 text-white">
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold">Create New Campaign</h1>
                <p className="text-white/60 mt-2">
                  Launch your next campaign and grow your community with tailored rewards.
                </p>
              </div>

{/* Tabs */}
<div className="flex gap-8 border-b border-white/10">

  {/* Details */}
  <button
    onClick={() => setActiveTab("details")}
    className="flex-1 flex flex-col items-start justify-start gap-2 py-5 text-lg font-semibold transition"
  >
    {/* Underline on top */}
    <span
      className={`block h-[4px] w-full rounded-full transition-colors ${
        activeTab === "details" ? "bg-purple-500" : "bg-white/20"
      }`}
    />
    <div className="flex items-center gap-2 text-white/80 hover:text-white">
      <img src="/details.png" alt="Tasks" className="w-5 h-5" />
      <span className={`${activeTab === "details" ? "text-purple-400" : ""}`}>
        Details
      </span>
    </div>
  </button>


  {/* Tasks */}
  <button
    onClick={() => setActiveTab("tasks")}
    className="flex-1 flex flex-col items-start justify-start gap-2 py-5 text-lg font-semibold transition"
  >
    {/* Underline on top */}
    <span
      className={`block h-[4px] w-full rounded-full transition-colors ${
        activeTab === "tasks" ? "bg-purple-500" : "bg-white/20"
      }`}
    />
    <div className="flex items-center gap-2 text-white/80 hover:text-white">
      <img src="/tasks.png" alt="Tasks" className="w-5 h-5" />
      <span className={`${activeTab === "tasks" ? "text-purple-400" : ""}`}>
        Tasks
      </span>
    </div>
  </button>

  {/* Review */}
  <button
    onClick={() => setActiveTab("review")}
    className="flex-1 flex flex-col items-start justify-start gap-2 py-5 text-lg font-semibold transition"
  >
    {/* Underline on top */}
    <span
      className={`block h-[4px] w-full rounded-full transition-colors ${
        activeTab === "review" ? "bg-purple-500" : "bg-white/20"
      }`}
    />
    <div className="flex items-center gap-2 text-white/80 hover:text-white">
      <img src="/review.png" alt="Review" className="w-5 h-5" />
      <span className={`${activeTab === "review" ? "text-purple-400" : ""}`}>
        Review
      </span>
    </div>
  </button>
          </div>

              <h2 className="text-xl font-semibold">Campaign Details</h2>

              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <Card className="bg-purple/10 backdrop-blur-md p-8 space-y-8">

                  <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Campaign Name */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Campaign Name
                      </label>
                      <Input
  placeholder="Enter campaign name..."
  className="bg-white/5 border-white/10"
  required
  value={campaignName}
  onChange={(e) => setCampaignName(e.target.value)}
/>
                    </div>

                    {/* Campaign Title */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Campaign Title
                      </label>
<Input
  placeholder="Enter campaign title..."
  className="bg-white/5 border-white/10"
  required
  value={campaignTitle}
  onChange={(e) => setCampaignTitle(e.target.value)}
/>
                      <p className="text-xs text-white/50 mt-2">
                        Keep it clear and practical.
                      </p>
                    </div>

                    {/* Dates & Times */}
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm mb-2">
                          <Calendar className="w-4 h-4" />
                          Start Date
                        </label>
                        <Input
  type="date"
  className="bg-white/5 border-white/10"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
/>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          Start Time
                        </label>
                        <Input
  type="time"
  className="bg-white/5 border-white/10"
  value={startTime}
  onChange={(e) => setStartTime(e.target.value)}
/>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm mb-2">
                          <Calendar className="w-4 h-4" />
                          End Date
                        </label>
                        <Input
  type="date"
  className="bg-white/5 border-white/10"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
/>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          End Time
                        </label>
                        <Input
  type="time"
  className="bg-white/5 border-white/10"
  value={endTime}
  onChange={(e) => setEndTime(e.target.value)}
/>
                      </div>
                      <p className="text-xs text-white/50 -mt-2">
                        Set the duration of the campaign in UTC. 
                      </p>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="flex items-center gap-2 text-sm mb-3">
                        <ImageIcon className="w-4 h-4" />
                        Cover Image
                      </label>
<div
  className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-gray-900 hover:border-purple-400 transition cursor-pointer"
  onClick={() => document.getElementById("coverInput").click()}
>
<label className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-gray-800 hover:border-purple-400 transition cursor-pointer block">
  <input
  type="file"
  accept="image/*"
  onChange={handleCoverImage}
  className="hidden"
/>


  {coverImagePreview ? (
  <div className="flex flex-col items-center gap-3">
    <img
      src={coverImagePreview} // ✅ Base64 preview string
      alt="Preview"
      className="w-32 h-32 object-cover rounded-xl"
    />
    <p className="text-sm text-white/60">Click to change image</p>
  </div>
) : (
  <div className="flex flex-col items-center justify-center text-center gap-2">
    <img src="/upload-icon.png" alt="Upload icon" className="w-16 h-16" />
    <p className="font-medium text-white">Click to upload or drag and drop</p>
    <p className="text-sm text-white/50">SVG, PNG, JPG or GIF (max. 10MB)</p>
  </div>
)}
</label>


</div>

                    </div>

                    {/* Rewards */}
<div className="grid grid-cols-3 gap-6">
<div>
  <label className="block mb-2 text-sm font-medium">
    Reward Pool (Optional)
  </label>

  <div className="relative">
    {/* Prefix */}
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-semibold">
      $TRUST
    </span>

    <Input
  type="number"
  className="bg-white/5 border-white/10 pl-20"
  placeholder="0"
  value={rewardPool}
  onChange={(e) => setRewardPool(e.target.value)}
/>
  </div>
</div>

                      <div className="relative">
  <label className="block mb-2 text-sm font-medium">
    Number of Participants
  </label>
  
  <div className="relative">
    {/* Icon inside input */}
    <img
      src="/ref-icon.png"
      alt="Members Icon"
      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
    />

    <Input
  type="number"
  placeholder="Enter number of participants"
  className="bg-white/5 border-white/10 pl-10"
  value={participants}
  onChange={(e) => setParticipants(e.target.value)}
/>
  </div>
</div>

                      <div>
  <label className="block mb-2 text-sm font-medium">
    XP Rewards
  </label>
  <Input
  type="number"
  placeholder="200 XP per participant"
  className="bg-white/5 border-white/10"
  value={xpRewards}
  onChange={(e) => setXpRewards(e.target.value)}
/>
</div>
                    </div>

                    {/* Disclaimer */}
                    
                                <div className="flex items-start gap-3 bg-gray-800 p-4 rounded-lg mt-2">
                      {/* Info icon */}
                      <div className="flex-shrink-0 text-blue-400 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 110-17 8.5 8.5 0 010 17z" />
                        </svg>
                      </div>
                      {/* Text */}
                      <CardDescription className="text-white/60 text-sm">
                        Disclaimer: If you want to provide rewards for this campaign, please reach out to Nexura via Discord.
                      </CardDescription>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                      <Link href="/studio-dashboard">
                        <Button variant="ghost" className="text-white/60 hover:text-white">
                          Cancel
                        </Button>
                      </Link>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/5"
                          onClick={() => handleSaveDraft()}
                          disabled={saveLoading}
                        >
                          {saveLoading ? "Saving..." : "Save"}
                        </Button>

                        <Button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={loading || saveLoading}
                        >
                          {loading || saveLoading ? "Saving..." : "Save & Next"}
                        </Button>
                      </div>
                    </div>

                  </form>
                </Card>
              )}

{/* TASKS TAB */}
{activeTab === "tasks" && (
  <div className="relative">

    {/* Small Add Task Button - Top Right */}
    <button
      onClick={() => setShowModal(true)}
      className="absolute -top-10 right-0 px-3 py-1 bg-purple-800 text-purple-300 hover:bg-purple-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
    >
      <span className="flex items-center justify-center w-3 h-3 pb-1 bg-purple-400 text-purple-900 rounded-full text-xs font-bold">
        +
      </span>
      Add Task
    </button>

    {tasks.length === 0 ? (
      <div
        className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-gray-900 hover:border-purple-400 transition cursor-pointer mt-8"
        onClick={() => setShowModal(true)}
      >
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <img src="/upload-icon.png" alt="Upload icon" className="w-16 h-16" />
          <p className="font-medium text-white">Create a Campaign Task</p>
          <p className="text-sm text-white/50">
            To create a campaign, you need to add at least one task.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 flex items-center justify-center gap-2 px-4 py-1 bg-purple-900 text-purple-400 hover:bg-purple-700 font-semibold rounded-lg transition"
          >
            <span className="flex items-center justify-center w-3 h-3 pb-1 bg-purple-400 text-purple-900 rounded-full text-lg font-bold">
              +
            </span>
            Add Task
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-4 mt-8">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-lg border-2 border-purple-500 px-4 py-3 bg-white/5"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full text-white font-semibold">
              {index + 1}
            </div>

            <p className="flex-1 text-white">{task.type}</p>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                onClick={() => {
                  setNewTask(task);
                  setShowModal(true);
                  setEditingIndex(index);
                }}
              >
                Edit
              </button>

              <button
                className="px-3 py-1 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition"
                onClick={() => {
                  const updatedTasks = tasks.filter((_, i) => i !== index);
                  setTasks(updatedTasks);
                }}
              >
                <img src="/delete.png" alt="Delete" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}


{/* ===== MODAL ===== */}
{showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
    <div className="bg-purple-950 w-[650px] p-6 rounded-2xl relative shadow-xl">

      {/* Close Button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-4 text-white text-xl"
      >
        ×
      </button>

      <h2 className="text-xl font-semibold text-white mb-6">
        Add New Task
      </h2>

      {/* TOP SECTION */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Task Type */}
        <div>
          <label className="text-sm text-white/70 mb-2 block">Task Type</label>
          <select
            className="w-full p-2 rounded-lg bg-purple-900 text-white border border-purple-800 focus:outline-none focus:border-purple-500"
            value={newTask.type}
            onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
          >
            <option value="">Select task</option>
            <option value="Comment on our X post">Comment on X</option>
            <option value="Follow us on X">Follow on X</option>
            <option value="Join Us On Discord">Join Discord</option>
            <option value="Check Out the Portal Claims">Portal Claims</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="text-sm text-white/70 mb-2 block">Platform</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNewTask({ ...newTask, platform: "Twitter" })}
              className={`flex-1 border py-2 rounded-lg transition ${
                newTask.platform === "Twitter"
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-purple-900 border-purple-800 text-white hover:border-purple-500"
              }`}
            >
              Twitter
            </button>
            <button
              type="button"
              onClick={() => setNewTask({ ...newTask, platform: "Discord" })}
              className={`flex-1 border py-2 rounded-lg transition ${
                newTask.platform === "Discord"
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-purple-900 border-purple-800 text-white hover:border-purple-500"
              }`}
            >
              Discord
            </button>
          </div>
        </div>
      </div>

      {/* TASK DETAILS CARD */}
      <div className="bg-purple-900 p-5 rounded-xl mb-6 border border-purple-800">

        {/* Handle or URL */}
        <div className="mb-4">
          <label className="text-sm text-white/70 mb-2 block">Handle or URL</label>
          <input
            type="text"
            placeholder="..."
            value={newTask.handleOrUrl}
            onChange={(e) =>
              setNewTask({ ...newTask, handleOrUrl: e.target.value })
            }
            className="w-full p-2 rounded-lg bg-purple-950 text-white border border-purple-800 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Task Description */}
        <div className="mb-4">
          <label className="text-sm text-white/70 mb-2 block">Task Description</label>
          <input
            type="text"
            placeholder="..."
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full p-2 rounded-lg bg-purple-950 text-white border border-purple-800 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Evidence + Validation */}
        <div className="grid grid-cols-2 gap-6">
          {/* Evidence Upload */}
          <div>
            <label className="text-sm text-white/70 mb-2 block">Evidence Upload Management</label>
            <select
              className="w-full p-2 rounded-lg bg-purple-950 text-white border border-purple-800 focus:outline-none focus:border-purple-500"
              value={newTask.evidence}
              onChange={(e) =>
                setNewTask({ ...newTask, evidence: e.target.value })
              }
            >
              <option value="">Select option</option>
            </select>
          </div>

          {/* Validation Type */}
          <div>
            <label className="text-sm text-white/70 mb-2 block">Validation Type</label>
            <div className="relative">
              <input
                type="text"
                value={newTask.validation}
                readOnly
                className="w-full p-2 rounded-lg bg-purple-950 text-white border border-purple-800 focus:outline-none focus:border-purple-500 pr-10"
              />
              <img
                src="/purple-check.png"
                alt="Verified"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
              />
            </div>
          </div>
        </div>

      </div>

      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-between">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2 rounded-lg bg-purple-800 hover:bg-purple-700 text-white transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveTask}
          className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
        >
          Save Task
        </button>
      </div>
    </div>
  </div>
)}


{activeTab === "review" && (
  <Card className="p-8 space-y-6 bg-white/10 backdrop-blur-md">
    <h2 className="text-2xl font-bold mb-4">Final Campaign Review</h2>

    {/* Campaign Board */}
    <div className="flex gap-6 rounded-lg border-2 border-purple-500 p-6 bg-white/5">
      {/* Left side: image */}
      <div className="w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
        {coverImage ? (
          <img
  src={coverImagePreview || undefined}
  alt="Campaign Cover"
  className="w-full h-full object-cover"
/>

        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
            No Image
          </div>
        )}
      </div>

      {/* Right side: title and description */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {campaignTitle || campaignName || "Untitled Campaign"}
          </h3>
          <p className="text-white/70 mt-1">
            {campaignName || "No description provided"}
          </p>
          {/* Optional: you can include a project/handle here if needed */}
        </div>

        {/* Bottom info as blocks */}
        <div className="flex mt-4 text-white/80 border border-white/10 rounded-lg overflow-hidden">
          {/* Duration */}
          <div className="flex-1 flex flex-col items-center p-4 border-r border-white/10">
            <div className="flex items-center gap-2">
              <img src="/duration.png" alt="Duration Icon" className="w-5 h-5" />
              <span className="font-semibold">Duration</span>
            </div>
            <span className="text-white mt-1">
  {startDate && endDate
    ? `${formatDate(startDate)} ${startTime} – ${formatDate(endDate)} ${endTime}`
    : "Not set"}
</span>
          </div>

          {/* Reward Pool */}
          <div className="flex-1 flex flex-col items-center p-4 border-r border-white/10">
            <div className="flex items-center gap-2">
              <img src="/reward-pool.png" alt="Reward Pool Icon" className="w-5 h-5" />
              <span className="font-semibold">Reward Pool</span>
            </div>
            <span className="text-white mt-1">{xpRewards || "N/A"}</span>
          </div>

          {/* Target Users / Participants */}
          <div className="flex-1 flex flex-col items-center p-4">
            <div className="flex items-center gap-2">
              <img src="/target-users.png" alt="Target Users Icon" className="w-5 h-5" />
              <span className="font-semibold">Target Users</span>
            </div>
            <span className="text-white mt-1">{participants || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Task Overview */}
    <div className="flex items-center justify-between mt-6">
      <h3 className="text-xl font-semibold">Task Overview</h3>
      <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition">
        Manage Tasks
      </button>
    </div>

    {tasks.length > 0 && (
      <div className="relative mt-2 space-y-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-lg border-2 border-purple-500 px-4 py-3 bg-white/5"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full text-white font-semibold">
              {index + 1}
            </div>

            {/* Show task type as description */}
            <p className="flex-1 text-white">{task.type}</p>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                onClick={() => {
  if (!task.handleOrUrl) return;

  let url = task.handleOrUrl.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  window.open(url, "_blank");
}}
              >
                View
              </button>

              <button
                className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                onClick={() => {
                  setNewTask(task);
                  setShowModal(true);
                  setEditingIndex(index);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}


    {/* Task counter at bottom-right */}
<span className="absolute -bottom-8 right-2 text-white/60 text-sm mt-2">
  {tasks.length}/{tasks.length}
</span>
  </div>
)}

{/* Footer Buttons */}
<div className="flex items-center justify-between mt-8">
  {/* Back button on the left */}
    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition" onClick={() => setActiveTab("tasks")}>Back</button>

  {/* Right buttons */}
  <div className="flex items-center gap-2 mt-4">
    <button
      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
      onClick={() => handleSaveDraft()}
      disabled={saveLoading}
    >
      {saveLoading ? "Saving..." : "Save Draft"}
    </button>
<button
  onClick={() => setShowPublishModal(true)}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={loading || saveLoading}
>
  Publish Campaign
</button>
  </div>
</div>
  </Card>
  
    )}

<>
  {/* ========================= */}
  {/* PUBLISH MODAL */}
  {/* ========================= */}
  {showPublishModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 w-[500px] p-6 rounded-2xl relative shadow-xl">

        {/* Close Icon */}
        <button
          onClick={() => setShowPublishModal(false)}
          className="absolute top-3 right-4 text-white text-xl"
        >
          ×
        </button>

        {/* Top Activate Image */}
        <div className="flex justify-center mb-4">
          <img
            src="/activate-studio.png"
            alt=""
            className="w-48 h-40"
          />
        </div>

        {/* Title + Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Activate your Studio Hub
          </h2>
          <p className="text-white/70 mt-2">
            Activate your studio hub to publish and manage campaigns.
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-white">Yearly Subscription</h3>
          <p className="text-white/70 mt-1">1000 TRUST / year</p>

          {/* Transaction Hash */}
          <div className="mt-4">
            <label className="block text-sm text-white/70 mb-2">Transaction Hash (fee payment)</label>
            <input
              type="text"
              placeholder="0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

<button
  className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
  onClick={async () => {
    if (!campaignTitle || !campaignName) {
      toast({ title: "Incomplete details", description: "Please fill in campaign name and title.", variant: "destructive" });
      return;
    }
    if (tasks.length === 0) {
      toast({ title: "No tasks", description: "Please add at least one task.", variant: "destructive" });
      return;
    }
    if (!txHash.trim()) {
      toast({ title: "Missing tx hash", description: "Please enter the transaction hash for the fee payment.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", campaignTitle);
      fd.append("description", campaignName);
      fd.append("nameOfProject", campaignName);
      fd.append("starts_at", startDate && startTime ? `${startDate}T${startTime}` : startDate);
      fd.append("ends_at", endDate && endTime ? `${endDate}T${endTime}` : endDate);
      fd.append("reward", JSON.stringify({ xp: Number(xpRewards) || 0, pool: Number(rewardPool) || 0 }));
      fd.append("txHash", txHash);
      fd.append("campaignQuests", JSON.stringify(
        tasks.map((t: any) => ({
          title: t.type,
          description: t.description,
          url: t.handleOrUrl,
          reward: { xp: Number(xpRewards) || 0 },
        }))
      ));
      if (coverImage instanceof File) fd.append("coverImage", coverImage);

      await projectApiRequest({
        method: "POST",
        endpoint: "/project/create-campaign",
        formData: fd,
      });

      toast({ title: "Campaign published!", description: "Your campaign is now live." });
      setPublishedCampaign({ title: campaignTitle, name: campaignName, rewardPool, coverImage: coverImagePreview ?? undefined });
      setShowPublishModal(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish campaign.";
      toast({ title: "Publish failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }}
  disabled={loading}
>
  {loading ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2 align-middle" />Publishing...</> : "Confirm & Publish (1000 TRUST)"}
</button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => setShowPublishModal(false)}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
        >
          Cancel
        </button>

      </div>
    </div>
  )}

  {/* ========================= */}
  {/* SUCCESS MODAL */}
  {/* ========================= */}
  {showSuccessModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 w-[600px] p-6 rounded-2xl relative shadow-xl">

        {/* Close Icon */}
        <button
          onClick={() => setShowSuccessModal(false)}
          className="absolute top-3 right-4 text-white text-xl"
        >
          ×
        </button>

        {/* Activate Icon */}
        <div className="flex justify-center mb-4">
          <img
            src="/activate-studio.png"
            alt="Activate Icon"
            className="w-40 h-32"
          />
        </div>

        {/* Title + Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Payment Successfully Completed
          </h2>
          <p className="text-white/70 mt-2">
            Your 1000 TRUST payment was confirmed and your project is ready to go live.
          </p>
        </div>

        {/* Campaign Snapshot Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-purple-500 p-5">

          <h3 className="text-sm font-semibold text-white/80 mb-4">
            CAMPAIGN SNAPSHOT
          </h3>

          <div className="flex gap-4">

            {/* Left Image */}
<div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
  <img
    src={publishedCampaign?.coverImage || "/campaign.jpg"}
    alt="Campaign Cover"
    className="w-full h-full object-cover"
  />
</div>

{/* Right Content */}
<div className="flex-1 flex flex-col justify-between">

  <div>
    <h3 className="text-lg font-semibold text-white">
      {publishedCampaign?.title}
    </h3>

    <p className="text-white/70 text-sm mt-1">
      {publishedCampaign?.description}
    </p>

    <p className="text-white/60 text-sm mt-2">
      Project: @{publishedCampaign?.name}
    </p>
  </div>

  {/* Bottom Info Blocks */}
  <div className="flex mt-4 text-white/80 border border-white/10 rounded-lg overflow-hidden">

    <div className="flex-1 flex flex-col items-center p-3 border-r border-white/10">
      <span className="text-xs font-semibold uppercase tracking-wide">
        Total Reward Pool
      </span>
      <span className="text-white mt-1 text-sm font-semibold">
        {publishedCampaign?.rewardPool} TRUST
      </span>
    </div>

    <div className="flex-1 flex flex-col items-center p-3">
      <span className="text-xs font-semibold uppercase tracking-wide">
        Status
      </span>
      <span className={`mt-1 text-sm font-semibold ${
  isActive ? "text-green-400" : "text-red-400"
}`}>
  {isActive ? "ACTIVE" : "COMPLETED"}
</span>
    </div>

  </div>
</div>
          </div>
        </div>

        {/* Launch Button */}
<Button
  onClick={() => {
    setShowSuccessModal(false);
    setLocation("/studio-dashboard/campaigns-tab");
  }}
  className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
>
  <span>Launch Campaign Now</span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14M13 6l6 6-6 6"
    />
  </svg>
</Button>

      </div>
    </div>
  )}
</>


        </div>
        </main>
        </div>
    </div>
    </div>
  );
}
