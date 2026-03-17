import React from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { beginStudioDiscordConnect, getStudioDiscordReturnPath } from "../../lib/studioDiscord";

export default function ConnectDiscord() {
  const [, setLocation] = useLocation();
  const returnPath = getStudioDiscordReturnPath("/studio-dashboard");
  const showSkipButton = returnPath === "/studio-dashboard";

  React.useEffect(() => {
    const hasFullSession =
      !!localStorage.getItem("nexura-project:token") ||
      !!localStorage.getItem("nexura:proj-token");

    if (!hasFullSession) {
      localStorage.setItem("nexura:studio-step", "/studio-dashboard/connect-discord");
    }
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white shadow-[0_24px_80px_rgba(15,15,35,0.45)] backdrop-blur-xl">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B3EFE]/40 bg-[#8B3EFE]/15">
              <img src="/original-discord.png" alt="Discord icon" className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold">Connect Discord</CardTitle>
              <CardDescription className="max-w-xl text-sm leading-6 text-white/65">
                Authorize your project Discord account, pick the server you manage, and finish setup without dropping back into the signup flow.
              </CardDescription>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 md:block">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Studio Verification
            </div>
            <p className="mt-1 max-w-xs text-xs leading-5 text-emerald-100/75">
              We’ll bring you back here to finish the server and verification-role selection.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-white/70">
          <p>Discord will ask you to approve access to the servers you manage.</p>
          <p>You can skip this for now and reconnect later when you want to build Discord-related tasks.</p>
          <p>After approval, you’ll come right back to the studio to choose the server and verification role.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setLocation(returnPath)}
            className="border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Studio
          </Button>
          {showSkipButton && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocation("/studio-dashboard")}
              className="border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/10 hover:text-white"
            >
              Skip for Now
            </Button>
          )}
          <Button
            type="button"
            onClick={() => beginStudioDiscordConnect(returnPath)}
            className="bg-[#8B3EFE] text-white hover:bg-[#7b35e6]"
          >
            Connect Discord
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
