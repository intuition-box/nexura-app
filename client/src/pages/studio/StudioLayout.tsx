import React from "react";
// @ts-ignore - asset module types for PNG may not be declared
import siteLogo from "@assets/logo.png";
import { Link } from "wouter";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <header className="flex items-center justify-between p-4 border-b border-white/10 glass">
        <div className="flex items-center space-x-3">
          <img src={siteLogo} alt="Studio Nexura" className="w-10 h-10" />
          <div>
            <div className="text-lg font-bold text-white">NEXURA STUDIO</div>
            <div className="text-xs text-white/60">Project registration & management</div>
          </div>
        </div>
        <nav>
          <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">Back to Nexura</Link>
        </nav>
      </header>

      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
