import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

type Task = {
  text: string;
  reward: number;
  link: string;
  status: "notStarted" | "inProgress" | "completed";
};

const campaignTasksInitial: Task[] = [
  { text: "Follow Nexura on X", reward: 100, link: "https://x.com/NexuraXYZ", status: "notStarted" },
  { text: "Join Nexura Discord", reward: 100, link: "https://discord.gg/caK9kATBya", status: "notStarted" },
  { text: "Drop a message on Discord", reward: 100, link: "https://discord.gg/caK9kATBya", status: "notStarted" },
  { text: "Support or Oppose the #Intuitionbilly Claim on Intuition Portal", reward: 100, link: "#", status: "notStarted" },
  { text: "Support or oppose the Nexura claim on Intuition Portal", reward: 100, link: "#", status: "notStarted" },
  { text: "Like and Comment on Nexura Pinned post", reward: 100, link: "#", status: "notStarted" },
];

export default function CampaignEnvironment() {
  const [tasks, setTasks] = useState<Task[]>(campaignTasksInitial);

  const handleTaskClick = (index: number) => {
    setTasks(prev => {
      const task = prev[index];
      let newStatus: Task["status"] = task.status;

      if (task.status === "notStarted") {
        window.open(task.link, "_blank");
        newStatus = "inProgress";
      } else if (task.status === "inProgress") {
        newStatus = "completed";
      }

      return prev.map((t, i) => i === index ? { ...t, status: newStatus } : t);
    });
  };

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0615] text-white relative p-6">
      <AnimatedBackground />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10">

        {/* Banner with Progress */}
        <div className="w-full bg-gradient-to-r from-purple-700/40 to-purple-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="uppercase text-xs opacity-60">Get Started</p>
              <p className="text-xl font-semibold">Join the Guild</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm opacity-70 uppercase">Total XP</p>
              <div className="bg-purple-600/30 border border-purple-500/40 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="font-bold">
                  {tasks.reduce((a, t) => a + (t.status === "completed" ? t.reward : 0), 0)} XP
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mt-3">
            <div
              className="h-3 bg-purple-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm opacity-60 mt-1">{progressPercentage}% completed</p>
        </div>

        {/* Main Quest Card */}
        <Card className="rounded-2xl bg-white/5 border-white/10 overflow-hidden shadow-xl">
          <div className="grid grid-cols-2">
            <div className="h-full">
              <img src="/campaign.png" alt="Quest" className="w-full h-full object-cover" />
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs opacity-50 uppercase mb-1">Nexura</p>
                <p className="text-xl font-bold leading-tight">Quest 001:<br />Join the Guild</p>
                <div className="mt-4">
                  <p className="uppercase text-xs opacity-50">Start Task</p>
                  <p className="text-sm opacity-80 leading-relaxed mt-1">
                    Complete simple tasks in the Nexura ecosystem and earn rewards.
                  </p>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs opacity-50 uppercase">Rewards</p>
                  <p className="text-sm">500 XP</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-6">
          {tasks.map((task, index) => {
            let buttonText = "Start Task";
            if (task.status === "inProgress") buttonText = `Claim Reward: ${task.reward} XP`;
            if (task.status === "completed") buttonText = "Completed";

            return (
              <div
                key={index}
                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-white">
                    {task.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4" />}
                  </div>
                  <span className="font-medium">{task.text}</span>
                </div>

                <button
                  onClick={() => handleTaskClick(index)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    task.status === "completed" ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
                  }`}
                >
                  {buttonText}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}