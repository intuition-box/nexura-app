import { useCallback } from "react";
import { apiRequestV2 } from "@/lib/queryClient";
import { useToast } from "./use-toast";

interface VerifyDiscordMembershipResponse {
  joined: boolean;
  message: string;
  roles?: string[];
  error?: string;
}

export const useVerifyDiscordMembership = () => {
  const { toast } = useToast();

  const verifyDiscordJoin = useCallback(
    async (guildId?: string): Promise<boolean> => {
      try {
        const response = await apiRequestV2(
          "GET",
          `/api/check-discord-status${guildId ? `?guildId=${guildId}` : ""}`
        );

        const data = response as VerifyDiscordMembershipResponse;

        if (data.joined) {
          toast({
            title: "Success!",
            description: "You have successfully joined the Discord server!",
            variant: "default",
          });
          return true;
        } else {
          toast({
            title: "Not Yet Joined",
            description: data.message || "Please join the Discord server first.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error: any) {
        const errorMessage =
          error?.message ||
          "Failed to verify Discord membership. Please try again.";

        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });

        console.error("Discord verification error:", error);
        return false;
      }
    },
    [toast]
  );

  return { verifyDiscordJoin };
};
