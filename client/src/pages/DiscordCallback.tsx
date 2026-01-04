"use client";

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequestV2 } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

export default function DiscordCallback() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const discord_id = params.get("discord_id");
    const username = params.get("username");

    if (!discord_id || !username) {
      alert("No id or username returned from server.");
      setLocation("/profile/edit"); // redirect to edit profile if values is missing
      return;
    }

    // update user
    (async () => {
      try {
        const { user } = await apiRequestV2("GET", `/api/discord/update?discord_id=${discord_id}&username=${username}`);

        setUser(user);

        toast({ title: "Success", description: "Discord login successful!" });
        setLocation("/profile/edit")
      } catch (error: any) {
        console.error(error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setLocation("/profile/edit");
      }
    })();

    // fetch(`/api/discord/join`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ code }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (data.success) {
    //       alert("Successfully joined Discord!");
    //     } else {
    //       alert("Failed to join Discord server.");
    //     }
    //     setLocation("/campaigns"); // always go back to campaigns page
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     alert("Something went wrong.");
    //     setLocation("/campaigns");
    //   });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <p className="text-lg">Processing Discord connection... </p>
      <br />
      <p className="text-lg">Do not refresh</p>
    </div>
  );
}
