import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { projectApiRequest } from "../../lib/projectApi";

type Task = { id: string; title: string; description?: string };

// New project-scoped campaign create page with 3 tabs (Details, Tasks, Rewards & Referrals)
export default function ProjectCreateCampaign() {
  const [location, setLocation] = useLocation();

  // pull projectId from current location: /project/:projectId/campaigns/create
  const m = location.match(/^\/project\/([^\/]+)/);
  const projectId = m ? m[1] : "unknown";

  const [tab, setTab] = useState<number>(0);

  // Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [starts_at, setstarts_at] = useState("");
  const [ends_at, setends_at] = useState("");
  const [detailErrors, setDetailErrors] = useState<string[]>([]);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskErrors, setTaskErrors] = useState<string[]>([]);

  // Rewards & Referrals
  const [rewardPoints, setRewardPoints] = useState<number | "">("");
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [rewardErrors, setRewardErrors] = useState<string[]>([]);

  const tabTitles = useMemo(() => ["Details", "Tasks", "Rewards & Referrals"], []);

  function validateDetails() {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Campaign name is required");
    if (!description.trim()) errs.push("Description is required");
    if (!starts_at) errs.push("Start date is required");
    // optional: if ends_at present it must be after starts_at
    if (starts_at && ends_at && new Date(ends_at) < new Date(starts_at)) errs.push("End date must be after start date");
    setDetailErrors(errs);
    return errs.length === 0;
  }

  function validateTasks() {
    const errs: string[] = [];
    if (tasks.length === 0) errs.push("At least one task is required for the campaign");
    setTaskErrors(errs);
    return errs.length === 0;
  }

  function validateRewards() {
    const errs: string[] = [];
    const pts = typeof rewardPoints === "number" ? rewardPoints : 0;
    if (pts <= 0 && !referralEnabled) errs.push("Set reward points (positive) or enable referrals");
    setRewardErrors(errs);
    return errs.length === 0;
  }

  function goNext() {
    // validate current tab before advancing
    if (tab === 0) {
      if (!validateDetails()) return;
      setTab(1);
    } else if (tab === 1) {
      if (!validateTasks()) return;
      setTab(2);
    }
  }

  function goBack() {
    if (tab > 0) setTab(tab - 1);
  }

  function addTask() {
    const errs: string[] = [];
    if (!taskTitle.trim()) errs.push("Task title required");
    if (errs.length) {
      setTaskErrors(errs);
      return;
    }
    const t: Task = { id: Math.random().toString(36).slice(2, 9), title: taskTitle.trim(), description: taskDescription.trim() };
    setTasks((s) => [...s, t]);
    setTaskTitle("");
    setTaskDescription("");
    setTaskErrors([]);
  }

  function removeTask(id: string) {
    setTasks((s) => s.filter((t) => t.id !== id));
  }

  async function submitCampaign() {
    // final validation
    if (!validateRewards()) return;

    const payload = {
      projectId,
      name: name.trim(),
      description: description.trim(),
      starts_at: starts_at || null,
      ends_at: ends_at || null,
      tasks,
      rewards: { points: typeof rewardPoints === 'number' ? rewardPoints : 0, referralEnabled },
    };

    try {
      const fd = new FormData();
      fd.append("title", payload.name);
      fd.append("description", payload.description);
      fd.append("nameOfProject", projectId);
      if (payload.starts_at) fd.append("starts_at", payload.starts_at);
      if (payload.ends_at) fd.append("ends_at", payload.ends_at);
      fd.append("reward", JSON.stringify({ xp: payload.rewards.points, pool: 0 }));
      fd.append("campaignQuests", JSON.stringify(
        payload.tasks.map((t) => ({ title: t.title, description: t.description ?? "", url: "", reward: { xp: payload.rewards.points } }))
      ));
      fd.append("txHash", "");
      await projectApiRequest({
        method: "POST",
        endpoint: "/project/create-campaign",
        formData: fd,
      });
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
    setLocation(`/project/${projectId}/campaigns`);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Campaign</h1>
          <p className="text-sm text-muted-foreground mt-1">Creating a campaign for project: <span className="font-medium">{projectId}</span></p>
        </div>
        <div>
          <Button variant="ghost" onClick={() => setLocation(`/project/${projectId}/campaigns`)}>Back to campaigns</Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-2">
          {tabTitles.map((tTitle, idx) => (
            <button
              key={tTitle}
              onClick={() => setTab(idx)}
              className={`px-4 py-2 rounded-md ${tab === idx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {tTitle}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-border/30 bg-card p-6">
          {tab === 0 && (
            <div>
              <h2 className="text-lg font-semibold">Campaign Details</h2>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Campaign name *</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 input w-full" />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Description *</span>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 textarea w-full" rows={4} />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <span className="text-sm font-medium">Start date *</span>
                    <input type="date" value={starts_at} onChange={(e) => setstarts_at(e.target.value)} className="mt-1 input" />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm font-medium">End date</span>
                    <input type="date" value={ends_at} onChange={(e) => setends_at(e.target.value)} className="mt-1 input" />
                  </label>
                </div>

                {detailErrors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {detailErrors.map((d) => <div key={d}>• {d}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 1 && (
            <div>
              <h2 className="text-lg font-semibold">Tasks</h2>
              <p className="text-sm text-muted-foreground mt-1">Add tasks that users will complete as part of this campaign.</p>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Task title</span>
                  <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="mt-1 input w-full" />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Task description</span>
                  <input value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="mt-1 input w-full" />
                </label>
                <div className="flex items-center gap-2">
                  <Button onClick={addTask}>Add task</Button>
                </div>

                {taskErrors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {taskErrors.map((d) => <div key={d}>• {d}</div>)}
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-medium">Current tasks</h3>
                  <ul className="mt-2 space-y-2">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-start justify-between bg-muted p-3 rounded-md">
                        <div>
                          <div className="font-medium">{t.title}</div>
                          {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
                        </div>
                        <div>
                          <button className="text-red-600 text-sm" onClick={() => removeTask(t.id)}>Remove</button>
                        </div>
                      </li>
                    ))}
                    {tasks.length === 0 && <li className="text-sm text-muted-foreground">No tasks yet</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div>
              <h2 className="text-lg font-semibold">Rewards & Referrals</h2>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Reward points per completion</span>
                  <input type="number" min={0} value={rewardPoints === '' ? '' : rewardPoints} onChange={(e) => setRewardPoints(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 input w-40" />
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={referralEnabled} onChange={(e) => setReferralEnabled(e.target.checked)} />
                  <span className="text-sm">Enable referral bonuses for this campaign</span>
                </label>

                {rewardErrors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {rewardErrors.map((d) => <div key={d}>• {d}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={goBack} disabled={tab === 0}>Back</Button>
            </div>
            <div className="flex items-center gap-2">
              {tab < 2 ? (
                <Button onClick={goNext}>Next</Button>
              ) : (
                <Button onClick={submitCampaign}>Create Campaign</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
