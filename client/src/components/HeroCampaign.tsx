import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  project_name: string;
  projectLogo: string;
  participants: number;
  starts_at: string;
  ends_at: string;
  isLive: boolean;
  reward?: {
    xp: string;
    trustTokens: string;
  };
  heroImage: string;
}

interface HeroCampaignProps {
  campaigns: Campaign[];
}

export default function HeroCampaign({ campaigns }: HeroCampaignProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  const currentCampaign = campaigns[currentIndex];

  const handleCampaignClick = () => {
    if (currentCampaign) {
      setLocation(`/campaign/${currentCampaign._id}`);
    }
  };

  const formatParticipants = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    return { month, day, time };
  };

  const nextCampaign = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  const prevCampaign = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  if (!currentCampaign) return null;

  const starts_at = formatDate(currentCampaign.starts_at);
  const ends_at = formatDate(currentCampaign.ends_at);

  return (
    <div
    className="relative h-[24rem] sm:h-96 glass rounded-3xl overflow-hidden mb-6 cursor-pointer group"
      onClick={handleCampaignClick}
      data-testid="hero-campaign-card"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${currentCampaign.heroImage})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevCampaign();
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 glass hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
        data-testid="button-prev-campaign"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          nextCampaign();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 glass hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
        data-testid="button-next-campaign"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="relative h-full flex flex-col sm:flex-row items-start sm:items-center">
        <div className="flex-1 p-4 sm:p-8">
          {/* Participant Count */}
          <div className="text-white/80 text-sm mb-2">
            {formatParticipants(currentCampaign.participants ?? 0)} participants
          </div>

          {/* Campaign Label */}
          <div className="text-white/60 text-sm mb-2">Campaign</div>


          {/* Campaign Title */}
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">{currentCampaign.title}</h1>

          {/* Campaign Description */}
          <p className="text-sm sm:text-lg text-white/80 mb-4 sm:mb-6 max-w-full sm:max-w-md">{currentCampaign.description}</p>

          {/* Date and Status */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{starts_at.month}</div>
                <div className="text-white font-bold text-2xl">{starts_at.day}</div>
              </div>
              <div className="text-white/60 text-sm">
                <div>{starts_at.time}</div>
                <div>to {ends_at.time}</div>
              </div>
            </div>

            {currentCampaign.isLive && (
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                Live
              </Badge>
            )}
          </div>

          {/* Reward Pool */}
          {currentCampaign.reward && (
            <div className="flex items-center space-x-2">
              <span className="text-white/60">Total Rewards Pool</span>
              <div className="flex items-center space-x-2">
                {/* <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div> */}
                <span className="text-white font-bold text-lg">
                  {currentCampaign.reward.xp} XP + {currentCampaign.reward.trustTokens} TRUST
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3D Hexagonal Logo Display */}
        <div className="flex-shrink-0 mt-6 sm:mt-0 sm:pr-8 flex justify-center sm:justify-end">
          <div className="relative">
            {/* 3D Hexagonal Base */}
            <div className="relative w-32 h-32 sm:w-48 sm:h-48">
              {/* Base hexagon */}
              <div className="absolute inset-0 transform perspective-1000 rotate-x-20">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 clip-hexagon transform-3d"></div>
              </div>

              {/* Top hexagon */}
              <div className="absolute inset-4 transform perspective-1000 rotate-x-20 translate-y-2">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 clip-hexagon transform-3d"></div>
              </div>

              {/* Project Logo */}
              <div className="absolute inset-8 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-black rounded-full flex items-center justify-center border-4 border-white/20">
                  <img
                    src="/3D%20LOGO.png"
                    alt={currentCampaign.project_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {campaigns.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            data-testid={`pagination-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}