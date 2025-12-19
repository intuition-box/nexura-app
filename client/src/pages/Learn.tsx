import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Learn() {
  return (
    <div className="min-h-screen bg-black text-white overflow-auto p-4 sm:p-6 relative" data-testid="learn-page">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <div className="text-center py-8 sm:py-12 px-2 sm:px-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Learn</h1>
          <p className="text-base sm:text-lg text-white/60 max-w-md sm:max-w-2xl mx-auto leading-relaxed">
            Educational content and tutorials about Web3, blockchain, and the Intuition ecosystem.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="glass glass-hover rounded-2xl sm:rounded-3xl p-4 sm:p-8" data-testid="coming-soon-card">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-bold text-white">
              No Learning Materials Available
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              We're currently preparing comprehensive learning materials about Web3, DeFi, and Intuition. 
              Check back soon for tutorials, guides, and educational content.
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Coming soon: Interactive tutorials, video guides, and step-by-step walkthroughs
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
