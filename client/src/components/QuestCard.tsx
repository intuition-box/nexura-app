import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useLocation } from "wouter";
const userAvatar = require("../../../attached_assets/generated_images/User_avatar_Web3_0f8d9459.png");

interface QuestCardProps {
  title: string;
  description?: string;
  projectName: string;
  projectLogo: string;
  heroImage: string;
  participants: number;
  rewards?: string;
  tags?: string[];
  isLocked?: boolean;
  lockLevel?: number;
  questId?: string;
  from?: string;
}

export default function QuestCard({
  title,
  description,
  projectName,
  projectLogo,
  heroImage,
  participants,
  rewards,
  tags = [],
  isLocked = false,
  lockLevel,
  questId,
  from
}: QuestCardProps) {
  const [, setLocation] = useLocation();
  const formatParticipants = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleClick = () => {
    if (questId && !isLocked) {
      const url = from ? `/quest/${questId}?from=${from}` : `/quest/${questId}`;
      setLocation(url);
    }
  };

  return (
    <Card
      className="overflow-hidden glass glass-hover cursor-pointer group relative rounded-3xl hover:-translate-y-1 transition-all duration-300"
      onClick={handleClick}
      data-testid={`quest-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Hero Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Project Logo */}
        <div className="absolute top-4 left-4 animate-float">
          <img
            src={projectLogo}
            alt={projectName}
            className="w-12 h-12 rounded-full border-2 border-white/30 shadow-xl"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-black/50 text-white border-white/20">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-sm font-medium">Level {lockLevel}</div>
              <div className="text-xs opacity-75">Level Locked</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-muted-foreground">{projectName}</span>
        </div>

        <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        )}

        {/* Participants and Rewards */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, Math.ceil(participants / 1000)))].map((_, i) => (
                <img
                  key={i}
                  src={userAvatar}
                  alt="Participant"
                  className="w-6 h-6 rounded-full border-2 border-card"
                />
              ))}
            </div>
            <div className="text-sm">
              <span className="font-medium text-card-foreground">{formatParticipants(participants)}</span>
              <span className="text-muted-foreground ml-1">Participants</span>
            </div>
          </div>

          {rewards && (
            <div className="text-right">
              <div className="text-sm font-medium text-card-foreground">
                <span className="text-blue-500 font-bold">5XP</span>
                <span className="text-muted-foreground mx-1">+</span>
                <span>{rewards}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}