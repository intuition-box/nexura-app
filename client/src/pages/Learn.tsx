"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Clock } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Learn() {
  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Learn</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-slide-up delay-100">
            Learn
          </h1>
          <p className="text-sm text-white/50 leading-relaxed animate-slide-up delay-200">
            Educational content and tutorials about Web3, blockchain, and the Intuition ecosystem.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-8 animate-slide-up delay-300">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-white">
              No Learning Materials Available
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              We're currently preparing comprehensive learning materials about Web3, DeFi, and Intuition.
              Check back soon for tutorials, guides, and educational content.
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Coming soon: Interactive tutorials, video guides, and step-by-step walkthroughs
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
