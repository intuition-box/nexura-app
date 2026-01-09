import QuestCard from '../QuestCard';
import questHero from "@assets/generated_images/Web3_quest_hero_image_9eff8349.png";
import siteLogo from "@assets/logo.png";

export default function QuestCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <QuestCard
        title="Introduction to Kinetiq"
        projectName="Kinetiq"
        projectLogo={siteLogo}
        heroImage={questHero}
        participants={1100}
        tags={["New"]}
      />
      <QuestCard
        title="DeFi Staking on Avalanche"
        projectName="LFJ"
        projectLogo={siteLogo}
        heroImage={questHero}
        participants={5600}
        isLocked={true}
        lockLevel={5}
      />
      <QuestCard
        title="Syndicate: Mainnet"
        description="Learn about Syndicate's mainnet deployment and complete onchain actions"
        projectName="Syndicate"
        projectLogo={siteLogo}
        heroImage={questHero}
        participants={1100}
        rewards="500 SYNDI"
      />
    </div>
  );
}