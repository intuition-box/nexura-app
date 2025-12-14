import React, { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AnimatedBackground from "@/components/AnimatedBackground";

// Prefer a runtime-injected backend URL (window.__BACKEND_URL__), then Vite env var.
// Do not default to localhost here — if no backend is configured the app will
// make relative requests to the current origin.
const RUNTIME_BACKEND = (typeof window !== 'undefined' && (window as any).__BACKEND_URL__) || undefined;
const BACKEND_BASE = RUNTIME_BACKEND || ((import.meta as any).env?.VITE_BACKEND_URL as string) || "";

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = (BACKEND_BASE || "").replace(/\/+$/g, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
}

type Entry = {
  id: string;
  username: string;
  avatar?: string;
  display_name?: string;
  address?: string;
  xp: number;
  level: number;
  quests_completed?: number;
  tasks_completed?: number;
};

export default function Leaderboard() {
  const [list, setList] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(buildUrl("/api/leaderboard"))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Entry[]) => {
        if (!mounted) return;
        // Data is already sorted by XP from backend
        setList(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load leaderboard");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Leaderboard</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/60">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
  
  if (error) return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Leaderboard</h1>
          <div className="p-6 text-center text-white/60">Error loading leaderboard: {error}</div>
        </div>
      </div>
    </AuthGuard>
  );
  
  if (!list || list.length === 0) return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Leaderboard</h1>
          <div className="p-6 text-center text-white/60">No leaderboard data yet. Complete quests to get on the board!</div>
        </div>
      </div>
    </AuthGuard>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white overflow-auto p-6 relative">
        <AnimatedBackground />
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Leaderboard</h1>
            <Badge variant="outline" className="text-sm border-white/20 text-white">{list.length} Players</Badge>
          </div>
          
          <div className="space-y-3">
            {list.map((entry, idx) => {
              const displayName = entry.display_name || entry.username || 'Anonymous';
              const isTopThree = idx < 3;
              const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
              
              return (
                <Card key={entry.id} className={`p-4 glass glass-hover rounded-3xl transition-all ${
                  isTopThree ? 'border-2' : ''
                }`} style={isTopThree ? { borderColor: rankColors[idx] } : {}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          isTopThree ? 'text-white' : 'bg-white/5 text-white/60'
                        }`}
                        style={isTopThree ? { backgroundColor: rankColors[idx] } : {}}
                      >
                        #{idx + 1}
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        {entry.avatar ? (
                          <AvatarImage src={entry.avatar} alt={displayName} />
                        ) : (
                          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {entry.level || 1}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-white">{displayName}</h3>
                          <Badge 
                            className="text-xs bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-500 text-white border-0"
                          >
                            Lvl {entry.level || 1}
                          </Badge>
                        </div>
                        <div className="text-sm text-white/50">
                          {entry.quests_completed || 0} quests · {entry.tasks_completed || 0} tasks
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{entry.xp || 0}</div>
                      <div className="text-xs text-white/50">XP</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
