import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Signal() {
  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-6 relative" data-testid="signal-page">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Signal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4">Signal</h1>
          <p className="text-sm text-white/50">
            Analytics, insights, and data-driven intelligence for the Intuition ecosystem.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="glass glass-hover rounded-3xl p-8" data-testid="coming-soon-card">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-white/60" />
            </div>
            <CardTitle className="text-xl font-bold text-white">No Analytics Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/60 mb-4">
              We're developing comprehensive analytics and insights tools to help you track ecosystem growth,
              quest completion rates, and token metrics across the Intuition testnet.
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon: Real-time analytics, trend analysis, and ecosystem insights
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}