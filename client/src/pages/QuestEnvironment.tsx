import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const tasks = [
  { text: "Like and Comment on this tweet", link: "https://x.com/NexuraXYZ" },
  { text: "Support or oppose the #Tribe Claim on Intuition Portal", link: "https://portal.intuition.systems/explore/triple/0xdce8ebb5bdb2668732d43cce5eca85d6a5119fd1bc92f36dd85998ab48ce7a63?tab=positions" },
  { text: "Support or Oppose TNS Claim on Intuition Portal", link: "https://portal.intuition.systems/explore/triple/0xd9c06c57fced2eafcc71a6b46ad9acd58e6b035e7ccc2dc6eebc00f8ba71172f?tab=positions" },
  { text: "Support or Oppose Sofia Claim on Intuition Portal", link: "https://portal.intuition.systems/explore/triple/0x98ba47f4d18ceb7550c6c593ef92835864f0c0e09d6e56108feac8a8a6012038?tab=positions" },
];

export default function QuestEnvironment() {
  const [, setLocation] = useLocation();
  const [taskIndex, setTaskIndex] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const currentTask = tasks[taskIndex];
  const progressPercentage = ((taskIndex + 1) / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      <AnimatedBackground />
      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setLocation("/quests")}>← Back</Button>
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <Card className="rounded-xl overflow-hidden shadow-lg">
          {/* Image at the top */}
          <div className="relative h-44 bg-black">
            <img
              src="/quest-1.png"
              alt="Quest Image"
              className="w-full h-full object-cover rounded-t-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-gray-200">{currentTask.text}</p>

            {currentTask.link && (
              <a
                href={currentTask.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block text-center px-3 py-2 bg-[#1f6feb] hover:bg-[#388bfd] rounded-lg font-medium"
              >
                <ExternalLink className="w-4 h-4 inline mr-2" /> Open Task
              </a>
            )}

            {taskIndex < tasks.length - 1 ? (
              <Button className="w-full mt-2" onClick={() => setTaskIndex(taskIndex + 1)}>Continue</Button>
            ) : (
              <div className="text-center mt-2 space-y-2">
                {!rewardClaimed ? (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg"
                    onClick={() => setRewardClaimed(true)}
                  >
                    Claim Reward: 500 XP
                  </Button>
                ) : (
                  <p className="text-green-400 font-semibold">Reward claimed! 🎉</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
