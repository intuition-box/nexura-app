"use client";

import { useEffect } from "react";
import { useLocation } from "wouter";
import AnimatedBackground from "../components/AnimatedBackground";
import { Layers, Megaphone, BarChart3, Users, Zap, Shield } from "lucide-react";
import SignUpPopup from "../components/BuilderPopup";
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

  useEffect(() => {
    if (isProjectSignedIn()) {
      setLocation("/studio-dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-auto relative">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Hero */}
        <div className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">

          {/* Badge */}
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-xs font-semibold uppercase tracking-widest">ORGANIZATION PLATFORM</span>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 border border-purple-500/40 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(131,58,253,0.4)]">
            <Layers className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Nexura Studio
            </span>
          </h1>

          <p className="text-white/50 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            The all-in-one platform for builders to launch campaigns, distribute rewards,
            and grow their community on the Intuition network.
          </p>

          {/* CTA */}
          <div className="mb-3">
            <SignUpPopup mode="project" action="signin" triggerLabel="Connect Wallet to Enter" />
          </div>
          <p className="text-white/30 text-xs">Reserved for project owners &amp; builders</p>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-auto sm:max-w-4xl border-t border-white/5" />

        {/* Feature Grid */}
        <div className="px-6 py-12 sm:py-16 max-w-4xl mx-auto w-full">
          <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-widest mb-8">Everything you need</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/25 transition-all">
                  <Icon className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer band */}
        <div className="mt-auto border-t border-white/5 bg-white/[0.02] px-6 py-6 text-center">
          <p className="text-white/30 text-sm">Already have a project account? Connect your wallet above to sign in automatically.</p>
        </div>

      </div>
    </div>
  );
}

