import { useEffect } from "react";

const NexonSystem = ({ onNext, onPrev, setSections }: any) => {

  useEffect(() => {
  setSections([
    { id: "nexon-system", title: "The Nexon System", level: 2 },

    { id: "ascent-of-nexon", title: "Ascent of Nexon", level: 2 },
    { id: "path-of-nexon", title: "Path of the Nexon", level: 2 },
    { id: "nexon-progress", title: "Nexura Progression Model", level: 2 },
    { id: "how-nexons-earned", title: "How Nexons are Earned", level: 2 },
    { id: "xp-vs-nexon", title: "Difference Between XP And Nexon", level: 2 },
    { id: "abuse-anti-gaming", title: "Abuse and Anti-Gaming", level: 2 },
  ]);
}, []);

  return (
    <div id="nexon-system">
      {/* Intro */}
      <p className="text-gray-400 text-sm max-w-[59rem]">
        Nexon is the identity and progression system within Nexura. It represents the long-term journey of a user through the ecosystem, combining XP, reputation, and participation history. Nexon reflects how users engage, not just how much they engage.
      </p>

      <div className="mt-3 text-gray-400 text-sm">
        <p>The Nexon functions as:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-[#8B3EFE]">
          <li>A participation identity.</li>
          <li>A progression framework.</li>
          <li>A reputation signal.</li>
        </ul>
      </div>

      {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Ascent */}
      <div className="mt-8 max-w-[59rem]">
        <h3 id="ascent-of-nexon" className="text-white text-sm font-medium">
          The Ascent of A Nexon
        </h3>

        <div className="mt-4 flex justify-center">
          <img src="/nexons-ascent.png" className="w-full max-w-[50rem]" />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Path */}
      <div className="mt-8 max-w-[59rem]">
        <h3 id="path-of-nexon" className="text-[#8B3EFE] text-sm font-medium">
          The Path of the Nexons
        </h3>

        <p className="text-gray-400 text-sm mt-4 leading-relaxed">
          Every explorer enters Nexura the same way, with curiosity and no map. As a{" "}
          <span className="font-semibold text-white">Trail Initiate</span>, you take your first steps into the realm, learning how paths are formed and where knowledge hides. With each quest completed, you begin to see clearer routes, earning the trust of the land and becoming a{" "}
          <span className="font-semibold text-white">Pathfinder</span>, one who moves with purpose, not chance.

          Those who dig deeper become{" "}
          <span className="font-semibold text-white">Scouts of Lore</span>, uncovering fragments of truth left behind by earlier explorers. The realm opens further, revealing relics, symbols, and forgotten doors. As a{" "}
          <span className="font-semibold text-white">Relic Runner</span> and{" "}
          <span className="font-semibold text-white">Rune Raider</span>, you learn that progress is earned by action, by chasing the unknown and decoding what others overlook.

          Beyond the surface lie sealed vaults and ancient depths.{" "}
          <span className="font-semibold text-white">Vault Seers</span> and{" "}
          <span className="font-semibold text-white">Crypt Divers</span> are not defined by strength alone, but by resolve, willing to descend where certainty fades and only understanding leads the way.

          At the highest tiers, explorers become guardians of the realm.{" "}
          <span className="font-semibold text-white">Temple Wardens</span> protect the knowledge they have earned, while{" "}
          <span className="font-semibold text-white">Relic Masters</span> shape the future using what they have uncovered.

          Few reach this point, and fewer still carry its responsibility. Those who do are known as{" "}
          <span className="font-semibold text-white">Nexon Vanguards</span>.
        </p>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Progression Model */}
      <div className="mt-8">
        <div className="flex items-center gap-3 max-w-[59rem]">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

          <h3 id="nexon-progress" className="text-[#8B3EFE] text-sm font-medium">
            Nexura Progression Model
          </h3>

          <div className="flex-1 h-[1px] bg-[#FFFFFF33]"></div>
        </div>

        <p className="text-gray-400 text-sm mt-4 max-w-[59rem]">
          The Nexon system is structured into ten distinct progression tiers. Each tier represents a stage of participation maturity within Nexura. These tiers are not for display purposes only. They signal how deeply a user understands the ecosystem and how much responsibility they can be trusted with.
        </p>

        <div className="mt-6 flex justify-center">
          <img src="/nexons-table.png" className="w-full max-w-[50rem]" />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* How Nexons are Earned */}
      <div className="mt-8 max-w-[59rem]">
        <h3 id="how-nexons-earned" className="text-[#8B3EFE] text-sm font-medium">
          How Nexons are Earned
        </h3>

        <p className="text-gray-400 text-sm mt-4">
          Nexons are not earned through passive presence. They are earned through participation. Every Nexon is built from accumulated actions recorded by Nexura. These actions include, but are not limited to:
        </p>

        <ul className="list-disc pl-5 mt-3 text-gray-400 text-sm space-y-1 marker:text-[#8B3EFE]">
          <li>Completing Quests</li>
          <li>Participating in Campaigns</li>
          <li>Exploring Projects</li>
          <li>Giving honest feedback</li>
          <li>Engaging with system content</li>
          <li>Daily check-in on the website</li>
          <li>Buying of shares using the Nexura Portal Integration</li>
        </ul>

        <p className="text-gray-400 text-sm mt-4">
          Nexon progression is therefore resistant to manipulation. It is designed to reflect sustained involvement rather than isolated bursts of activity. In practice, a user's Nexon grows as they expand their participation, maintain long-term engagement, contribute across multiple domains, and demonstrate learning and reliability.
        </p>

        <p className="text-gray-400 text-sm mt-3">
          The result is an identity that cannot be purchased, transferred, or fabricated. It must be built step by step.
        </p>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* XP vs Nexon */}
      <div className="mt-8 max-w-[59rem]">
        <h3 id="xp-vs-nexon" className="text-[#8B3EFE] text-sm font-medium">
          Difference Between XP And Nexons
        </h3>

        <p className="text-gray-400 text-sm mt-4">
          XP is a metric. Nexon is an identity.
        </p>

<ul className="list-disc text-gray-400 text-sm mt-2 ml-5 space-y-2 marker:text-[#8B3EFE]">
  <li>XP answers the question: How active is this user?</li>
  <li>Nexon answers the question: What kind of participant has this user become?</li>
</ul>

        <p className="text-gray-400 text-sm mt-2">
          XP can be seen as a component of Nexon, but Nexon cannot be reduced to XP alone. Nexon reflects patterns, behavior, and long-term engagement, not just numerical accumulation.
        </p>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Abuse */}
      <div className="mt-8 max-w-[59rem]">
        <h3 id="abuse-anti-gaming" className="text-[#8B3EFE] text-sm font-medium">
          Abuse and Anti-Gaming
        </h3>

        <p className="text-gray-400 text-sm mt-4">
          Nexura prevents manipulation by ensuring participation remains meaningful and cannot be faked or rushed. The system is designed to discourage behaviors such as:
        </p>

        <ul className="list-disc pl-5 mt-3 text-gray-400 text-sm space-y-1 marker:text-[#8B3EFE]">
          <li>Repeating low-value tasks.</li>
          <li>Automating participation.</li>
          <li>Performing actions without meaningful engagement.</li>
          <li>Connecting multiple wallets to a single user account.</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex justify-between max-w-[59rem]">

        {/* Previous */}
        <div 
        onClick={onPrev}
        className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2">
          <div className="flex justify-start">
            <h4 className="text-[#8B3EFE] text-xs font-medium">PREVIOUS</h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[#8B3EFE] group-hover:-translate-x-1">←</span>
            <p className="text-gray-400 text-sm">Key Features</p>
          </div>
        </div>

        {/* Next */}
        <div 
        onClick={onNext}
        className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2">
          <div className="flex justify-end">
            <h4 className="text-[#8B3EFE] text-xs font-medium">NEXT</h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-400 text-sm">Builder Guide</p>
            <span className="text-[#8B3EFE] group-hover:translate-x-1">→</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NexonSystem;