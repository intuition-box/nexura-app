import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { discordHubAuthUrl } from "../../lib/constants";

export default function ConnectDiscord() {
  React.useEffect(() => {
    const hasFullSession =
      !!localStorage.getItem("nexura-project:token") ||
      !!localStorage.getItem("nexura:proj-token");
    if (!hasFullSession) {
      localStorage.setItem("nexura:studio-step", "/connect-discord");
    }
  }, []);

  const handleFakeConnect = () => {
    const fakeDiscord = {
      handle: "@realproject_handle",
      avatar: "/original-discord.png",
      verified: true,
    };

    localStorage.setItem("discordData", JSON.stringify(fakeDiscord));
    window.location.href = discordHubAuthUrl;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <Card className="bg-gray-900 border border-purple-500 rounded-2xl p-8 w-full max-w-md text-center space-y-6">

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link href="/projects/create/the-hub">
            <Button className="flex items-center gap-2 bg-gray-800 border border-purple-500 hover:bg-gray-700 text-white px-3 py-1 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Discord Icon */}
        <div className="flex justify-center">
          <img src="/original-discord.png" alt="Discord icon" className="w-12 h-12" />
        </div>

        <CardTitle className="text-2xl font-semibold">Connect Discord</CardTitle>
        <CardDescription className="text-white/60 text-sm leading-relaxed pb-3">
          Authorize your Official Discord account to verify your organization’s identity
        </CardDescription>

        <Button
          onClick={handleFakeConnect}
          className="w-full text-white bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
        >
          <img src="/original-discord.png" alt="Discord logo" className="w-4 h-4" />
          Connect
        </Button>

      </Card>
    </div>
  );
}
