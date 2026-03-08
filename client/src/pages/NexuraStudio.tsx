import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AnimatedBackground from "../components/AnimatedBackground";
import { Layers, Megaphone, BarChart3, Users, Zap, Shield, ArrowRight } from "lucide-react";
import { isProjectSignedIn } from "../lib/projectApi";

const FEATURES = [
  { icon: Megaphone, title: "Campaign Builder", desc: "Launch targeted campaigns with custom tasks and reward tiers" },
  { icon: BarChart3, title: "Live Analytics", desc: "Track completions, wallet interactions, and growth in real-time" },
  { icon: Users, title: "Community Tools", desc: "Manage your audience, roles, and leaderboard from one place" },
  { icon: Zap, title: "On-Chain Actions", desc: "Reward participants automatically via smart contracts" },
  { icon: Shield, title: "Admin Controls", desc: "Set campaign rules, verify tasks, and manage admins" },
  { icon: Layers, title: "Multi-Campaign", desc: "Run several campaigns simultaneously with isolated analytics" },
];

export default function NexuraStudio() {
  const [, setLocation] = useLocation();
  // Prevent flash: if already signed in, skip rendering and redirect immediately
  const [redirecting] = useState(() => isProjectSignedIn());

  useEffect(() => {
    if (isProjectSignedIn()) {
      setLocation("/studio-dashboard");
    }
  }, []);

  if (redirecting) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-auto relative">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Hero */}
        <div className="flex flex-col items-center justify-center text-center px-6 pt-10 pb-8">

          {/* Badge */}
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-xs font-semibold uppercase tracking-widest">ORGANIZATION PLATFORM</span>
          </div>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 border border-purple-500/40 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(131,58,253,0.4)]">
            <Layers className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Nexura Studio
            </span>
          </h1>

          <p className="text-white/50 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            The all-in-one platform for builders to launch campaigns, distribute rewards,
            and grow their community on the Intuition network.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 mb-3">
            <button
              onClick={() => setLocation("/projects/create")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-purple-400 border border-purple-400 text-white font-semibold text-base transition-all duration-200 hover:bg-purple-600 hover:border-purple-600 hover:shadow-[0_0_28px_rgba(131,58,253,0.7)] hover:scale-[1.03] active:scale-[0.98]"
            >
              Enter Studio
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/30 text-xs">Reserved for project owners &amp; builders</p>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-auto sm:max-w-4xl border-t border-white/5" />

        {/* Footer band */}
        <div className="mt-auto bg-white/[0.02] px-6 py-6 text-center">
          <p className="text-white/30 text-sm">Already have a hub? <button onClick={() => setLocation("/projects/create/signin-to-hub")} className="text-purple-400 hover:underline">Sign in</button> — no wallet reconnect needed.</p>
        </div>

      </div>
    </div>
  );
}

