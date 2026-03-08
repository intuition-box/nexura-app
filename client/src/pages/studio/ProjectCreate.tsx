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
      description: "Upload your project logo and provide a compelling description for your hub",
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
      description: "A small TRUST fee is charged per campaign you launch — keeping the platform Sybil-resistant and ensuring only  real projects run campaigns.",
      icon: "/activate.png",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative">
      <AnimatedBackground />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <div className="text-center py-8 sm:py-4 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
            Nexura Studio
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-md sm:max-w-2xl mx-auto leading-relaxed">
            Create a dedicated hub for your Project on Nexura.
          </p>
        </div>

        {/* Big Outer Card Container */}
        <div className="mx-auto max-w-2xl">
          <Card className="border-2 border-purple-500 rounded-3xl p-6 space-y-6">

            {/* Steps */}
            {steps.map((step, idx) => (
              <Card
                key={step.title}
                className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-4 sm:p-6 flex items-start gap-4 animate-slide-up"
                style={{ animationDelay: `${200 + idx * 100}ms` }}
              >
                {step.borderedIcon ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mt-1 flex-shrink-0 rounded-xl border-2 border-purple-500 bg-gray-800 flex items-center justify-center p-1.5">
                    <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <img src={step.icon} alt={step.title} className="w-10 h-10 sm:w-12 sm:h-12 mt-1 flex-shrink-0" />
                )}
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-white/60 text-sm sm:text-base">
                    {step.description}
                  </CardDescription>
                </div>
              </Card>
            ))}

            {/* Divider */}
            <hr className="border-t border-purple-500 my-4" />

            {/* Buttons */}
            <div className="flex flex-col gap-4 mt-4">
              <Link href="/projects/create/create-hub">
                <Button className="w-full bg-purple-400 hover:bg-purple-600 hover:shadow-[0_0_28px_rgba(131,58,253,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  Create Your Hub
                </Button>
              </Link>
              <Link href="/projects/create/signin-to-hub">
                <Button className="w-full bg-transparent border border-purple-400 hover:bg-purple-600 hover:border-purple-600 hover:shadow-[0_0_24px_rgba(131,58,253,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white">
                  Sign in to Existing Hub
                </Button>
              </Link>

            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}
