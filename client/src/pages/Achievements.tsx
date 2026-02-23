import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../lib/auth";
import AnimatedBackground from "../components/AnimatedBackground";

// Level achievement data
const levelAchievements = [
  { level: 5, xpRequired: 100, color: "#8b5cf6", unlocked: true },
  { level: 10, xpRequired: 200, color: "#6b7280", unlocked: false },
  { level: 20, xpRequired: 400, color: "#6b7280", unlocked: false },
  { level: 30, xpRequired: 600, color: "#8b1538", unlocked: false },
  { level: 40, xpRequired: 800, color: "#6b7280", unlocked: false },
  { level: 50, xpRequired: 1000, color: "#6b7280", unlocked: false },
  { level: 60, xpRequired: 1200, color: "#6b7280", unlocked: false },
  { level: 70, xpRequired: 1400, color: "#6b7280", unlocked: false },
  { level: 80, xpRequired: 1600, color: "#6b7280", unlocked: false },
  { level: 90, xpRequired: 1800, color: "#6b7280", unlocked: false },
  { level: 100, xpRequired: 2000, color: "#6b7280", unlocked: false },
];

export default function Achievements() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Levels</h1>
          <p className="text-muted-foreground">No achievement data available.</p>
        </div>
      </div>
    );
  }

  const userXp = user.xp ?? 0;
  const userLevel = user.level ?? 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="achievements-page">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Levels</h1>
          <p className="text-muted-foreground">
            Complete campaigns and quests on Nexura to level up on Intuition Ecosystem — and celebrate your onchain achievements.
          </p>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levelAchievements.map((achievement) => {
            const progress = Math.min((userXp / achievement.xpRequired) * 100, 100);
            const isUnlocked = userLevel >= achievement.level;

            return (
              <Card
                key={achievement.level}
                className={`glass glass-hover rounded-3xl relative overflow-hidden transition-all ${isUnlocked ? 'border-primary/50 bg-primary/5' : 'border-white/10'
                  }`}
                data-testid={`achievement-level-${achievement.level}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {/* Level Icon */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        backgroundColor: achievement.level === 30 ? achievement.color : (isUnlocked ? achievement.color : '#6b7280')
                      }}
                    >
                      {achievement.level}
                    </div>

                    {/* Progress Indicator */}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(progress)}%
                      </div>
                      {isUnlocked && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 mt-1">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Level Info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Level {achievement.level}</h3>
                    <p className="text-sm text-muted-foreground">
                      Reach Level {achievement.level} by earning XP
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>
                        {Math.min(userXp, achievement.xpRequired)} / {achievement.xpRequired}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                      style={{
                        '--progress-background': isUnlocked ? achievement.color : '#6b7280'
                      } as React.CSSProperties}
                    />
                  </div>
                </CardContent>

                {/* Unlock overlay effect */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                )}
              </Card>
            );
          })}
        </div>

        {/* Achievement Stats */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">{userLevel}</div>
            <div className="text-lg font-semibold">Current Level</div>
            <div className="text-muted-foreground">
              {userXp} XP earned • {levelAchievements.filter(a => userLevel >= a.level).length} achievements unlocked
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}