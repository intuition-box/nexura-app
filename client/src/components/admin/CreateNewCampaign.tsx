"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import React from "react"
import { Card, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";

import { projectApiRequest, getStoredProjectInfo } from "../../lib/projectApi";
import { addReward, createRewardsContract, payStudioHubFee, syncRewardContractStartDate } from "../../lib/performOnchainAction";
import { useToast } from "../../hooks/use-toast";
import { formatEther, parseEther } from "viem";
import {
  Calendar,
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

type RewardsDeploymentState = {
  txHash: string;
  fundedAmount: string;
  rewardPerParticipant: string;
  maxClaimableParticipants: number;
  remainderWithdrawalTxHash?: string;
};

type EditBaseline = {
  campaignTitle: string;
  campaignName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  hasRewards: boolean;
  rewardPoolWei: string;
  participants: string;
  coverImagePreview: string;
  tasksSignature: string;
};

type Task = {
  _id: string | undefined;
  type: string;
  platform: string;
  handleOrUrl: string;
  description: string;
  evidence: string;
  validation: string;
  verificationMode: string;
  roleId: string;
  channelId: string;
  guildId: string;
};

type DiscordRoleOption = {
  id: string;
  name: string;
};

type DiscordChannelOption = {
  id: string;
  name: string;
  type?: number | string;
};

const DISCORD_JOIN_TASK_TYPE = "Join Us On Discord";
const DISCORD_ROLE_TASK_TYPE = "Acquire a Role (Discord)";
const DISCORD_MESSAGE_TASK_TYPE = "Send Message in Channel (Discord)";

const isDiscordRoleTaskType = (type: string) => type === DISCORD_ROLE_TASK_TYPE;
const isDiscordMessageTaskType = (type: string) => type === DISCORD_MESSAGE_TASK_TYPE;
const isDiscordFixedTaskType = (type: string) =>
  type === DISCORD_JOIN_TASK_TYPE || isDiscordRoleTaskType(type) || isDiscordMessageTaskType(type);


export default function CreateNewCampaigns() {
  const [, setLocation] = useLocation();
  const projectSessionInfo = getStoredProjectInfo();
  const initialDiscordSessionId = String(
    (projectSessionInfo?.discordSessionId as string | undefined) ??
    (projectSessionInfo?.sessionId as string | undefined) ??
    ""
  ).trim();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showTasks, setShowTasks] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [validationType, setValidationType] = useState("manual");
  const { toast } = useToast();

const [tasks, setTasks] = useState<Task[]>([]); 
  const [newTask, setNewTask] = useState({
    _id: undefined as string | undefined,
  type: "",
  platform: "",
  handleOrUrl: "",
  description: "",
  evidence: "",
  validation: "Manual Validation",
  verificationMode: "",
  roleId: "",
  channelId: "",
  guildId: "",
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
const [xpRewards, setXpRewards] = useState("200");
const [hasRewards, setHasRewards] = useState(false);
const [publishedCampaign, setPublishedCampaign] = useState<any | null>(null);
const [paymentTxHash, setPaymentTxHash] = useState("");
const [paymentLoading, setPaymentLoading] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [isPublished, setIsPublished] = useState(false);
const [isEnded, setIsEnded] = useState(false);
const [deployLoading, setDeployLoading] = useState(false);
const [rewardContractAddress, setRewardContractAddress] = useState("");
const [rewardsDeployment, setRewardsDeployment] = useState<RewardsDeploymentState | null>(null);
const [editBaseline, setEditBaseline] = useState<EditBaseline | null>(null);
const [hubGuildId, setHubGuildId] = useState("");
const [hubDiscordConnected, setHubDiscordConnected] = useState(false);
const [discordSessionId, setDiscordSessionId] = useState(initialDiscordSessionId);
const [discordRoles, setDiscordRoles] = useState<DiscordRoleOption[]>([]);
const [discordChannels, setDiscordChannels] = useState<DiscordChannelOption[]>([]);
const [discordRolesError, setDiscordRolesError] = useState("");
const [discordChannelsError, setDiscordChannelsError] = useState("");
const [discordOptionsLoading, setDiscordOptionsLoading] = useState(false);

// Pre-fill from existing draft when ?edit=<id> is in the URL
const parseDateTime = (isoStr: string) => {
  if (!isoStr) return { date: "", time: "" };
  const idx = isoStr.indexOf("T");
  if (idx === -1) return { date: isoStr, time: "" };
  return { date: isoStr.slice(0, idx), time: isoStr.slice(idx + 1, idx + 6) };
};

const toWeiString = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return "0";
  try {
    return parseEther(normalized).toString();
  } catch {
    return "";
  }
};

const buildTaskSignature = (list: Task[]) => JSON.stringify(
  list.map((t) => ({
    _id: t._id ?? "",
    type: t.type ?? "",
    platform: t.platform ?? "",
    handleOrUrl: t.handleOrUrl ?? "",
    description: t.description ?? "",
    verificationMode: t.verificationMode ?? "",
    validation: t.validation ?? "",
    roleId: t.roleId ?? "",
    channelId: t.channelId ?? "",
    guildId: t.guildId ?? "",
  }))
);

useEffect(() => {
  const editId = new URLSearchParams(window.location.search).get("edit");
  if (!editId) {
    // Default new campaigns to rewards OFF unless the user enables it.
    setHasRewards(false);
    setRewardPool("");
    setRewardContractAddress("");
    setRewardsDeployment(null);
    return;
  }
  (async () => {
    try {
      const res = await projectApiRequest<{ hubCampaigns?: any[] }>({
        method: "GET",
        endpoint: "/hub/get-campaigns",
      });
      const found = (res.hubCampaigns ?? []).find((c: any) => c._id === editId);
      if (!found) return;
      setCampaignId(editId);
      setIsEditMode(true);
      setIsPublished(found.status !== "Save");
      setIsEnded(found.status === "Ended" || (found.ends_at ? new Date(found.ends_at) <= new Date() : false));
      setCampaignTitle(found.title ?? "");
      setCampaignName(found.description ?? found.nameOfProject ?? "");
      const s = parseDateTime(found.starts_at ?? "");
      const e = parseDateTime(found.ends_at ?? "");
      setStartDate(s.date);
      setStartTime(s.time);
      setEndDate(e.date);
      setEndTime(e.time);
      const existingRewardPool = Number(found.reward?.pool ?? 0);
      const existingParticipants = found.maxParticipants !== undefined && found.maxParticipants !== null
        ? String(found.maxParticipants)
        : found.participants !== undefined && found.participants !== null
          ? String(found.participants)
          : "";
      setHasRewards(existingRewardPool > 0);
      setRewardPool(String(found.reward?.pool ?? ""));
      setParticipants(existingParticipants);
      setRewardContractAddress(found.contractAddress ?? "");
      if (found.contractAddress) {
        const participantCount = Number(existingParticipants || 0);
        const trustPerParticipant = participantCount > 0
          ? Number((existingRewardPool / participantCount).toFixed(8))
          : Number(found.reward?.trustTokens ?? 0);
        setRewardsDeployment({
          txHash: found.rewardsDeployment?.txHash ?? "",
          fundedAmount: String(found.rewardsDeployment?.fundedAmount ?? existingRewardPool),
          rewardPerParticipant: String(found.rewardsDeployment?.rewardPerParticipant ?? trustPerParticipant),
          maxClaimableParticipants: Number(found.rewardsDeployment?.maxClaimableParticipants ?? participantCount),
          remainderWithdrawalTxHash: found.rewardsDeployment?.remainderWithdrawalTxHash ?? "",
        });
      } else {
        setRewardsDeployment(null);
      }
      setXpRewards("200");
      if (found.projectCoverImage) setCoverImagePreview(found.projectCoverImage);
      let loadedTasks: Task[] = [];
      // Pre-fill tasks from saved quests
      try {
        const qRes = await projectApiRequest<{ campaignQuests?: any[] }>({
          method: "GET",
          endpoint: "/hub/get-campaign",
          params: { id: editId },
        });
        const tagToType = (tag: string) => {
          if (tag === "comment" || tag === "comment-x") return "Comment on our X post";
          if (tag === "follow" || tag === "follow-x") return "Follow us on X";
          if (tag === "join" || tag === "join-discord") return "Join Us On Discord";
          if (tag === "acquire-role-discord") return DISCORD_ROLE_TASK_TYPE;
          if (tag === "send-message-discord" || tag === "message-discord" || tag === "message") return DISCORD_MESSAGE_TASK_TYPE;
          if (tag === "portal") return "Check Out the Portal Claims";
          if (tag === "feedback") return "Give Feedback";
          return "others";
        };
        const catToPlatform = (cat: string) => {
          if (cat === "twitter") return "Twitter";
          if (cat === "discord") return "Discord";
          return "";
        };
        const tagToValidation = (tag: string) => {
          if (tag === "join" || tag === "join-discord") return "Discord Auth";
          if (tag === "acquire-role-discord" || tag === "send-message-discord" || tag === "message-discord" || tag === "message") return "Discord Auth";
          if (tag === "portal") return "Auto Verified";
          return "Manual Validation";
        };
        if (qRes.campaignQuests) {
          loadedTasks = qRes.campaignQuests.map((q: any) => ({
            _id: q._id,
            type: tagToType(q.tag),
            platform: catToPlatform(q.category),
            handleOrUrl: q.link ?? "",
            description: q.quest ?? "",
            evidence: "",
            validation: tagToValidation(q.tag),
            verificationMode: q.verificationMode ?? "",
            roleId: String(q.roleId ?? q.metadata?.roleId ?? ""),
            channelId: String(q.channelId ?? q.metadata?.channelId ?? ""),
            guildId: String(q.guildId ?? q.metadata?.guildId ?? ""),
          }));
          setTasks(loadedTasks);
        }
      } catch { /* ignore */ }

      setEditBaseline({
        campaignTitle: found.title ?? "",
        campaignName: found.description ?? found.nameOfProject ?? "",
        startDate: s.date,
        startTime: s.time,
        endDate: e.date,
        endTime: e.time,
        hasRewards: existingRewardPool > 0,
        rewardPoolWei: existingRewardPool > 0 ? toWeiString(String(found.reward?.pool ?? 0)) : "0",
        participants: existingParticipants,
        coverImagePreview: found.projectCoverImage ?? "",
        tasksSignature: buildTaskSignature(loadedTasks),
      });
    } catch { /* ignore – user will fill in manually */ }
  })();
}, []);

useEffect(() => {
  (async () => {
    try {
      const res = await projectApiRequest<{ hub?: { pendingTxHash?: string | null; guildId?: string; discordConnected?: boolean; discordSessionId?: string } }>({
        method: "GET",
        endpoint: "/hub/me",
      });

      const pendingTxHash = res.hub?.pendingTxHash?.trim();
      if (pendingTxHash) {
        setPaymentTxHash(pendingTxHash);
      }
      setHubGuildId(String(res.hub?.guildId ?? "").trim());
      setHubDiscordConnected(Boolean(res.hub?.discordConnected));
      const sessionIdFromHub = String(res.hub?.discordSessionId ?? "").trim();
      if (sessionIdFromHub) {
        setDiscordSessionId(sessionIdFromHub);
      }
    } catch {
      // Ignore hydration failures here; publish flow can still continue in-session.
    }
  })();
}, []);

const fetchDiscordOptions = async (guildId: string) => {
  if (!guildId) {
    setDiscordRoles([]);
    setDiscordChannels([]);
    setDiscordRolesError("No Discord server selected. Connect your Discord server first.");
    setDiscordChannelsError("No Discord server selected. Connect your Discord server first.");
    return;
  }
  if (!discordSessionId) {
    setDiscordRoles([]);
    setDiscordChannels([]);
    setDiscordRolesError("Reconnect Discord in Studio to load server roles.");
    setDiscordChannelsError("Reconnect Discord in Studio to load server channels.");
    return;
  }

  setDiscordOptionsLoading(true);
  setDiscordRolesError("");
  setDiscordChannelsError("");

  const baseParams: Record<string, string> = { serverId: guildId };
  if (discordSessionId) baseParams.id = discordSessionId;

  const [rolesResult, channelsResult] = await Promise.allSettled([
    projectApiRequest<{ roles?: DiscordRoleOption[] }>({
      method: "GET",
      endpoint: "/hub/get-roles",
      params: baseParams,
    }),
    projectApiRequest<{ channels?: DiscordChannelOption[]; data?: DiscordChannelOption[] }>({
      method: "GET",
      endpoint: "/hub/get-channels",
      params: baseParams,
    }),
  ]);

  if (rolesResult.status === "fulfilled") {
    setDiscordRoles(rolesResult.value.roles ?? []);
  } else {
    setDiscordRoles([]);
    const msg = rolesResult.reason instanceof Error ? rolesResult.reason.message : "Failed to fetch Discord roles.";
    setDiscordRolesError(msg);
  }

  if (channelsResult.status === "fulfilled") {
    const channels = channelsResult.value.channels ?? channelsResult.value.data ?? [];
    setDiscordChannels(channels);
  } else {
    setDiscordChannels([]);
    const msg = channelsResult.reason instanceof Error ? channelsResult.reason.message : "Failed to fetch Discord channels.";
    setDiscordChannelsError(msg);
  }

  setDiscordOptionsLoading(false);
};

useEffect(() => {
  if (!showModal) return;
  if (!isDiscordRoleTaskType(newTask.type) && !isDiscordMessageTaskType(newTask.type)) return;

  if (!hubDiscordConnected) {
    setDiscordRoles([]);
    setDiscordChannels([]);
    setDiscordRolesError("Discord is not connected for this hub. Connect Discord to use this task type.");
    setDiscordChannelsError("Discord is not connected for this hub. Connect Discord to use this task type.");
    return;
  }

  if (!hubGuildId) {
    setDiscordRoles([]);
    setDiscordChannels([]);
    setDiscordRolesError("No Discord guild is linked to this hub yet.");
    setDiscordChannelsError("No Discord guild is linked to this hub yet.");
    return;
  }

  void fetchDiscordOptions(hubGuildId);
}, [showModal, newTask.type, hubDiscordConnected, hubGuildId, discordSessionId]);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
};


const typeToTag = (type: string) => {
  if (type === "Comment on our X post") return "comment-x";
  if (type === "Follow us on X") return "follow-x";
  if (type === "Join Us On Discord") return "join-discord";
  if (type === DISCORD_ROLE_TASK_TYPE) return "acquire-role-discord";
  if (type === DISCORD_MESSAGE_TASK_TYPE) return "send-message-discord";
  if (type === "Check Out the Portal Claims") return "portal";
  if (type === "Give Feedback") return "feedback";
  return "other";
};
const platformToCategory = (platform: string) => {
  if (platform === "Twitter") return "twitter";
  if (platform === "Discord") return "discord";
  return "other";
};

const normalizedParticipants = String(Number(participants || 0));
const normalizedBaselineParticipants = String(Number(editBaseline?.participants || 0));
const currentRewardPoolWei = hasRewards ? toWeiString(rewardPool || "0") : "0";
const currentTaskSignature = useMemo(() => buildTaskSignature(tasks), [tasks]);

const captureCurrentEditBaseline = (): EditBaseline => ({
  campaignTitle,
  campaignName,
  startDate,
  startTime,
  endDate,
  endTime,
  hasRewards,
  rewardPoolWei: currentRewardPoolWei || "0",
  participants: normalizedParticipants,
  coverImagePreview: coverImagePreview ?? "",
  tasksSignature: currentTaskSignature,
});

const draftRewardFieldsChanged = useMemo(() => {
  if (!editBaseline || isPublished || !hasRewards || !rewardContractAddress.trim()) return false;
  return currentRewardPoolWei !== editBaseline.rewardPoolWei || normalizedParticipants !== normalizedBaselineParticipants;
}, [
  editBaseline,
  isPublished,
  hasRewards,
  rewardContractAddress,
  currentRewardPoolWei,
  normalizedParticipants,
  normalizedBaselineParticipants,
]);

const rewardFieldsChanged = useMemo(() => {
  if (!editBaseline || !isEditMode || !isPublished || !hasRewards || !rewardContractAddress.trim()) return false;
  return currentRewardPoolWei !== editBaseline.rewardPoolWei || normalizedParticipants !== normalizedBaselineParticipants;
}, [
  editBaseline,
  isEditMode,
  isPublished,
  hasRewards,
  rewardContractAddress,
  currentRewardPoolWei,
  normalizedParticipants,
  normalizedBaselineParticipants,
]);

const otherDetailsChanged = useMemo(() => {
  if (!editBaseline || !isEditMode || !isPublished) return false;
  return (
    campaignTitle !== editBaseline.campaignTitle ||
    campaignName !== editBaseline.campaignName ||
    startDate !== editBaseline.startDate ||
    startTime !== editBaseline.startTime ||
    endDate !== editBaseline.endDate ||
    endTime !== editBaseline.endTime ||
    hasRewards !== editBaseline.hasRewards ||
    !!coverImage ||
    currentTaskSignature !== editBaseline.tasksSignature
  );
}, [
  editBaseline,
  isEditMode,
  isPublished,
  campaignTitle,
  campaignName,
  startDate,
  startTime,
  endDate,
  endTime,
  hasRewards,
  coverImage,
  currentTaskSignature,
]);

const updateCampaignButtonLabel =
  rewardFieldsChanged && !otherDetailsChanged ? "Update Rewards Contract" : "Update Campaign Details";

const getDraftRewardsPublishError = () => {
  if (!hasRewards) return null;

  if (draftRewardFieldsChanged) {
    return "Save the updated reward pool and participant limit before publishing.";
  }

  if (!rewardContractAddress.trim() || !rewardsDeployment) {
    return null;
  }

  try {
    const cfg = getRewardDeploymentConfig();
    const fundedAmount = Number(rewardsDeployment.fundedAmount);
    if (Math.abs(fundedAmount - cfg.totalPool) > 1e-9) {
      return "Saved reward pool differs from the funded on-chain amount. Redeploy the rewards contract.";
    }
    if (rewardsDeployment.maxClaimableParticipants !== cfg.participantCount) {
      return "Saved participant count differs from the deployed withdrawal cap. Redeploy the rewards contract.";
    }
  } catch (err: unknown) {
    return err instanceof Error ? err.message : "Invalid rewards configuration.";
  }

  return null;
};

const buildCampaignFormData = (isDraft: boolean): FormData => {
  const fd = new FormData();
  const normalizedRewardPool = hasRewards ? (Number(rewardPool) || 0) : 0;
  let perParticipantTrust = 0;
  if (hasRewards && rewardPool && participants && Number(participants) > 0) {
    try {
      const rewardPerParticipantWei = parseEther(rewardPool.trim()) / BigInt(Number(participants));
      perParticipantTrust = Number(formatEther(rewardPerParticipantWei));
    } catch {
      perParticipantTrust = 0;
    }
  }
  fd.append("title", campaignTitle);
  fd.append("description", campaignName);
  fd.append("nameOfProject", campaignName);
  fd.append("starts_at", startDate && startTime ? `${startDate}T${startTime}` : startDate);
  fd.append("ends_at", endDate && endTime ? `${endDate}T${endTime}` : endDate);
  fd.append("maxParticipants", participants);
  fd.append("reward", JSON.stringify({
    xp: Number(xpRewards) || 0,
    pool: normalizedRewardPool,
    trust: perParticipantTrust,
  }));
  if (coverImage instanceof File) fd.append("coverImage", coverImage);
  if (isDraft) fd.append("isDraft", "true");
  fd.append("campaignQuests", JSON.stringify(
    tasks.map(t => {
      const taskTag = typeToTag(t.type);
      const taskGuildId = t.guildId || hubGuildId || "";
      const payload: Record<string, unknown> = {
        _id: t._id,
        quest: t.description || t.type,
        link: t.handleOrUrl || "https://nexura.io",
        tag: taskTag,
        category: platformToCategory(t.platform),
        verificationMode: t.verificationMode || "",
      };

      if (t.roleId || t.channelId || taskGuildId) {
        payload.metadata = {
          ...(t.roleId ? { roleId: t.roleId } : {}),
          ...(t.channelId ? { channelId: t.channelId } : {}),
          ...(taskGuildId ? { guildId: taskGuildId } : {}),
        };
      }

      if (t.roleId) payload.roleId = t.roleId;
      if (t.channelId) payload.channelId = t.channelId;
      if (taskGuildId) payload.guildId = taskGuildId;

      return payload;
    })
  ));
  return fd;
};

const handleSaveDraft = async (thenNavigate?: string): Promise<string | null> => {
  if (!campaignTitle) {
    toast({ title: "Missing description", description: "Please enter a campaign description.", variant: "destructive" });
    return null;
  }
  setSaveLoading(true);
  try {
    const fd = buildCampaignFormData(true);
    const params: Record<string, string> = {};
    if (campaignId) params.id = campaignId;
    const res = await projectApiRequest<{ campaignId?: string; message?: string }>({
      method: "PATCH",
      endpoint: "/hub/save-campaign",
      formData: fd,
      params,
    });
    const savedCampaignId = res.campaignId ?? campaignId;
    if (res.campaignId) setCampaignId(res.campaignId);
    setEditBaseline(captureCurrentEditBaseline());
    toast({ title: "Campaign saved!", description: "Draft saved successfully." });
    if (thenNavigate) setActiveTab(thenNavigate);
    return savedCampaignId ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save campaign.";
    toast({ title: "Save failed", description: msg, variant: "destructive" });
    return null;
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
  const requiresPlatform = newTask.type !== "Check Out the Portal Claims" && newTask.type !== "others" && newTask.type !== "Give Feedback";
  const requiresDiscordConnection = newTask.platform === "Discord" || isDiscordFixedTaskType(newTask.type);
  const requiresRole = isDiscordRoleTaskType(newTask.type);
  const requiresChannel = isDiscordMessageTaskType(newTask.type);

  if (!newTask.type || (requiresPlatform && !newTask.platform) || !newTask.handleOrUrl || !newTask.description) {
    return setError("All fields are required.");
  }
  if (requiresDiscordConnection && !hubDiscordConnected) {
    return setError("Connect Discord in Studio before creating Discord-related tasks.");
  }
  if (requiresDiscordConnection && !hubGuildId) {
    return setError("Finish Discord setup by selecting a server before creating Discord-related tasks.");
  }
  if (requiresRole && !newTask.roleId) {
    return setError("Please select a Discord role for this task.");
  }
  if (requiresChannel && !newTask.channelId) {
    return setError("Please select a Discord channel for this task.");
  }

  if (editingIndex !== null) {
    const updatedTasks = [...tasks];
    updatedTasks[editingIndex] = newTask;
    setTasks(updatedTasks);
    setEditingIndex(null);
  } else {
    setTasks([...tasks, newTask]);
  }

  setNewTask({ _id: undefined, type: "", platform: "", handleOrUrl: "", description: "", evidence: "", validation: "Manual Validation", verificationMode: "", roleId: "", channelId: "", guildId: "" });
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

const clearRewardsDeployment = (reason: string) => {
  if (isPublished || !rewardContractAddress.trim()) return;

  setRewardContractAddress("");
  setRewardsDeployment(null);
  toast({
    title: "Redeploy required",
    description: `${reason} Redeploy the rewards contract to keep on-chain funding in sync.`,
  });
};

const handleCampaignNameChange = (value: string) => {
  if (value !== campaignName) {
    clearRewardsDeployment("Campaign name changed.");
  }
  setCampaignName(value);
};

const handleStartDateTimeChange = (value: string) => {
  const [d, t] = value.split("T");
  const nextDate = d ?? "";
  const nextTime = t ? t.slice(0, 5) : "";

  setStartDate(nextDate);
  setStartTime(nextTime);
};

const handleEndDateTimeChange = (value: string) => {
  const [d, t] = value.split("T");
  const nextDate = d ?? "";
  const nextTime = t ? t.slice(0, 5) : "";

  setEndDate(nextDate);
  setEndTime(nextTime);
};

const handleRewardPoolChange = (value: string) => {
  setRewardPool(value);
};

const handleParticipantsChange = (value: string) => {
  setParticipants(value);
};

const getCampaignClaimStartTimestamp = () => {
  const endIso = endDate && endTime ? `${endDate}T${endTime}` : endDate ? `${endDate}T00:00` : "";
  if (!endIso) {
    throw new Error("Set a campaign end date and time before deploying rewards.");
  }

  const endTimestampMs = new Date(endIso).getTime();
  if (Number.isNaN(endTimestampMs)) {
    throw new Error("Campaign end date is invalid.");
  }

  return Math.floor(endTimestampMs / 1000);
};

const getRewardDeploymentConfig = () => {
  const normalizedRewardPool = rewardPool.trim();
  if (!normalizedRewardPool) {
    throw new Error("Reward pool must be greater than zero.");
  }

  let totalPoolWei = 0n;
  try {
    totalPoolWei = parseEther(normalizedRewardPool);
  } catch {
    throw new Error("Reward pool format is invalid.");
  }

  if (totalPoolWei <= 0n) {
    throw new Error("Reward pool must be greater than zero.");
  }

  const totalPool = Number(normalizedRewardPool);
  if (!Number.isFinite(totalPool) || totalPool <= 0) {
    throw new Error("Reward pool must be greater than zero.");
  }

  const participantCount = Number(participants);

  if (!Number.isInteger(participantCount) || participantCount <= 0) {
    throw new Error("Participant count must be a whole number greater than zero.");
  }

  const rewardPerParticipantWei = totalPoolWei / BigInt(participantCount);
  const minimumRewardPerParticipantWei = parseEther("1");
  if (rewardPerParticipantWei < minimumRewardPerParticipantWei) {
    throw new Error("Minimum reward per participant is 1 TRUST.");
  }

  const rewardPerParticipantRaw = formatEther(rewardPerParticipantWei);
  const rewardPerParticipant = Number(rewardPerParticipantRaw);

  return {
    totalPool,
    totalPoolWei,
    totalPoolRaw: formatEther(totalPoolWei),
    participantCount,
    rewardPerParticipant,
    rewardPerParticipantWei,
    rewardPerParticipantRaw,
  };
};

const getPublishedDeploymentSnapshot = () => {
  if (!rewardsDeployment) {
    throw new Error("No rewards deployment record found for this campaign.");
  }

  const fundedAmount = Number(rewardsDeployment.fundedAmount);
  const rewardPerParticipant = Number(rewardsDeployment.rewardPerParticipant);
  const maxClaimableParticipants = Number(rewardsDeployment.maxClaimableParticipants);

  if (!Number.isFinite(fundedAmount) || fundedAmount <= 0) {
    throw new Error("Invalid deployed reward pool detected.");
  }
  if (!Number.isFinite(rewardPerParticipant) || rewardPerParticipant <= 0) {
    throw new Error("Invalid deployed per-participant reward detected.");
  }
  if (!Number.isFinite(maxClaimableParticipants) || maxClaimableParticipants <= 0) {
    throw new Error("Invalid deployed participant limit detected.");
  }

  let fundedAmountWei = 0n;
  let rewardPerParticipantWei = 0n;
  try {
    fundedAmountWei = parseEther(rewardsDeployment.fundedAmount);
    rewardPerParticipantWei = parseEther(rewardsDeployment.rewardPerParticipant);
  } catch {
    throw new Error("Invalid deployed rewards precision detected.");
  }

  return {
    fundedAmount,
    rewardPerParticipant,
    maxClaimableParticipants,
    fundedAmountWei,
    rewardPerParticipantWei,
  };
};

const getPublishedRewardIncreaseDelta = (config: {
  totalPool: number;
  totalPoolWei: bigint;
  totalPoolRaw: string;
  participantCount: number;
  rewardPerParticipant: number;
  rewardPerParticipantWei: bigint;
  rewardPerParticipantRaw: string;
}) => {
  const deployed = getPublishedDeploymentSnapshot();

  if (config.totalPoolWei < deployed.fundedAmountWei) {
    throw new Error("Reward pool cannot be reduced after publishing.");
  }
  if (config.participantCount < deployed.maxClaimableParticipants) {
    throw new Error("Participant limit cannot be reduced after publishing.");
  }

  if (config.rewardPerParticipantWei !== deployed.rewardPerParticipantWei) {
    throw new Error("For published campaigns, per-participant TRUST reward cannot change.");
  }

  const addedPoolWei = config.totalPoolWei - deployed.fundedAmountWei;
  const addedParticipants = config.participantCount - deployed.maxClaimableParticipants;

  if (addedPoolWei === 0n && addedParticipants === 0) {
    return { deployed, addedPoolWei, addedParticipants, shouldSyncOnchain: false };
  }

  if (addedPoolWei <= 0n || addedParticipants <= 0) {
    throw new Error("Increase both reward pool and participants together for published campaigns.");
  }

  const expectedPoolIncreaseWei = deployed.rewardPerParticipantWei * BigInt(addedParticipants);
  if (expectedPoolIncreaseWei !== addedPoolWei) {
    throw new Error(
      `Increase mismatch. Add ${formatEther(expectedPoolIncreaseWei)} TRUST for ${addedParticipants} more participants at ${deployed.rewardPerParticipant} TRUST each.`
    );
  }

  return { deployed, addedPoolWei, addedParticipants, shouldSyncOnchain: true };
};

const syncPublishedRewardIncrease = async (
  savedCampaignId: string,
  config: {
    totalPool: number;
    totalPoolWei: bigint;
    totalPoolRaw: string;
    participantCount: number;
    rewardPerParticipant: number;
    rewardPerParticipantWei: bigint;
    rewardPerParticipantRaw: string;
  }
) => {
  if (!isPublished || !hasRewards) return;
  if (!rewardContractAddress.trim()) {
    throw new Error("Rewards contract is required for published rewards campaigns.");
  }

  const delta = getPublishedRewardIncreaseDelta(config);
  if (!delta.shouldSyncOnchain) return;

  const txHash = await addReward(rewardContractAddress.trim(), formatEther(delta.addedPoolWei));

  await projectApiRequest({
    method: "PATCH",
    endpoint: "/hub/add-campaign-address",
    data: {
      id: savedCampaignId,
      contractAddress: rewardContractAddress.trim(),
      deploymentTxHash: txHash,
      fundedAmount: Number(config.totalPoolRaw),
      rewardPerParticipant: Number(config.rewardPerParticipantRaw),
      maxClaimableParticipants: config.participantCount,
    },
  });

  setRewardsDeployment({
    txHash,
    fundedAmount: config.totalPoolRaw,
    rewardPerParticipant: config.rewardPerParticipantRaw,
    maxClaimableParticipants: config.participantCount,
  });

  toast({
    title: "Rewards contract updated",
    description: `Added ${formatEther(delta.addedPoolWei)} TRUST on-chain for ${delta.addedParticipants} additional participants.`,
  });
};

const syncPublishedRewardClaimStart = async () => {
  if (!isPublished || !hasRewards || !rewardContractAddress.trim()) return;

  const claimStartTimestamp = getCampaignClaimStartTimestamp();
  const syncResult = await syncRewardContractStartDate(rewardContractAddress.trim(), claimStartTimestamp);

  if (!syncResult.updated) return;

  toast({
    title: "Rewards contract reopened",
    description: "Updated the on-chain claim date to match the latest campaign end date.",
  });
};

const handleDeployRewardsContract = async () => {
  if (!hasRewards) {
    toast({ title: "Rewards are disabled", description: "Turn on campaign rewards before deploying a rewards contract.", variant: "destructive" });
    return;
  }
  if (!campaignTitle || !campaignName) {
    toast({ title: "Incomplete details", description: "Please fill in campaign name and description.", variant: "destructive" });
    return;
  }
  if (tasks.length === 0) {
    toast({ title: "No tasks", description: "Please add at least one task.", variant: "destructive" });
    return;
  }

  let claimStartTimestamp = 0;
  let totalPool = 0;
  let totalPoolRaw = "";
  let participantCount = 0;
  let rewardPerParticipantRaw = "";
  try {
    claimStartTimestamp = getCampaignClaimStartTimestamp();
    ({
      totalPool,
      totalPoolRaw,
      participantCount,
      rewardPerParticipantRaw,
    } = getRewardDeploymentConfig());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid campaign reward configuration.";
    toast({ title: "Cannot deploy contract", description: message, variant: "destructive" });
    return;
  }

  setDeployLoading(true);
  try {
    const savedCampaignId = campaignId ?? await handleSaveDraft();
    if (!savedCampaignId) return;

    const deployment = await createRewardsContract({
      nameOfCampaign: campaignName.trim(),
      totalRewards: totalPoolRaw,
      rewardToken: rewardPerParticipantRaw,
      startDate: claimStartTimestamp,
    });
    const deployedParticipantCap = Number(deployment.maxClaimableParticipants ?? 0);
    if (!Number.isInteger(deployedParticipantCap) || deployedParticipantCap <= 0) {
      throw new Error("Unable to verify participant withdrawal limit from the deployed contract.");
    }
    if (deployedParticipantCap !== participantCount) {
      throw new Error(
        `Deployment mismatch. Contract allows ${deployedParticipantCap} participants, expected ${participantCount}.`
      );
    }

    await projectApiRequest({
      method: "PATCH",
      endpoint: "/hub/add-campaign-address",
      data: {
        id: savedCampaignId,
        contractAddress: deployment.contractAddress,
        deploymentTxHash: deployment.txHash,
        fundedAmount: Number(deployment.fundedAmount),
        rewardPerParticipant: Number(deployment.rewardPerParticipant),
        maxClaimableParticipants: deployedParticipantCap,
      },
    });

    setCampaignId(savedCampaignId);
    setRewardContractAddress(deployment.contractAddress);
    setRewardPool(deployment.fundedAmount);
    setParticipants(String(deployedParticipantCap));
    setRewardsDeployment({
      txHash: deployment.txHash,
      fundedAmount: deployment.fundedAmount,
      rewardPerParticipant: deployment.rewardPerParticipant,
      maxClaimableParticipants: deployedParticipantCap,
    });
    setEditBaseline({
      campaignTitle,
      campaignName,
      startDate,
      startTime,
      endDate,
      endTime,
      hasRewards: true,
      rewardPoolWei: toWeiString(deployment.fundedAmount) || "0",
      participants: String(deployedParticipantCap),
      coverImagePreview: coverImagePreview ?? "",
      tasksSignature: currentTaskSignature,
    });

    toast({
      title: "Rewards contract deployed",
      description: `Deducted ${deployment.fundedAmount} TRUST and funded the contract. ${deployedParticipantCap} participants can claim ${deployment.rewardPerParticipant} TRUST each. Tx: ${deployment.txHash}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to deploy rewards contract.";
    toast({ title: "Deployment failed", description: message, variant: "destructive" });
  } finally {
    setDeployLoading(false);
  }
};

const handleUpdateCampaign = async () => {
  if (!campaignTitle || !campaignName) {
    toast({ title: "Incomplete details", description: "Please fill in campaign name and description.", variant: "destructive" });
    return;
  }
  if (tasks.length === 0) {
    toast({ title: "No tasks", description: "Please add at least one task.", variant: "destructive" });
    return;
  }

  let rewardConfig: ReturnType<typeof getRewardDeploymentConfig> | null = null;
  if (hasRewards) {
    try {
      rewardConfig = getRewardDeploymentConfig();
      if (isPublished && !isEnded) {
        getPublishedRewardIncreaseDelta(rewardConfig);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid rewards configuration.";
      toast({ title: "Update blocked", description: message, variant: "destructive" });
      return;
    }
  }

  setLoading(true);
  try {
    const savedCampaignId = campaignId ?? await handleSaveDraft();
    if (!savedCampaignId) return;

    if (hasRewards && isPublished && !isEnded && rewardConfig) {
      await syncPublishedRewardIncrease(savedCampaignId, rewardConfig);
    }

    if (hasRewards && isPublished && !isEnded) {
      await syncPublishedRewardClaimStart();
    }

    setCampaignId(savedCampaignId);
    toast({ title: "Campaign updated!", description: "Your campaign changes have been saved." });
    setLocation("/studio-dashboard/campaigns-tab");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update campaign.";
    toast({ title: "Update failed", description: msg, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

const handlePublishButtonClick = () => {
  if (Number(rewardPool) > 0 && !rewardContractAddress.trim()) {
    toast({
      title: "Rewards contract required",
      description: "Deploy the rewards contract before publishing this campaign.",
      variant: "destructive",
    });
    return;
  }

  const rewardPublishError = getDraftRewardsPublishError();
  if (rewardPublishError) {
    toast({
      title: "Cannot publish",
      description: rewardPublishError,
      variant: "destructive",
    });
    return;
  }

  setShowPublishModal(true);
};

const isActive =
  publishedCampaign &&
  new Date(publishedCampaign.endDate) > new Date();



  return (
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8 text-white">
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold">{isEditMode ? "Edit Campaign" : "Create New Campaign"}</h1>
                <p className="text-white/60 mt-2">
                  {isEditMode
                    ? "Update your draft campaign details, tasks, and duration."
                    : "Launch your next campaign and grow your community with tailored rewards."}
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
        activeTab === "details" ? "bg-[#8B3EFE]" : "bg-white/20"
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
        activeTab === "tasks" ? "bg-[#8B3EFE]" : "bg-white/20"
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
        activeTab === "review" ? "bg-[#8B3EFE]" : "bg-white/20"
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

              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <>
                <h2 className="text-xl font-semibold">Campaign Details</h2>
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
  onChange={(e) => handleCampaignNameChange(e.target.value)}
/>
                    </div>

                    {/* Campaign Description */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Campaign Description
                      </label>
<Input
  placeholder="Enter campaign description..."
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm mb-2">
                          <Calendar className="w-4 h-4" />
                          Start Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
                          value={startDate && startTime ? `${startDate}T${startTime}` : startDate ? `${startDate}T00:00` : ""}
                          onChange={(e) => handleStartDateTimeChange(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm mb-2">
                          <Calendar className="w-4 h-4" />
                          End Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
                          value={endDate && endTime ? `${endDate}T${endTime}` : endDate ? `${endDate}T00:00` : ""}
                          onChange={(e) => handleEndDateTimeChange(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-white/50 -mt-2 col-span-full">
                        Set the start and end date &amp; time of the campaign.
                      </p>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="flex items-center gap-2 text-sm mb-3">
                        <ImageIcon className="w-4 h-4" />
                        Cover Image
                      </label>
<label className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-black hover:border-[#8B3EFE] transition cursor-pointer block">
  <input
    id="coverInput"
    type="file"
    accept="image/*"
    onChange={handleCoverImage}
    className="hidden"
  />
  {coverImagePreview ? (
    <div className="flex flex-col items-center gap-3">
      <img
        src={coverImagePreview}
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

                    {/* Rewards */}
<div className="space-y-4">
  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
    <div>
      <p className="text-sm font-medium text-white">Enable TRUST Rewards</p>
      <p className="text-xs text-white/50">
        Turn this on to fund a reward pool and deploy a rewards contract.
      </p>
    </div>
    <Switch
      checked={hasRewards}
      disabled={isPublished}
      onCheckedChange={(checked) => {
        setHasRewards(checked);
        if (!checked) {
          setRewardPool("");
          setRewardContractAddress("");
          setRewardsDeployment(null);
        }
      }}
      className="data-[state=checked]:bg-[#8B3EFE]"
      aria-label="Enable campaign rewards"
    />
  </div>

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
  step="any"
  className={`bg-white/5 border-white/10 pl-20 ${(!hasRewards || (isPublished && !rewardContractAddress.trim())) ? "cursor-not-allowed opacity-60" : ""}`}
  placeholder="0"
  value={rewardPool}
  onChange={(e) => handleRewardPoolChange(e.target.value)}
  readOnly={!hasRewards || (isPublished && !rewardContractAddress.trim())}
/>
  </div>
  <p className="text-[11px] text-white/50 mt-2">
    When you deploy the rewards contract, this exact TRUST amount is auto-deducted from your wallet and locked as the reward pool.
  </p>
  {hasRewards && rewardContractAddress && rewardsDeployment && (
    <div className="mt-3 rounded-md border border-green-500/30 bg-green-900/20 px-3 py-2 text-[11px] text-green-200 space-y-1">
      <p>On-chain funding confirmed: {rewardsDeployment.fundedAmount} TRUST deducted.</p>
      <p>Participant withdrawals enabled: {rewardsDeployment.maxClaimableParticipants}.</p>
      <p>Per participant reward: {rewardsDeployment.rewardPerParticipant} TRUST.</p>
      {rewardsDeployment.txHash && <p className="truncate">Tx: {rewardsDeployment.txHash}</p>}
    </div>
  )}
  {draftRewardFieldsChanged && (
    <p className="text-[11px] text-amber-300 mt-2">
      You changed the reward pool or participant limit after deployment. Save the campaign before publishing.
    </p>
  )}
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
  className={`bg-white/5 border-white/10 pl-10 ${(isPublished && (!hasRewards || !rewardContractAddress.trim())) ? "cursor-not-allowed opacity-60" : ""}`}
  value={participants}
  onChange={(e) => handleParticipantsChange(e.target.value)}
  readOnly={isPublished && (!hasRewards || !rewardContractAddress.trim())}
/>
  </div>
</div>

                      <div>
  <label className="block mb-2 text-sm font-medium">
    XP Rewards
  </label>
  <div className="relative">
    <Input
      type="number"
      placeholder="200 XP per participant"
      className={`bg-white/5 border-white/10 pr-10 cursor-not-allowed opacity-60 ${!hasRewards ? "opacity-40" : ""}`}
      value={xpRewards}
      readOnly
      disabled={!hasRewards}
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium select-none">Fixed</span>
  </div>
</div>
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
                        {!hasRewards
                          ? "You have chosen to run this campaign without TRUST rewards, so it can be published without deploying a contract."
                          : "The reward pool and number of participants cannot be reduced once the campaign is published. They can only be increased, so please ensure these values are correct before publishing. TRUST tokens can only be withdrawn from the contract after the campaign end date."}
                      </CardDescription>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-white/60 hover:text-white"
                        onClick={() => setLocation("/studio-dashboard")}
                      >
                        ← Back
                      </Button>

                      <Button
                        type="submit"
                        className="bg-[#8B3EFE] hover:bg-[#7b35e6]"
                        disabled={loading || saveLoading}
                      >
                        {loading || saveLoading ? "Saving..." : "Next →"}
                      </Button>
                    </div>

                  </form>
                </Card>
                </>
              )}

{/* TASKS TAB */}
{activeTab === "tasks" && (
  <div className="relative">

    {/* Small Add Task Button - Top Right */}
    <button
      onClick={() => setShowModal(true)}
      className="absolute -top-10 right-0 px-3 py-1 bg-[#8B3EFE] text-purple-300 hover:bg-[#7b35e6] rounded-lg text-sm font-semibold flex items-center gap-2 transition"
    >
      <span className="flex items-center justify-center w-3 h-3 pb-1 bg-[#8B3EFE] text-purple-900 rounded-full text-xs font-bold">
        +
      </span>
      Add Task
    </button>

    {tasks.length === 0 ? (
      <div
        className="w-full border-2 border-dashed border-purple-500 rounded-2xl p-8 bg-gray-900 hover:border-[#8B3EFE] transition cursor-pointer mt-8"
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
            className="mt-4 flex items-center justify-center gap-2 px-4 py-1 bg-purple-900 text-purple-400 hover:bg-[#7b35e6] font-semibold rounded-lg transition"
          >
            <span className="flex items-center justify-center w-3 h-3 pb-1 bg-[#8B3EFE] text-purple-900 rounded-full text-lg font-bold">
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

            <p className="flex-1 text-white">{task.description || task.type}</p>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition"
                onClick={() => {
                  setNewTask({
                    ...task,
                    roleId: task.roleId ?? "",
                    channelId: task.channelId ?? "",
                    guildId: task.guildId || hubGuildId || "",
                  });
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

    {/* Tasks tab footer: Back + Next → Review */}
    <div className="flex justify-between items-center mt-6">
      <button
        className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition"
        onClick={() => setActiveTab("details")}
      >
        ← Back
      </button>
      <button
        className="px-6 py-2 bg-[#8B3EFE] text-white rounded-lg text-sm font-semibold hover:bg-[#7b35e6] transition flex items-center gap-2 disabled:opacity-60"
        disabled={saveLoading}
        onClick={() => {
          if (tasks.length === 0) {
            toast({ title: "No tasks", description: "Please add at least one task before reviewing.", variant: "destructive" });
            return;
          }
          handleSaveDraft("review");
        }}
      >
        {saveLoading ? "Saving..." : "Next →"}
        {!saveLoading && <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
      </button>
    </div>
  </div>
)}


{/* ===== MODAL ===== */}
{showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
    <div className="bg-[#0d0d14] w-full max-w-xl border border-purple-500/20 p-6 rounded-2xl relative shadow-[0_0_60px_rgba(131,58,253,0.2)] animate-modal-pop">

      {/* Close Button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-lg leading-none"
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
            className="w-full p-2 rounded-lg bg-[#0d0d14] text-white border border-white/10 focus:outline-none focus:border-purple-500 [&>option]:bg-[#0d0d14]"
            value={newTask.type}
            onChange={(e) => {
              const type = e.target.value;
              const isDiscord = isDiscordFixedTaskType(type);
              const isDiscordRole = isDiscordRoleTaskType(type);
              const isDiscordMessage = isDiscordMessageTaskType(type);
              const isTwitter = type === "Comment on our X post" || type === "Follow us on X";
              const isPortal = type === "Check Out the Portal Claims";
              const isOther = type === "others";
              const isFeedback = type === "Give Feedback";
              setNewTask({
                ...newTask,
                type,
                platform: isDiscord ? "Discord" : isTwitter ? "Twitter" : (isPortal || isOther || isFeedback) ? "" : newTask.platform,
                evidence: isDiscord || isPortal ? "" : isTwitter ? "submit_link" : isFeedback ? "" : newTask.evidence,
                validation: isDiscord ? "Discord Auth" : isPortal ? "Auto Verified" : isFeedback ? "Manual Validation" : (newTask.validation === "Discord Auth" || newTask.validation === "Auto Verified" ? "Manual Validation" : newTask.validation),
                verificationMode: isFeedback ? "feedback" : "",
                roleId: isDiscordRole ? newTask.roleId : "",
                channelId: isDiscordMessage ? newTask.channelId : "",
                guildId: isDiscord ? (newTask.guildId || hubGuildId || "") : "",
              });
            }}
          >
            <option value="">Select task</option>
            <option value="Comment on our X post">Comment on X</option>
            <option value="Follow us on X">Follow on X</option>
            <option value="Join Us On Discord">Join Discord</option>
            <option value={DISCORD_ROLE_TASK_TYPE}>Acquire a Role (Discord)</option>
            <option value={DISCORD_MESSAGE_TASK_TYPE}>Send Message in Channel (Discord)</option>
            <option value="Check Out the Portal Claims">Portal Claims</option>
            <option value="Give Feedback">Give Feedback</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* Platform */}
        {newTask.type !== "Check Out the Portal Claims" && newTask.type !== "others" && newTask.type !== "Give Feedback" && !isDiscordFixedTaskType(newTask.type) && (
        <div>
          <label className="text-sm text-white/70 mb-2 block">Platform</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNewTask({ ...newTask, platform: "Twitter", evidence: "submit_link", validation: newTask.validation === "Discord Auth" ? "Manual Validation" : newTask.validation, roleId: "", channelId: "", guildId: "" })}
              className={`flex-1 border py-2 rounded-lg transition ${
                newTask.platform === "Twitter"
                  ? "bg-[#8B3EFE] text-white border-purple-500"
                  : "bg-purple-900 border-purple-800 text-white hover:border-purple-500"
              }`}
            >
              Twitter
            </button>
            <button
              type="button"
              onClick={() => setNewTask({
                ...newTask,
                platform: "Discord",
                evidence: "",
                validation: "Discord Auth",
                guildId: newTask.guildId || hubGuildId || "",
              })}
              className={`flex-1 border py-2 rounded-lg transition ${
                newTask.platform === "Discord"
                  ? "bg-[#8B3EFE] text-white border-purple-500"
                  : "bg-purple-900 border-purple-800 text-white hover:border-purple-500"
              }`}
            >
              Discord
            </button>
          </div>
        </div>
        )}
      </div>

      {/* TASK DETAILS CARD */}
      <div className="bg-white/5 p-5 rounded-xl mb-6 border border-white/10">

        {/* Handle or URL */}
        <div className="mb-4">
          <label className="text-sm text-white/70 mb-2 block">
            {newTask.type === "Give Feedback"
              ? "Website URL"
              : isDiscordMessageTaskType(newTask.type)
                ? "Discord Channel Link"
                : newTask.platform === "Discord"
                  ? "Discord Invite Link"
                  : newTask.type === "Comment on our X post"
                    ? "Post URL"
                    : newTask.type === "Follow us on X" || newTask.platform === "Twitter"
                      ? "Profile URL"
                      : "Handle or URL"}
          </label>
          <input
            type="text"
            placeholder={newTask.type === "Give Feedback"
              ? "https://example.com"
              : isDiscordMessageTaskType(newTask.type)
                ? "https://discord.com/channels/..."
                : newTask.platform === "Discord"
                  ? "https://discord.gg/..."
                  : newTask.type === "Comment on our X post"
                    ? "https://x.com/username/status/..."
                    : newTask.type === "Follow us on X" || newTask.platform === "Twitter"
                      ? "https://x.com/username"
                      : "..."}
            value={newTask.handleOrUrl}
            onChange={(e) =>
              setNewTask({ ...newTask, handleOrUrl: e.target.value })
            }
            className="w-full p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Task Description */}
        <div className="mb-4">
          <label className="text-sm text-white/70 mb-2 block">{newTask.type === "Give Feedback" ? "Task Description" : "Task Description"}</label>
          <input
            type="text"
            placeholder={newTask.type === "Give Feedback" ? "e.g. Tell us what you think about our platform" : "..."}
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-purple-500"
          />
        </div>

        {(newTask.platform === "Discord" || isDiscordFixedTaskType(newTask.type)) && (!hubDiscordConnected || !hubGuildId) && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {!hubDiscordConnected
              ? "Discord is optional for your studio overall, but you must connect it before creating Discord-related tasks."
              : "Finish the Discord setup by selecting a server before creating Discord-related tasks."}
          </div>
        )}

        {(isDiscordRoleTaskType(newTask.type) || isDiscordMessageTaskType(newTask.type)) && (
          <div className="mb-4 space-y-2">
            {(!hubDiscordConnected || !hubGuildId) && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                {!hubDiscordConnected
                  ? "Discord is not connected for this hub. Connect Discord first."
                  : "No Discord guild is linked to this hub. Select a guild first in Discord setup."}
              </div>
            )}

            {isDiscordRoleTaskType(newTask.type) && (
              <div>
                <label className="text-sm text-white/70 mb-2 block">Discord Role</label>
                <select
                  value={newTask.roleId}
                  disabled={!hubDiscordConnected || !hubGuildId || discordOptionsLoading}
                  onChange={(e) => setNewTask({ ...newTask, roleId: e.target.value, guildId: hubGuildId || newTask.guildId })}
                  className="w-full p-2 rounded-lg bg-white/5 text-white border border-white/10 disabled:opacity-60 focus:outline-none focus:border-purple-500 [&>option]:bg-[#0d0d14]"
                >
                  <option value="">{discordOptionsLoading ? "Loading roles..." : "Select a role"}</option>
                  {discordRoles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                  {newTask.roleId && !discordRoles.some((role) => role.id === newTask.roleId) && (
                    <option value={newTask.roleId}>Selected role ({newTask.roleId})</option>
                  )}
                </select>
                {discordRolesError && <p className="text-xs text-red-300 mt-1">{discordRolesError}</p>}
                {!discordOptionsLoading && !discordRolesError && hubDiscordConnected && hubGuildId && discordRoles.length === 0 && (
                  <p className="text-xs text-white/50 mt-1">No roles available for this guild.</p>
                )}
              </div>
            )}

            {isDiscordMessageTaskType(newTask.type) && (
              <div>
                <label className="text-sm text-white/70 mb-2 block">Discord Channel</label>
                <select
                  value={newTask.channelId}
                  disabled={!hubDiscordConnected || !hubGuildId || discordOptionsLoading}
                  onChange={(e) => setNewTask({ ...newTask, channelId: e.target.value, guildId: hubGuildId || newTask.guildId })}
                  className="w-full p-2 rounded-lg bg-white/5 text-white border border-white/10 disabled:opacity-60 focus:outline-none focus:border-purple-500 [&>option]:bg-[#0d0d14]"
                >
                  <option value="">{discordOptionsLoading ? "Loading channels..." : "Select a channel"}</option>
                  {discordChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {String(channel.name ?? "").startsWith("#") ? String(channel.name ?? "") : `#${String(channel.name ?? "Unknown channel")}`}
                    </option>
                  ))}
                  {newTask.channelId && !discordChannels.some((channel) => channel.id === newTask.channelId) && (
                    <option value={newTask.channelId}>Selected channel ({newTask.channelId})</option>
                  )}
                </select>
                {discordChannelsError && <p className="text-xs text-red-300 mt-1">{discordChannelsError}</p>}
                {!discordOptionsLoading && !discordChannelsError && hubDiscordConnected && hubGuildId && discordChannels.length === 0 && (
                  <p className="text-xs text-white/50 mt-1">No channels available for this guild.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Evidence + Validation */}
        {newTask.platform === "Discord" || isDiscordFixedTaskType(newTask.type) ? (
          <div className="flex items-center gap-3 rounded-lg bg-indigo-900/50 border border-indigo-500/50 px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-400 flex-shrink-0">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            <div>
              <p className="text-sm text-indigo-300 font-medium">Verified via Discord Auth</p>
              <p className="text-xs text-white/50 mt-0.5">Users must connect their Discord account. Verification is automatic.</p>
            </div>
          </div>
        ) : newTask.type === "Check Out the Portal Claims" ? (
          <div className="flex items-center gap-3 rounded-lg bg-purple-900/50 border border-purple-500/50 px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-400 flex-shrink-0">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-purple-300 font-medium">Auto-verified via Portal</p>
              <p className="text-xs text-white/50 mt-0.5">Completion is verified automatically after the user completes the task.</p>
            </div>
          </div>
        ) : newTask.type === "Give Feedback" ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-900/50 border border-emerald-500/50 px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-400 flex-shrink-0">
              <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.29 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.68-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-emerald-300 font-medium">User Feedback Submission</p>
              <p className="text-xs text-white/50 mt-0.5">Users will visit the website and submit written feedback (min. 200 characters). Reviewed manually.</p>
            </div>
          </div>
        ) : newTask.type === "others" ? (
          <div>
            <label className="text-sm text-white/70 mb-2 block">Verification Mode</label>
            <div className="flex gap-3">
              {([
                { value: "image_upload", label: "📷 Image Upload", hint: "User uploads a screenshot" },
                { value: "submit_link", label: "🔗 Submit Link", hint: "User submits a URL" },
                { value: "auto", label: "⚡ Auto (link click)", hint: "Verified when link is clicked" },
              ] as { value: string; label: string; hint: string }[]).map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  title={hint}
                  onClick={() => setNewTask({ ...newTask, verificationMode: value, evidence: value !== "auto" ? value : "", validation: value === "auto" ? "Auto Verified" : "Manual Validation" })}
                  className={`flex-1 border py-2 px-2 rounded-lg text-xs transition ${
                    newTask.verificationMode === value
                      ? "bg-[#8B3EFE] text-white border-purple-500"
                      : "bg-purple-950 border-purple-800 text-white/70 hover:border-purple-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {newTask.verificationMode && (
              <p className="text-xs text-white/40 mt-2">
                {newTask.verificationMode === "image_upload" && "Users will upload a screenshot as proof."}
                {newTask.verificationMode === "submit_link" && "Users will submit a link to prove completion."}
                {newTask.verificationMode === "auto" && "Task is marked complete as soon as the user clicks the link."}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Evidence Upload */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Evidence Upload</label>
              <div className="flex items-center gap-2 w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                <span className="text-purple-400">🔗</span>
                <span>Submit Link</span>
              </div>
            </div>

            {/* Validation Type */}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Validation Type</label>
              <div className="relative">
                <input
                  type="text"
                  value={newTask.validation}
                  readOnly
                  className="w-full p-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-purple-500 pr-10"
                />
                <img
                  src="/purple-check.png"
                  alt="Verified"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          onClick={() => setShowModal(false)}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveTask}
          className="px-5 py-2.5 rounded-xl bg-[#8B3EFE] text-white text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(131,58,253,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          Save Task
        </button>
      </div>
    </div>
  </div>
)}


{activeTab === "review" && (
  <Card className="p-8 space-y-6 bg-black">
    <h2 className="text-2xl font-bold">Final Campaign Review</h2>

    {/* Campaign Board */}
    <div className="rounded-xl border border-purple-500/60 bg-white/5 overflow-hidden">

      {/* Top: image + title */}
      <div className="flex gap-6 p-6">
        {/* Cover image */}
        <div className="w-36 h-36 flex-shrink-0 rounded-xl overflow-hidden border border-white/10">
          {(coverImagePreview || imagePreview) ? (
            <img
              src={coverImagePreview || imagePreview || undefined}
              alt="Campaign Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/40 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Title + description */}
        <div className="flex flex-col justify-center gap-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">
            {campaignName || "Untitled Campaign"}
          </h3>
          <p className="text-white/60 text-sm">
            {campaignTitle || "No description provided"}
          </p>
          {startDate && endDate && (
            <p className="text-white/40 text-xs mt-1">
              {formatDate(startDate)} {startTime} → {formatDate(endDate)} {endTime}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-white/10">
        {/* Reward Pool */}
        <div className="flex flex-col gap-1 p-5">
          <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wide">
            <img src="/reward-pool.png" alt="" className="w-4 h-4 opacity-60" />
            Reward Pool
          </div>
          <span className="text-white text-lg font-semibold">{Number(rewardPool) > 0 ? `${rewardPool} $TRUST` : "—"}</span>
        </div>

        {/* Target Users */}
        <div className="flex flex-col gap-1 p-5 border-t md:border-t-0 border-l md:border-l border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wide">
            <img src="/target-users.png" alt="" className="w-4 h-4 opacity-60" />
            Target Users
          </div>
          <span className="text-white text-lg font-semibold">{participants || "—"}</span>
        </div>

        {/* XP Allocated */}
        <div className="flex flex-col gap-1 p-5 border-t border-white/10 md:border-l">
          <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wide">
            <span className="text-purple-400 font-bold text-sm leading-none">XP</span>
            XP Allocated
          </div>
          <span className="text-white text-lg font-semibold">{xpRewards ? `${xpRewards} XP` : "—"}</span>
        </div>

        {/* Per Participant */}
        <div className="flex flex-col gap-1 p-5 border-t border-white/10 md:border-l">
          <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wide">
            <img src="/reward-pool.png" alt="" className="w-4 h-4 opacity-60" />
            Per Participant
          </div>
          <span className="text-white text-lg font-semibold">
            {Number(rewardPool) > 0 && participants && Number(participants) > 0
              ? `${(Number(rewardPool) / Number(participants)).toFixed(2)} $TRUST`
              : "—"}
          </span>
        </div>
      </div>
    </div>

    {/* Task Overview */}
    <div className="flex items-center justify-between mt-6">
      <h3 className="text-xl font-semibold">Task Overview</h3>
      <button className="px-3 py-1 bg-[#8B3EFE] text-white rounded-lg text-sm hover:bg-[#7b35e6] transition">
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

            <div className="flex-1 min-w-0">
              <p className="text-white">{task.description || task.type}</p>
              {task.verificationMode && (
                <p className="text-xs text-white/50 truncate">{task.verificationMode === "image_upload" ? "📷 Image proof" : task.verificationMode === "submit_link" ? "🔗 Link submission" : task.verificationMode === "auto" ? "⚡ Auto" : ""}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-[#8B3EFE] text-white rounded-lg text-sm hover:bg-[#7b35e6] transition"
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
                  setNewTask({
                    ...task,
                    roleId: task.roleId ?? "",
                    channelId: task.channelId ?? "",
                    guildId: task.guildId || hubGuildId || "",
                  });
                  setShowModal(true);
                  setEditingIndex(index);
                }}
              >
                Edit
              </button>

              <button
                className="px-3 py-1 bg-gray-800 rounded-lg text-white hover:bg-red-800 transition"
                onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
              >
                <img src="/delete.png" alt="Delete" className="w-4 h-4" />
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
{hasRewards && !isPublished && (
<button
  type="button"
  onClick={handleDeployRewardsContract}
  className="px-4 py-2 bg-[#8B3EFE] text-white rounded-lg text-sm hover:bg-[#7b35e6] transition disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={loading || saveLoading || deployLoading || !!rewardContractAddress.trim()}
>
  {deployLoading
    ? "Deploying..."
    : rewardContractAddress
      ? "Rewards Contract Deployed"
      : "Deploy Rewards Contract"}
</button>
)}
{isEditMode && isPublished ? (
  <button
    onClick={() => handleUpdateCampaign()}
    className="px-4 py-2 bg-[#8B3EFE] text-white rounded-lg text-sm hover:bg-[#7b35e6] transition disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={loading || saveLoading}
  >
    {updateCampaignButtonLabel}
  </button>
) : (
  <button
    onClick={handlePublishButtonClick}
    className="px-4 py-2 bg-[#8B3EFE] text-white rounded-lg text-sm hover:bg-[#7b35e6] transition disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={loading || saveLoading}
  >
    Publish Campaign
  </button>
)}
  </div>
</div>
{hasRewards && rewardContractAddress && (
  <div className="mt-2 space-y-1">
    <p className="text-xs text-white/60 break-all">
      Rewards Contract: {rewardContractAddress}
    </p>
    {rewardsDeployment && (
      <p className="text-xs text-green-300">
        Funded {rewardsDeployment.fundedAmount} TRUST for {rewardsDeployment.maxClaimableParticipants} participants.
      </p>
    )}
  </div>
)}
  </Card>
  
    )}

  {/* ========================= */}
  {/* PUBLISH MODAL */}
  {/* ========================= */}
  {showPublishModal && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d14] w-full max-w-md border border-purple-500/20 p-6 rounded-2xl relative shadow-[0_0_60px_rgba(131,58,253,0.2)] animate-modal-pop">

        {/* Close Icon */}
        <button
          onClick={() => setShowPublishModal(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-lg leading-none"
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
            Campaign Launch Fee
          </h2>
          <p className="text-white/70 mt-2">
            Pay the campaign launch fee to publish this campaign and make it available for participants.
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold text-sm">Campaign Launch Fee</span>
            <span className="text-purple-400 font-bold text-sm">1000 $TRUST</span>
          </div>
          <p className="text-white/60 text-xs mb-3">
            A one-time fee of 1000 $TRUST is required to launch and publish this campaign.
          </p>

          {paymentTxHash ? (
            <div className="flex items-center gap-2 bg-green-900/40 border border-green-600/50 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div className="min-w-0">
                <p className="text-green-400 text-xs font-semibold">Payment confirmed</p>
                <p className="text-white/40 text-[10px] truncate">{paymentTxHash}</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={paymentLoading}
              onClick={async () => {
                setPaymentLoading(true);
                try {
                  const hash = await payStudioHubFee();
                  await projectApiRequest({
                    method: "PATCH",
                    endpoint: "/hub/save-payment-hash",
                    data: { txHash: hash },
                  });
                  setPaymentTxHash(hash);
                  toast({ title: "Payment successful", description: "1000 $TRUST sent. You can now publish your campaign." });
                } catch (err: any) {
                  toast({ title: "Payment failed", description: err.message ?? "Transaction was rejected.", variant: "destructive" });
                } finally {
                  setPaymentLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#8B3EFE] hover:bg-[#7b35e6] disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-4 py-2 transition"
            >
              {paymentLoading ? (
                <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Waiting for wallet…</>
              ) : (
                <>Pay 1000 $TRUST</>
              )}
            </button>

          )}
        </div>

<button
  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#8B3EFE] text-white text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(131,58,253,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
  onClick={async () => {
    if (!campaignTitle || !campaignName) {
      toast({ title: "Incomplete details", description: "Please fill in campaign name and description.", variant: "destructive" });
      return;
    }
    if (tasks.length === 0) {
      toast({ title: "No tasks", description: "Please add at least one task.", variant: "destructive" });
      return;
    }
    if (!paymentTxHash.trim()) {
      toast({ title: "Payment required", description: "Please complete the 1000 $TRUST payment before publishing.", variant: "destructive" });
      return;
    }
    const rewardPoolRequiresContract = Number(rewardPool) > 0;
    if (hasRewards && (!rewardPool || Number(rewardPool) <= 0)) {
      toast({ title: "Reward pool required", description: "Set a reward pool before publishing a rewards-enabled campaign.", variant: "destructive" });
      return;
    }
    if (rewardPoolRequiresContract && !rewardContractAddress.trim()) {
      toast({ title: "Rewards contract required", description: "Deploy the rewards contract before publishing this campaign.", variant: "destructive" });
      return;
    }
    const rewardPublishError = getDraftRewardsPublishError();
    if (rewardPublishError) {
      toast({ title: "Cannot publish", description: rewardPublishError, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const savedCampaignId = campaignId ?? await handleSaveDraft();
      if (!savedCampaignId) return;

      await projectApiRequest({
        method: "PATCH",
        endpoint: "/hub/publish-campaign",
        params: { id: savedCampaignId },
        data: { txHash: paymentTxHash },
      });

      toast({ title: "Campaign published!", description: "Your campaign is now live." });
      setPaymentTxHash("");
      setPublishedCampaign({
        title: campaignName,
        description: campaignTitle,
        name: campaignName,
        rewardPool: hasRewards && Number(rewardPool) > 0 ? rewardPool : "",
        coverImage: coverImagePreview ?? undefined
      });
      setShowPublishModal(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish campaign.";
      toast({ title: "Publish failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }}
  disabled={loading || !paymentTxHash || (Number(rewardPool) > 0 && !rewardContractAddress.trim())}
>
  {loading ? <span className="flex items-center gap-2"><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Publishing...</span> : "Publish"}
</button>

        {/* Cancel Button */}
        <button
          onClick={() => setShowPublishModal(false)}
          className="mt-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d14] w-full max-w-xl border border-purple-500/20 p-6 rounded-2xl relative shadow-[0_0_60px_rgba(131,58,253,0.2)] animate-modal-pop">

        {/* Close Icon */}
        <button
          onClick={() => setShowSuccessModal(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-lg leading-none"
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
            {isEditMode ? "Campaign Successfully Updated" : "Payment Successfully Completed"}
          </h2>
          <p className="text-white/70 mt-2">
            {isEditMode
              ? "Your campaign changes have been saved and are now live."
              : "Your 1000 $TRUST payment was confirmed and your project is ready to go live."}
          </p>
        </div>

        {/* Campaign Snapshot Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-purple-500/30 p-5">

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
      {publishedCampaign?.name}
    </h3>

    <p className="text-white/70 text-sm mt-1">
      {publishedCampaign?.description}
    </p>

    <p className="text-white/60 text-sm mt-2">
      {isEditMode ? "Campaign updated successfully" : "Campaign published successfully"}
    </p>
  </div>

  {/* Bottom Info Blocks */}
  <div className="flex mt-4 text-white/80 border border-white/10 rounded-lg overflow-hidden">

    <div className="flex-1 flex flex-col items-center p-3 border-r border-white/10">
      <span className="text-xs font-semibold uppercase tracking-wide">
        Total Reward Pool
      </span>
      <span className="text-white mt-1 text-sm font-semibold">
        {publishedCampaign?.rewardPool ? `${publishedCampaign.rewardPool} $TRUST` : "—"}
      </span>
    </div>

    <div className="flex-1 flex flex-col items-center p-3">
      <span className="text-xs font-semibold uppercase tracking-wide">
        Status
      </span>
      <span className="mt-1 text-sm font-semibold text-green-400">
  PUBLISHED
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
  className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#8B3EFE] text-white text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(131,58,253,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
>
  <span>Continue</span>
</Button>

      </div>
    </div>
  )}

        </div>
        </main>
  );
}
