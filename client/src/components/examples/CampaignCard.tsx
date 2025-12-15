import CampaignCard from '../CampaignCard';
import questHero from '@assets/generated_images/Gaming_quest_interface_0f81d47c.png';
import siteLogo from '@assets/logo.png';

export default function CampaignCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <CampaignCard
        title="Theo x Nexura"
        projectName="Theo"
        projectLogo={siteLogo}
        heroImage={questHero}
        participantCount={1466}
        starts_at="2024-09-19T09:00:00Z"
        ends_at="2024-10-19T09:00:00Z"
        isLive={true}
      />
      <CampaignCard
        title="The Road to UpTEAber"
        projectName="Tea-Fi"
        projectLogo={siteLogo}
        heroImage={questHero}
        participantCount={6594}
        starts_at="2024-09-12T10:00:00Z"
        ends_at="2024-10-16T10:00:00Z"
        isLive={true}
      />
      <CampaignCard
        title="CoinW Campaign"
        projectName="CoinW"
        projectLogo={siteLogo}
        heroImage={questHero}
        participantCount={3034}
        starts_at="2024-09-08T11:00:00Z"
        ends_at="2024-09-22T11:00:00Z"
        isLive={false}
      />
    </div>
  );
}