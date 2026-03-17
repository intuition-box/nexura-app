"use client";

import React from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "wouter";

export default function ProjectCreate() {
  const steps: { title: string; description: string; icon: string; borderedIcon?: boolean }[] = [
    {
      title: "Add Details",
      description: "Upload your project logo and provide a compelling description for your project",
      icon: "/add-details.png",
    },
    {
      title: "Connect Discord",
      description: "Link your official Discord server to verify your community's identity on Nexura",
      icon: "/discord-logo.png",
      borderedIcon: true,
    },
    {
      title: "Activate Organization Space",
      description: "A small TRUST fee is charged per campaign you launch — keeping the platform Sybil-resistant and ensuring only real projects run campaigns.",
      icon: "/activate.png",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-1 sm:p-2 relative">
      <AnimatedBackground />

      <div className="max-w-2xl mx-auto relative z-10 space-y-8">

        {/* Header */}
        <div className="text-center py-4 px-1 sm:py-2 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
            Nexura Studio
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-md sm:max-w-xl mx-auto leading-snug">
            Create a dedicated project for your team on Nexura.
          </p>
        </div>

        {/* Big Outer Card Container */}
        <div className="mx-auto max-w-xl">
          <Card className="border-2 border-purple-500 rounded-2xl p-4 space-y-4">

            {/* Steps */}
            {steps.map((step, idx) => (
              <Card
                key={step.title}
                className="bg-gray-900 border-2 border-purple-500 rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-slide-up"
                style={{ animationDelay: `${200 + idx * 100}ms` }}
              >
                {step.borderedIcon ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mt-1 flex-shrink-0 rounded-lg border-2 border-purple-500 bg-gray-800 flex items-center justify-center p-1">
                    <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <img src={step.icon} alt={step.title} className="w-8 h-8 sm:w-10 sm:h-10 mt-1 flex-shrink-0" />
                )}
                <div>
                  <CardTitle className="text-white text-base sm:text-lg">{step.title}</CardTitle>
                  <CardDescription className="text-white/60 text-xs sm:text-sm leading-snug">
                    {step.description}
                  </CardDescription>
                </div>
              </Card>
            ))}

            {/* Divider */}
            <hr className="border-t border-purple-500 my-2" />

            {/* Buttons */}
<div className="flex flex-col gap-1 mt-1">
  <Link href="/projects/create/create-hub">
    <Button className="w-full bg-purple-400 hover:bg-purple-600 hover:shadow-[0_0_14px_rgba(131,58,253,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs py-0.5">
      Create Your Project
    </Button>
  </Link>
  <Link href="/projects/create/signin-to-hub">
    <Button className="w-full bg-transparent border border-purple-400 hover:bg-purple-600 hover:border-purple-600 hover:shadow-[0_0_14px_rgba(131,58,253,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white text-xs py-0.5">
      Sign in to Existing Project
    </Button>
  </Link>
</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
