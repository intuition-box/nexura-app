import React from "react";
import AuthGuard from "../components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 12;

async function fetchMintedStatuses(userId: string, maxLevel: number) {
  const out: Record<number, any> = {};
  const promises = [] as Promise<void>[];
  for (let level = 1; level <= maxLevel; level++) {
    promises.push((async () => {
      try {
        const res = await apiRequest('GET', `/api/tiers/mint/${encodeURIComponent(userId)}/${level}`);
        const json = await res.json();
        out[level] = { minted: true, record: json };
      } catch (e) {
        out[level] = { minted: false };
      }
    })());
  }
  await Promise.all(promises);
  return out;
}

export default function Levels() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const userId = user?.id || null;

  const { data: mintedMap, refetch: refetchMinted } = useQuery({
    queryKey: userId ? ["/api/tiers/minted", userId] : ["/api/tiers/minted", "none"],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return {};
      return await fetchMintedStatuses(userId, MAX_LEVEL);
    },
    staleTime: 1000 * 30,
  });

  async function handleMint(level: number) {
    if (!userId) return;
    try {
      const res = await apiRequest("POST", "/api/tiers/mint", { userId, level });
      const json = await res.json();
      toast({ title: "Mint queued", description: `Mint job queued for level ${level}` });
      // refetch minted statuses
      try { await refetchMinted(); } catch { /* ignore */ }
    } catch (e: any) {
      toast({ title: "Mint failed", description: String(e?.message || e) });
    }
  }

  if (loading) return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white p-6">Loading...</div>
    </AuthGuard>
  );

  if (!userId) return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white p-6">Please sign in to view levels</div>
    </AuthGuard>
  );

  const userLevel = Number(user?.level || 0);
  const userXp = Number(user?.xp || 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">Levels</h1>
            <div className="text-right">
              <div className="text-lg font-bold">You: L{userLevel} ({userXp} XP)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: MAX_LEVEL }).map((_, i) => {
              const lvl = i + 1;
              const requiredXp = lvl * XP_PER_LEVEL;
              const canMint = userLevel >= lvl;
              const minted = mintedMap?.[lvl]?.minted;
              return (
                <Card key={lvl} className="p-4 glass rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Level {lvl}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-white/60 mb-3">Requires {requiredXp} XP</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Status: {minted ? 'Minted' : (canMint ? 'Eligible' : 'Locked')}</div>
                      </div>
                      <div>
                        <Button disabled={!canMint || minted} onClick={() => handleMint(lvl)}>
                          {minted ? 'Minted' : canMint ? 'Mint' : 'Locked'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
