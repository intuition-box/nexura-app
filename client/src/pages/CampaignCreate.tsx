import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { useLocation } from "wouter";
import { Plus, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_ICONS,
  TASK_SUBTYPES_BY_CATEGORY,
  type TaskCategory,
  type CampaignTaskData,
} from "@shared/taskTypes";

interface TaskInProgress extends Partial<CampaignTaskData> {
  tempId: string;
}

export default function CampaignCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campaign fields
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [starts_at, setstarts_at] = useState("");
  const [ends_at, setends_at] = useState("");

  // Task builder state
  const [tasks, setTasks] = useState<TaskInProgress[]>([]);

  // Task form state (dropdown workflow)
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "">("");
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskXpReward, setTaskXpReward] = useState(10);
  const [taskConfig, setTaskConfig] = useState<Record<string, any>>({});

  const resetTaskForm = () => {
    setSelectedCategory("");
    setSelectedSubtype("");
    setTaskTitle("");
    setTaskDescription("");
    setTaskXpReward(10);
    setTaskConfig({});
    setShowTaskForm(false);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategory || !selectedSubtype) {
      toast({
        title: "Error",
        description: "Please select task category and type",
        variant: "destructive",
      });
      return;
    }

    const newTask: TaskInProgress = {
      tempId: Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      taskCategory: selectedCategory,
      taskSubtype: selectedSubtype,
      xpReward: taskXpReward,
      verificationConfig: taskConfig,
    };

    setTasks([...tasks, newTask]);

    toast({
      title: "Success",
      description: "Task added to campaign",
    });

    resetTaskForm();
  };

  const renderTaskSpecificFields = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory) {
      case "twitter":
        return (
          <div>
            <label className="text-white font-bold text-sm mb-2 block">Twitter URL</label>
            <Input
              placeholder="https://twitter.com/..."
              className="glass rounded-full"
              value={taskConfig.tweetUrl || ""}
              onChange={(e) => setTaskConfig({ ...taskConfig, tweetUrl: e.target.value })}
            />
          </div>
        );

      case "discord":
        return (
          <>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Server Invite Link *</label>
              <Input
                placeholder="https://discord.gg/..."
                className="glass rounded-full"
                value={taskConfig.serverInvite || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, serverInvite: e.target.value })}
              />
            </div>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Server ID (optional)</label>
              <Input
                placeholder="123456789"
                className="glass rounded-full"
                value={taskConfig.serverId || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, serverId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Channel ID (optional)</label>
              <Input
                placeholder="987654321"
                className="glass rounded-full"
                value={taskConfig.channelId || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, channelId: e.target.value })}
              />
            </div>
          </>
        );

      case "onchain":
        return (
          <>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Chain ID</label>
              <Input
                type="number"
                placeholder="1 (Ethereum Mainnet)"
                className="glass rounded-full"
                value={taskConfig.chainId || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, chainId: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Contract Address (optional)</label>
              <Input
                placeholder="0x..."
                className="glass rounded-full"
                value={taskConfig.contractAddress || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, contractAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Minimum Balance (optional)</label>
              <Input
                type="number"
                placeholder="0.1"
                className="glass rounded-full"
                value={taskConfig.minBalance || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, minBalance: parseFloat(e.target.value) })}
              />
            </div>
          </>
        );

      case "telegram":
        return (
          <>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Group/Channel Invite Link *</label>
              <Input
                placeholder="https://t.me/..."
                className="glass rounded-full"
                value={taskConfig.groupInvite || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, groupInvite: e.target.value })}
              />
            </div>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Group ID (optional)</label>
              <Input
                placeholder="123456789"
                className="glass rounded-full"
                value={taskConfig.groupId || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, groupId: e.target.value })}
              />
            </div>
          </>
        );

      case "email":
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailVerification"
              className="w-4 h-4"
              checked={taskConfig.requireVerification || false}
              onChange={(e) => setTaskConfig({ ...taskConfig, requireVerification: e.target.checked })}
            />
            <label htmlFor="emailVerification" className="text-white font-bold text-sm">
              Require email verification
            </label>
          </div>
        );

      case "quiz":
        return (
          <div className="glass rounded-3xl p-4">
            <p className="text-white/60 text-sm">Quiz questions can be configured after task creation</p>
          </div>
        );

      case "poh":
        return (
          <>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">POH Provider</label>
              <Select
                value={taskConfig.provider || ""}
                onValueChange={(value) => setTaskConfig({ ...taskConfig, provider: value })}
              >
                <SelectTrigger className="glass rounded-full">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authena">Authena</SelectItem>
                  <SelectItem value="github-passport">GitHub Passport</SelectItem>
                  <SelectItem value="gitcoin-passport">Gitcoin Passport</SelectItem>
                  <SelectItem value="worldcoin">Worldcoin</SelectItem>
                  <SelectItem value="brightid">BrightID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-white font-bold text-sm mb-2 block">Minimum Score (optional)</label>
              <Input
                type="number"
                placeholder="20"
                className="glass rounded-full"
                value={taskConfig.minScore || ""}
                onChange={(e) => setTaskConfig({ ...taskConfig, minScore: parseInt(e.target.value) })}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };


  const removeTask = (tempId: string) => {
    setTasks(tasks.filter(t => t.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign name",
        variant: "destructive",
      });
      return;
    }

    if (tasks.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one task",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Get actual project ID from context/auth
      const projectId = "temp-project-id";

      // Create campaign
      const campaignData = {
        projectId,
        name: campaignName,
        description: campaignDescription,
        startsAt: starts_at ? new Date(starts_at).toISOString() : null,
        endsAt: ends_at ? new Date(ends_at).toISOString() : null,
      };

      // For now, we'll need a campaigns endpoint - let's log for now
      console.log("Campaign data:", campaignData);
      console.log("Tasks:", tasks);

      toast({
        title: "Success",
        description: "Campaign created successfully (mock)",
      });

      // Navigate back to campaigns list
      setTimeout(() => {
        setLocation("/campaigns");
      }, 1000);

    } catch (error: any) {
      console.error("Failed to create campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">Create Campaign</h1>
            <p className="text-white/60 mt-2">Build an engaging campaign with custom tasks</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setLocation("/campaigns")}
            className="text-white/60 hover:text-white rounded-full"
          >
            Cancel
          </Button>
        </div>

        <div className="space-y-6">
          {/* Campaign Details */}
          <Card className="glass rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Campaign Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-white font-bold text-sm mb-2 block">Campaign Name *</label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  className="glass rounded-full"
                />
              </div>

              <div>
                <label className="text-white font-bold text-sm mb-2 block">Description</label>
                <Textarea
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="Describe your campaign..."
                  className="glass rounded-3xl min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-bold text-sm mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={starts_at}
                    onChange={(e) => setstarts_at(e.target.value)}
                    className="glass rounded-full"
                  />
                </div>
                <div>
                  <label className="text-white font-bold text-sm mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={ends_at}
                    onChange={(e) => setends_at(e.target.value)}
                    className="glass rounded-full"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Tasks Section */}
          <Card className="glass rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Campaign Tasks</h2>
              <Button
                onClick={() => setShowTaskForm(true)}
                className="rounded-full font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Task Form (Dropdown Workflow) */}
            {showTaskForm && (
              <Card className="glass rounded-3xl p-6 space-y-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">New Task</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTaskForm}
                    className="text-white/40 hover:text-white/60"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="text-white font-bold text-sm mb-2 block">Task Category *</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value as TaskCategory);
                      setSelectedSubtype("");
                    }}
                  >
                    <SelectTrigger className="glass rounded-full">
                      <SelectValue placeholder="Select task category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TASK_CATEGORIES).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <span>{TASK_CATEGORY_ICONS[category]}</span>
                            <span>{TASK_CATEGORY_LABELS[category]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtype Dropdown (only shown when category selected) */}
                {selectedCategory && (
                  <div>
                    <label className="text-white font-bold text-sm mb-2 block">Task Type *</label>
                    <Select
                      value={selectedSubtype}
                      onValueChange={setSelectedSubtype}
                    >
                      <SelectTrigger className="glass rounded-full">
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TASK_SUBTYPES_BY_CATEGORY[selectedCategory]).map(([subtype, label]) => (
                          <SelectItem key={subtype} value={subtype}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Task Details (only shown when subtype selected) */}
                {selectedSubtype && (
                  <>
                    <div>
                      <label className="text-white font-bold text-sm mb-2 block">Task Title *</label>
                      <Input
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g., Follow us on Twitter"
                        className="glass rounded-full"
                      />
                    </div>

                    <div>
                      <label className="text-white font-bold text-sm mb-2 block">Description</label>
                      <Textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Describe what users need to do..."
                        className="glass rounded-3xl min-h-[100px]"
                      />
                    </div>

                    <div>
                      <label className="text-white font-bold text-sm mb-2 block">XP Reward *</label>
                      <Input
                        type="number"
                        value={taskXpReward}
                        onChange={(e) => setTaskXpReward(parseInt(e.target.value) || 10)}
                        className="glass rounded-full"
                      />
                    </div>

                    {/* Task-specific fields */}
                    {renderTaskSpecificFields()}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveTask}
                        className="rounded-full font-bold flex-1"
                      >
                        Save Task
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetTaskForm}
                        className="rounded-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Task List */}
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No tasks added yet</p>
                <p className="text-white/40 text-sm mt-2">Click "Add Task" to create your first task</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card key={task.tempId} className="glass glass-hover rounded-3xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{task.taskCategory && TASK_CATEGORY_ICONS[task.taskCategory]}</span>
                          <div>
                            <h4 className="text-white font-bold">{task.title}</h4>
                            <p className="text-white/60 text-sm">
                              {task.taskCategory && TASK_CATEGORY_LABELS[task.taskCategory]} · {task.xpReward} XP
                            </p>
                          </div>
                        </div>
                        <p className="text-white/50 text-sm ml-11">{task.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.tempId)}
                        className="text-white/40 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/campaigns")}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!campaignName.trim() || tasks.length === 0 || isSubmitting}
              className="rounded-full font-bold px-8"
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

