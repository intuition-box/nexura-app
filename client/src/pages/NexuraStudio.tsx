"use client";

import AnimatedBackground from "../components/AnimatedBackground";
import { Layers } from "lucide-react";
import SignUpPopup from "../components/BuilderPopup";

  export default function NexuraStudio() {
  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <div className="text-center py-8 sm:py-12 px-2 sm:px-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-slide-up delay-100">
            <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4 animate-slide-up delay-200">
            Nexura Studio
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-md sm:max-w-2xl mx-auto leading-relaxed animate-slide-up delay-300">
            Creator tools, internal workflows, and experimental features.
          </p>
        </div>

        {/* Studio Access */}
        <div className="flex flex-col items-center gap-4 animate-slide-up delay-400">
          <p className="text-sm sm:text-base text-white/60 text-center max-w-md">
            Access Nexura Studio by connecting your wallet. This workspace is reserved for builders and project owners.
          </p>

          <div className="flex gap-3">
            <SignUpPopup mode="project" action="signin" triggerLabel="Sign In" />
          </div>
        </div>

      </div>
    </div>
  );
}
