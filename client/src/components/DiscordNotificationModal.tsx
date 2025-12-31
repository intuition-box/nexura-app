"use client";

import React from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle2 } from "lucide-react";

interface DiscordNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}

export function DiscordNotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
}: DiscordNotificationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-12 h-12 text-green-400" />;
      case "error":
        return (
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xl">
            !
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            ⓘ
          </div>
        );
    }
  };

  const getBgGradient = () => {
    switch (type) {
      case "success":
        return "from-green-500/10 to-green-600/10 border-green-500/20";
      case "error":
        return "from-red-500/10 to-red-600/10 border-red-500/20";
      default:
        return "from-blue-500/10 to-blue-600/10 border-blue-500/20";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
      <DialogContent className="bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 border border-white/10 shadow-2xl max-w-md">
        <GlassCard className={`bg-gradient-to-br ${getBgGradient()} border p-6`}>
          <div className="flex flex-col items-center gap-4 text-center">
            {getIcon()}
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
              <p className="text-sm text-gray-300">{message}</p>
            </div>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
}
