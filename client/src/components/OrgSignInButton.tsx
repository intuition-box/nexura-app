import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function OrgSignInButton() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Direct API call to get user/profile info
      const meRes = await apiRequest("GET", "/api/me");
      const json = await meRes.json().catch(() => ({}));

      if (json?.hasProject && json?.projectId) {
        setLocation(`/project/${json.projectId}/dashboard`);
      } else if (json?.hasProfile) {
        setLocation("/studio");
      } else {
        setLocation("/studio/register");
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed left-4 bottom-4 z-50 flex flex-col items-start gap-2">
      <p className="text-xs text-white/60">Are you an Organization?</p>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <Button size="sm" onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </Button>
    </div>
  );
}
