import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { createUserFromWallet, createProjectAccount } from "@/lib/remoteDb";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function SignUpPopup({ mode = "user" as "user" | "project", action = "signup" as "signup" | "signin", triggerLabel, }: { mode?: "user" | "project"; action?: "signup" | "signin"; triggerLabel?: string; }) {
  const { connectWallet, address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleConnectAndCreate() {
    setError(null);
    setLoading(true);
    try {
      // Do not auto-open AppKit/Wagmi modal during signup/connect flows.
      // The app exposes explicit UI for opening AppKit when desired.

      // then attempt the connect flow (use-wallet will handle injected fallback)
      const connectedAddress = await connectWallet({ noReload: true });
      if (!connectedAddress) throw new Error("Wallet connection failed");

      // Create a user or project account entry using the remote DB helpers.
      if (mode === "user") {
        // prefer server-driven session and profile check
        try {
          // ping /api/me to let server create a minimal user via /auth/wallet if needed
          const meRes = await apiRequest('GET', '/api/user/profile').catch(() => null);
          if (meRes) {
            const json = await meRes.json().catch(() => ({}));
            setOpen(false);
            if (json?.user) {
              window.location.reload();
            } else {
              alert("Account created — please complete your profile");
              window.location.href = "/profile/edit";
            }
            return;
          }
        } catch (e) {
          // fall back to remote upsert
        }
        await createUserFromWallet({
          address: connectedAddress,
          metadata: { createdAt: new Date().toISOString() },
        } as any);
        setOpen(false);
        // Stay on current page instead of redirecting
        window.location.reload();
      } else {
        // project mode: upsert project account then navigate to project creation or dashboard
        try {
          await createProjectAccount({
            address: connectedAddress,
            metadata: { createdAt: new Date().toISOString() },
          } as any);
        } catch (e) {
          // ignore
        }
        // check if the user already has projects
        try {
          const res = await apiRequest('GET', '/projects').catch(() => null);
          if (res) {
            const list = await res.json();
            const my = list.find((p: any) => p.ownerAddress && p.ownerAddress.toLowerCase() === (connectedAddress || "").toLowerCase());
            setOpen(false);
            if (my) {
              window.location.href = `/project/${my.id}/dashboard`;
            } else {
              window.location.href = `/projects/create`;
            }
            return;
          }
        } catch (e) {
          // fall back
        }
        setOpen(false);
        window.location.href = "/projects/create";
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const label = triggerLabel ?? (action === "signin" ? (mode === "project" ? "Project Sign In" : "Sign In") : (mode === "project" ? "Project Sign Up" : "Sign Up"));

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === "signin" ? (mode === "user" ? "Sign in with wallet" : "Project sign in") : (mode === "user" ? "Sign up with wallet" : "Project Sign up")}</DialogTitle>
          <DialogDescription>
            Connect your wallet to create an account. You can also adjust details after signing up.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <Card>
            <CardHeader>
              <CardTitle>{mode === "project" ? "Project Wallet" : "User Wallet"}</CardTitle>
              <CardDescription>{mode === "project" ? "Sign in as a project account" : "Sign in as a user"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <p className="text-sm text-muted-foreground">Use your crypto wallet to {action === "signin" ? "sign in" : "sign up"}.</p>
                <Button onClick={handleConnectAndCreate} size="lg" className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  {loading ? "Working..." : isConnected ? "Use connected wallet" : "Connect Wallet"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>Exit</Button>
            </CardFooter>
          </Card>
        </div>
        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      </DialogContent>
    </Dialog>
  );
}
