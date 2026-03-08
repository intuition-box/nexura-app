import { useState } from "react";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowRight, Hash, Volume2, Check } from "lucide-react";
import { Link } from "wouter";
import AnimatedBackground from "../../components/AnimatedBackground";

const MOCK_SERVER = {
  name: "Nexura Official",
  icon: "/discord-logo.png",
  memberCount: 12480,
};

const MOCK_CHANNELS = [
  { id: "1", name: "general", type: "text", category: "GENERAL" },
  { id: "2", name: "announcements", type: "text", category: "GENERAL" },
  { id: "3", name: "introductions", type: "text", category: "GENERAL" },
  { id: "4", name: "campaigns", type: "text", category: "NEXURA" },
  { id: "5", name: "quest-updates", type: "text", category: "NEXURA" },
  { id: "6", name: "rewards-drops", type: "text", category: "NEXURA" },
  { id: "7", name: "support", type: "text", category: "SUPPORT" },
  { id: "8", name: "bot-commands", type: "text", category: "SUPPORT" },
  { id: "9", name: "lounge", type: "voice", category: "VOICE" },
  { id: "10", name: "stage-events", type: "voice", category: "VOICE" },
];

const CATEGORIES = ["GENERAL", "NEXURA", "SUPPORT", "VOICE"];

export default function DiscordChannels() {
  const [selected, setSelected] = useState<string[]>(["4", "5"]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    localStorage.setItem("discordChannels", JSON.stringify(selected));
    window.location.href = "/studio-dashboard";
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto relative">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <div className="w-full max-w-xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/discord-logo.png" alt="Discord" className="w-12 h-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Select Channels</h1>
            <p className="text-white/60 text-sm sm:text-base max-w-sm mx-auto">
              Choose which channels the Nexura Guide Bot should be installed on. The bot will post campaign updates and quest notifications there.
            </p>
          </div>

          {/* Server info */}
          <Card className="bg-gray-900 border border-purple-500 rounded-2xl p-4 flex items-center gap-4">
            <div className="border-2 border-purple-500 rounded-xl p-1.5">
              <img src={MOCK_SERVER.icon} alt="Server" className="w-10 h-10 rounded-lg" />
            </div>
            <div>
              <p className="text-white font-semibold">{MOCK_SERVER.name}</p>
              <p className="text-white/50 text-xs">{MOCK_SERVER.memberCount.toLocaleString()} members</p>
            </div>
            <span className="ml-auto text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1">
              Connected
            </span>
          </Card>

          {/* Channel list */}
          <Card className="bg-gray-900 border border-purple-500 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Available Channels</CardTitle>
              <CardDescription className="text-xs text-white/40">
                {selected.length} selected
              </CardDescription>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {CATEGORIES.map((cat) => {
                const channels = MOCK_CHANNELS.filter((c) => c.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-white/30 text-xs font-bold tracking-widest mb-1 px-1">{cat}</p>
                    <div className="space-y-1">
                      {channels.map((ch) => {
                        const isSelected = selected.includes(ch.id);
                        return (
                          <button
                            key={ch.id}
                            onClick={() => toggle(ch.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 ${
                              isSelected
                                ? "bg-purple-500/20 border border-purple-500/50"
                                : "bg-white/5 border border-transparent hover:bg-white/10"
                            }`}
                          >
                            {ch.type === "text" ? (
                              <Hash className="w-4 h-4 text-white/40 flex-shrink-0" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                            )}
                            <span className={`text-sm flex-1 text-left ${isSelected ? "text-white" : "text-white/70"}`}>
                              {ch.name}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Hint */}
          <p className="text-center text-white/30 text-xs">
            You can change channel permissions anytime from your Studio dashboard.
          </p>

          {/* CTA */}
          <Button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="w-full bg-purple-400 hover:bg-purple-600 hover:shadow-[0_0_28px_rgba(131,58,253,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Install Bot & Continue
            <ArrowRight className="h-5 w-5" />
          </Button>

        </div>
      </div>
    </div>
  );
}
