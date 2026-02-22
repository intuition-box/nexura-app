import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, MessageCircle } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Community() {
  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="community-page">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Community</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4">Community</h1>
          <p className="text-sm text-white/50">
            Connect with other questers, share experiences, and build the future of trust together.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="glass glass-hover rounded-3xl p-8" data-testid="coming-soon-card">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-white/60" />
            </div>
            <CardTitle className="text-xl font-bold text-white">No Community Features Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/60 mb-4">
              We're building an amazing community space where questers can connect, collaborate, and share their achievements.
              Stay tuned for discussions, leaderboards, and community events.
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon: Forums, leaderboards, community challenges, and social features
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}