import intuitionLogo from "@assets/image_1758369448125.png";

interface Ecosystem {
  name: string;
  logo: string;
  href: string;
}

interface EcosystemBadgesProps {
  title?: string;
  ecosystems?: Ecosystem[];
}

export default function EcosystemBadges({
  title = "Network",
  ecosystems = [] // todo: remove mock functionality - passed as prop
}: EcosystemBadgesProps) {
  // Only show Intuition ecosystem
  const defaultEcosystems: Ecosystem[] = [
    { name: "Intuition", logo: intuitionLogo, href: "/category/intuition" },
  ];

  const displayEcosystems = ecosystems.length > 0 ? ecosystems : defaultEcosystems;

  return (
    <section className="py-8" data-testid="ecosystem-badges-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <button
            className="text-sm text-primary hover:text-primary/80 font-medium"
            onClick={() => console.log('Show all ecosystems clicked')} // todo: remove mock functionality
            data-testid="button-show-all-ecosystems"
          >
            Show all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {displayEcosystems.map((ecosystem) => (
            <button
              key={ecosystem.name}
              onClick={() => console.log(`${ecosystem.name} ecosystem clicked`)} // todo: remove mock functionality
              className="group flex flex-col items-center p-4 rounded-lg bg-card hover:bg-card/80 border border-card-border hover-elevate transition-colors"
              data-testid={`ecosystem-${ecosystem.name.toLowerCase()}`}
            >
              <div className="w-12 h-12 mb-3 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={ecosystem.logo}
                  alt={ecosystem.name}
                  className="w-10 h-10 object-cover"
                />
              </div>
              <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                {ecosystem.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}