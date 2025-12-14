import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";

type Task = {
  text: string;
  reward: string;
  link: string;
  status: "notStarted" | "inProgress" | "completed";
};

const tasks200Initial: Task[] = [
  { text: "Like and Comment on this Nexura tweet", reward: "100 XP", link: "#", status: "notStarted" },
  { text: "Support or Oppose the #Tribe Claim on Intuition Portal", reward: "100 XP", link: "#", status: "notStarted" },
  { text: "Support or Oppose the TNS Claim on Intuition Portal", reward: "100 XP", link: "#", status: "notStarted" },
  { text: "Support or Oppose the Sofia on Intuition Portal", reward: "100 XP", link: "#", status: "notStarted" },
];

export default function CampaignEnvironment() {
  const [tasks200, setTasks200] = useState<Task[]>(tasks200Initial);
  const [totalXP, setTotalXP] = useState(0);

  const handleTaskClick = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, index: number) => {
    const task = tasks[index];

    if (task.status === "notStarted") {
      // Open task link
      window.open(task.link, "_blank");
      setTasks(prev => prev.map((t, i) => i === index ? { ...t, status: "inProgress" } : t));
    } else if (task.status === "inProgress") {
      // Claim reward
      setTasks(prev => prev.map((t, i) => i === index ? { ...t, status: "completed" } : t));
      setTotalXP(prev => prev + parseInt(task.reward));
    }
  };

  const renderTaskRow = (task: Task, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, index: number) => {
    let buttonText = "Start Task";
    if (task.status === "inProgress") buttonText = `Claim Reward: ${task.reward}`;
    if (task.status === "completed") buttonText = "Completed";

    return (
      <div
        key={index}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
      >
        <p className="font-medium">{task.text}</p>

        <button
          onClick={() => handleTaskClick(tasks, setTasks, index)}
          className={`px-5 py-2 rounded-full text-sm font-semibold ${
            task.status === "completed" ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
          {buttonText}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0615] text-white relative p-6">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-10">

        {/* Banner */}
        <div className="w-full bg-gradient-to-r from-purple-700/40 to-purple-900/40 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
          <div>
            <p className="uppercase text-xs opacity-60">Get Started</p>
            <p className="text-xl font-semibold">Join the Guild</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm opacity-70 uppercase">Total XP</p>
            <div className="bg-purple-600/30 border border-purple-500/40 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="font-bold">{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Main Quest Card */}
        <Card className="rounded-2xl bg-white/5 border-white/10 overflow-hidden shadow-xl">
          <div className="grid grid-cols-2">
            <div className="h-full">
              <img
                src="/campaign.png"
                alt="Quest"
                className="w-full h-full object-cover"
              />
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

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 mt-6">
                Complete Tasks
              </Button>
            </div>
          </div>
        </Card>

        {/* 200 XP Section */}
        <h2 className="text-lg font-semibold opacity-90">Get 200 XP</h2>
        {tasks200.map((task, i) => renderTaskRow(task, tasks200, setTasks200, i))}
      </div>
    </div>
  );
};