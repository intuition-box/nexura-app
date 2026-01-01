import React, { useState } from "react";
import { RotateCcw } from "lucide-react";

interface CheckButtonProps {
  onCheck: () => Promise<boolean>;
  isChecking?: boolean;
  isCompleted?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
  tooltipText?: string;
}

export function CheckButton({
  onCheck,
  isChecking = false,
  isCompleted = false,
  label = "Verify",
  size = "md",
  variant = "default",
  tooltipText = "Click to verify your action",
}: CheckButtonProps) {
  const [loading, setLoading] = useState(isChecking);
  const [completed, setCompleted] = useState(isCompleted);

  const handleCheck = async () => {
    if (loading || completed) return;

    setLoading(true);
    try {
      const success = await onCheck();
      if (success) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Check button error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const baseClasses = `
    flex items-center justify-center rounded-full transition-all duration-300
    ${sizeClasses[size]}
  `;

  const variantClasses = {
    default: `
      ${completed
        ? "bg-green-500/20 border border-green-500/40 cursor-default"
        : "bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 cursor-pointer"
      }
    `,
    ghost: `
      ${completed
        ? "text-green-400 cursor-default"
        : "text-purple-400 hover:text-purple-300 cursor-pointer hover:bg-white/10"
      }
    `,
  };

  return (
    <div className="relative group" title={tooltipText}>
      <button
        onClick={handleCheck}
        disabled={loading || completed}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          disabled:opacity-75 disabled:cursor-not-allowed
        `}
      >
        <RotateCcw
          className={`
            ${iconSizeClasses[size]}
            ${loading ? "animate-spin" : ""}
            ${completed ? "text-green-400" : "text-purple-400"}
            transition-colors duration-300
          `}
        />
      </button>

      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 border border-white/10 rounded text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {completed ? "Verified!" : loading ? "Checking..." : tooltipText}
      </div>

      {completed && (
        <div className="absolute inset-0 rounded-full animate-pulse bg-green-500/20" />
      )}
    </div>
  );
}
