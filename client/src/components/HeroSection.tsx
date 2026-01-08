import { Button } from "./ui/button";
import { Card } from "./ui/card";
const userAvatar = require("../../../attached_assets/generated_images/User_avatar_Web3_0f8d9459.png");
const siteLogo = require("../../../attached_assets/logo.png");

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-[#071025] via-[#081728] to-[#0b2130] py-20 px-4 text-foreground" data-testid="hero-section">
      <div className="max-w-7xl mx-auto">
        {/* Main Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight" data-testid="hero-title">
            Build. Learn. Earn.
          </h1>
          <p className="text-lg md:text-2xl text-accent-foreground/80 mb-8 max-w-2xl mx-auto" data-testid="hero-subtitle">
            Modern learning and project activations onchain — polished UX and curated tasks to help creators and contributors grow.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="btn-shine btn-float btn-glow" data-testid="button-launch-activation-hero">
              Launch Activation
            </Button>
            <Button size="lg" variant="outline" className="btn-float" data-testid="button-intel-hero">
              Intel
            </Button>
            <a href="/levels">
              <Button size="lg" variant="ghost" className="btn-float" data-testid="button-levels-hero">Levels</Button>
            </a>
          </div>

          <div className="max-w-4xl mx-auto mt-6">
            <div className="rounded-2xl p-6 bg-gradient-to-r from-white/3 to-white/2 border border-white/6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-4">
                <img src={siteLogo} alt="Nexura" className="w-12 h-12 rounded-md" />
                <div>
                  <div className="text-sm text-accent">Featured Activation</div>
                  <div className="text-lg font-semibold">Get Started — Free</div>
                </div>
                <div className="ml-auto">
                  <Button size="sm" variant="quest" className="btn-float">Join</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Quest Card */}
        <Card className="max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-card-border hover-elevate" data-testid="featured-quest-card">
          <div className="flex items-start space-x-4">
            <img src={siteLogo} alt="Nexura" className="w-16 h-16" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-accent/20 text-accent px-2 py-1 rounded text-sm font-medium">
                  Activation
                </span>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Get Started</h3>
              <p className="text-muted-foreground mb-4">
                Learn crypto through curated lessons at your own pace, and mint CUBEs as your proof of progress at no cost.
              </p>

              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <img
                      key={i}
                      src={userAvatar}
                      alt="Participant"
                      className="w-8 h-8 rounded-full border-2 border-card"
                    />
                  ))}
                </div>
                <div>
                  <div className="text-lg font-bold text-card-foreground">29K</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
                <div className="ml-auto">
                  <div className="text-lg font-bold text-card-foreground">133</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}