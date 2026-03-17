import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardDescription, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { getStoredProjectInfo, projectApiRequest } from "../../lib/projectApi";
import {
  beginStudioDiscordConnect,
  clearStudioDiscordReturnPath,
  getStudioDiscordReturnPath,
} from "../../lib/studioDiscord";

type DiscordServer = {
  id: string;
  name: string;
};

type DiscordRole = {
  id: string;
  name: string;
};

export default function ConnectedDiscord() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const returnPath = getStudioDiscordReturnPath("/studio-dashboard/hub-profile");

  const [discordData, setDiscordData] = useState<DiscordServer[]>([]);
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [selectedServer, setSelectedServer] = useState<DiscordServer>({ id: "", name: "" });
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverOpen, setServerOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      toast({
        title: "Missing Discord session",
        description: "Please reconnect Discord to continue.",
        variant: "destructive",
      });
      setLocation("/studio-dashboard/connect-discord");
      return;
    }

    const fetchDiscordData = async () => {
      try {
        setLoading(true);
        const { servers } = await projectApiRequest<{ servers: DiscordServer[] }>({
          method: "GET",
          endpoint: `/hub/get-servers?id=${id}`,
        });
        setDiscordData(servers ?? []);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to fetch server data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    void fetchDiscordData();
  }, [id, setLocation, toast]);

  async function fetchRoles(serverId: string) {
    if (!id || !serverId) return;

    try {
      setLoadingRoles(true);
      const { roles } = await projectApiRequest<{ roles: DiscordRole[] }>({
        method: "GET",
        endpoint: `/hub/get-roles?serverId=${serverId}&id=${id}`,
      });
      setRoles(roles ?? []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" });
    } finally {
      setLoadingRoles(false);
    }
  }

  async function completeDiscordSetup() {
    if (!selectedServer.id) {
      toast({ title: "Select a server", description: "Please choose your Discord server first.", variant: "destructive" });
      return;
    }

    if (!selectedRole) {
      toast({ title: "Select a role", description: "Please choose a role for verification.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);

      await projectApiRequest({
        method: "PATCH",
        endpoint: "/hub/update-ids",
        data: {
          verifiedId: selectedRole,
          guildId: selectedServer.id,
          discordServer: selectedServer.name,
          discordSessionId: id,
        },
      });

      if (id) {
        const existingInfo = getStoredProjectInfo() ?? {};
        localStorage.setItem(
          "nexura-project:info",
          JSON.stringify({ ...existingInfo, discordSessionId: id })
        );
      }

      clearStudioDiscordReturnPath();
      toast({ title: "Discord connected", description: "Your studio Discord connection is ready." });
      setLocation(returnPath);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to connect Discord";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const handleBack = () => {
    clearStudioDiscordReturnPath();
    setLocation(returnPath);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/70">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B3EFE]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white shadow-[0_24px_80px_rgba(15,15,35,0.45)] backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold">Finish Discord Setup</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-white/65">
                Your Discord account is authorized. Choose the server you manage and the verification role Nexura should use for studio campaigns.
              </CardDescription>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
            The selected server and role will be saved directly to this studio hub.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/70">Discord Server</label>
            <div
              onClick={() => setServerOpen((open) => !open)}
              className="cursor-pointer rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-[#8B3EFE]/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">Select server</p>
                  <p className="mt-1 text-sm text-white/55">
                    {selectedServer.name || "Choose an active Discord server"}
                  </p>
                </div>
                <ArrowRight className={`h-5 w-5 transition-transform ${serverOpen ? "rotate-90" : ""}`} />
              </div>
            </div>

            {serverOpen && (
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/25 p-2">
                {discordData.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
                    No Discord servers were returned for this account.
                  </div>
                )}
                {discordData.map((server) => (
                  <button
                    key={server.id}
                    type="button"
                    onClick={() => {
                      setSelectedServer(server);
                      setSelectedRole("");
                      setRoles([]);
                      setServerOpen(false);
                      void fetchRoles(server.id);
                    }}
                    className="w-full rounded-xl border border-transparent bg-white/[0.03] px-4 py-3 text-left text-white transition hover:border-[#8B3EFE]/40 hover:bg-white/[0.06]"
                  >
                    {server.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-white/70">Verification Role</label>
            <div
              onClick={() => setRolesOpen((open) => !open)}
              className="cursor-pointer rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-[#8B3EFE]/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">Select role</p>
                  <p className="mt-1 text-sm text-white/55">
                    {selectedRole
                      ? roles.find((role) => role.id === selectedRole)?.name ?? "Role selected"
                      : "Choose the role used for verification"}
                  </p>
                </div>
                <ArrowRight className={`h-5 w-5 transition-transform ${rolesOpen ? "rotate-90" : ""}`} />
              </div>
            </div>

            {rolesOpen && (
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/25 p-2">
                {loadingRoles && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
                    Loading roles...
                  </div>
                )}
                {!loadingRoles && roles.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
                    {selectedServer.id ? "No roles found for this server." : "Select a server first to load roles."}
                  </div>
                )}
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-white/[0.03] px-4 py-3 transition hover:border-[#8B3EFE]/40 hover:bg-white/[0.06]"
                  >
                    <span className="text-white">{role.name}</span>
                    <input
                      type="radio"
                      name="selectedRole"
                      className="h-4 w-4 accent-[#8B3EFE]"
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={() => setSelectedRole(role.id)}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Studio
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => beginStudioDiscordConnect(returnPath)}
              className="border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/10 hover:text-white"
            >
              Reconnect Discord
            </Button>
            <Button
              type="button"
              onClick={completeDiscordSetup}
              disabled={saving}
              className="bg-[#8B3EFE] text-white hover:bg-[#7b35e6]"
            >
              {saving ? "Saving..." : "Save Discord Setup"}
              {!saving && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
