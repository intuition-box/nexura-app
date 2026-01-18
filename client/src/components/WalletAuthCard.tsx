import * as React from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { KeyRound } from "lucide-react";
import { useWallet } from "../hooks/use-wallet";
import { createUserFromWallet, createProjectAccount } from "../lib/remoteDb";
import { apiRequest } from "../lib/queryClient";

export default function WalletAuthCard({ mode = "user", action = "signin" }: { mode?: "user" | "project"; action?: "signin" | "signup" }) {
  const { connectWallet, address, isConnected } = useWallet();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setLoading(true);
    try {
      // Do not auto-open AppKit modal during wallet connection; the UI will
      // expose an explicit control to open it if needed.

      const connectedAddress = await connectWallet({ noReload: true });
      if (!connectedAddress) throw new Error("Wallet connection failed");

      // Upsert account depending on mode then navigate appropriately
      if (mode === "user") {
        try {
          const meRes = await apiRequest('GET', '/api/me').catch(() => null);
          if (meRes) {
            const json = await meRes.json().catch(() => ({}));
            if (json?.hasProfile) {
              window.location.reload();
            } else {
              window.location.href = "/profile/edit";
            }
            return;
          }
        } catch (e) {
          // fall back
        }
        await createUserFromWallet({ address: connectedAddress, metadata: { createdAt: new Date().toISOString() } } as any);
        // Stay on current page instead of redirecting
        window.location.reload();
      } else {
        try {
          await createProjectAccount({ address: connectedAddress, metadata: { createdAt: new Date().toISOString() } } as any);
        } catch (e) {
          // ignore
        }
        try {
          const res = await apiRequest('GET', '/projects').catch(() => null);
          if (res) {
            const list = await res.json();
            const my = list.find((p: any) => p.ownerAddress && p.ownerAddress.toLowerCase() === (connectedAddress || "").toLowerCase());
            if (my) {
              window.location.href = `/project/${my.id}/dashboard`;
              return;
            }
          }
        } catch (e) {
          // ignore
        }
        window.location.href = "/projects/create";
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "project" ? "Project Wallet" : "User Wallet"}</CardTitle>
        <CardDescription>{mode === "project" ? "Sign in as a project account" : "Sign in with your wallet"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Use your crypto wallet to {action === "signin" ? "sign in" : "sign up"}.</p>
          <Button onClick={handleConnect} size="lg" className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {loading ? "Working..." : isConnected ? "Use connected wallet" : "Connect Wallet"}
          </Button>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
      </CardFooter>
    </Card>
  );
}

export { WalletAuthCard };
