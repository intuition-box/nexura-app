import { useEffect, useRef, useCallback } from "react";
import { apiRequestV2 } from "@/lib/queryClient";

interface DiscordStatusResponse {
  joined: boolean;
  message: string;
  roles?: string[];
  error?: string;
}

interface UseDiscordPollOptions {
  guildId?: string;
  enabled?: boolean;
  pollInterval?: number;
  onStatusChange?: (joined: boolean) => void;
}

export const useDiscordPoll = ({
  guildId,
  enabled = true,
  pollInterval = 30000,
  onStatusChange,
}: UseDiscordPollOptions = {}) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStatusRef = useRef<boolean | null>(null);

  const checkDiscordStatus = useCallback(async () => {
    try {
      const response = await apiRequestV2("GET", `/api/check-discord-status${guildId ? `?guildId=${guildId}` : ""}`);
      
      const data = response as DiscordStatusResponse;
      
      if (lastStatusRef.current !== data.joined) {
        lastStatusRef.current = data.joined;
        if (onStatusChange) {
          onStatusChange(data.joined);
        }
      }

      return data;
    } catch (error) {
      console.error("Error checking Discord status:", error);
      return null;
    }
  }, [guildId, onStatusChange]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    checkDiscordStatus();

    intervalRef.current = setInterval(checkDiscordStatus, pollInterval);
  }, [checkDiscordStatus, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    checkDiscordStatus,
    startPolling,
    stopPolling,
  };
};
