import { useEffect } from "react";

const Introduction = ({ onNext, setSections }: any) => {

  return (
    <div id="introduction">

      {/* Intro Paragraph */}
      <p className="text-gray-400 text-sm max-w-[59rem]">
        Nexura is the engagement engine for the Intuition ecosystem. It was created to solve one of the challenges in the Intuition ecosystem, which is how to turn passive users into active contributors, and how to help builders reach users in a meaningful and measurable way. Nexura also helps users discover, understand, and contribute meaningfully on Intuition while learning about Web3.
      </p>

      {/* The Problem */}
      <div id="the-problem" className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE]" />
          <h3 className="text-[#8B3EFE] text-sm font-medium">The Problem</h3>
          <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
        </div>

        <p className="mt-4 text-gray-400 text-sm max-w-[59rem]">
          As the Intuition ecosystem continues to grow with more dApps being built, user engagement has not kept pace with the progress being made in ecosystem development. For builders, getting their product in front of users, measuring real engagement, and collecting meaningful feedback has always been a challenge within the Intuition ecosystem. New and existing users feel disconnected from builders and most times struggle to know where to get started.
        </p>
      </div>

      {/* The Solution */}
      <div id="the-solution" className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#00E1A2]" />
          <h3 className="text-[#00E1A2] text-sm font-medium">The Solution</h3>
          <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
        </div>

        <p className="mt-4 text-gray-400 text-sm max-w-[59rem]">
          Nexura brings everything together in one place: discovering, learning, participating, building a reputation, and earning, while also connecting builders and users. Every action you take like learning, exploring a project, completing a quest, or campaigns, counts and shows your progress. For builders, Nexura gives them a way to see how users engage, onboard users, and get real feedback from users that can be implemented.
          <br /><br />
          Nexura answers both the user and builder problem by providing a structured participation layer that connects discovery, onboarding, contribution, and recognition into a single system.
        </p>
      </div>

       <div className="mt-10">

      {/* Heading */}
      <h3 id="what-is-nexura"
        className="text-3xl font-medium"
        style={{
          background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        What is Nexura?
      </h3>

      {/* Description */}
      <p className="mt-6 text-gray-400 text-sm max-w-[59rem]">
        Nexura is the engagement engine for the Intuition ecosystem. It is a platform where users discover projects across the ecosystem, participate in quests, learn about Web3 and the Intuition ecosystem, and build their reputation through meaningful contributions. Nexura serves as the central nexus within the Intuition ecosystem, a place that aggregates everything being built, surfaces ways to get involved, and helps people orient themselves quickly. It also provides an avenue where builders can create campaigns and lessons, collect feedback from users, and drive adoption for their products.
      </p>

      {/* The Vision */}
      <div id="the-vision" className="mt-10">
        <div className="flex items-center gap-3">
          {/* <div className="w-[4px] h-[24px] bg-[#8B3EFE]" /> */}
          <h3 className="text-xl font-medium">The Vision</h3>
          <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
        </div>

        <p className="mt-4 text-gray-400 text-sm max-w-[59rem]">
          Nexura is working towards a future where no meaningful effort goes to waste and no active user is unseen, a place where projects can easily onboard users, get real feedback, and build stronger, more intentional connections with their communities. Nexura helps users and builders to:
        </p>

        <ul className="mt-4 space-y-2 text-gray-400 text-sm list-none">
  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Turn users into active participants:
      </span>{" "}
      Help people move from just observing to actually taking part through simple actions like learning, completing tasks, and contributing.
    </span>
  </li>

  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Make it easy to discover and get involved:
      </span>{" "}
      Give users a clear path to find projects and understand them.
    </span>
  </li>

  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Connect builders and users:
      </span>{" "}
      Help builders get real feedback and build stronger, more intentional connections with their communities.
    </span>
  </li>

  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Build a trusted reputation system:
      </span>{" "}
      Make every action count, so users can see a clear track record of what they’ve done.
    </span>
  </li>

  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Bring everything into one place:
      </span>{" "}
      Combine learning, onboarding, participation, feedback, and rewards into a single, easy-to-use platform.
    </span>
  </li>

  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Reward meaningful contributions:
      </span>{" "}
      Encourage users by rewarding actions that truly add value to the ecosystem.
    </span>
  </li>

  <li className="flex items-start gap-2">
    <span className="text-[#8B3EFE]">•</span>
    <span>
      <span className="font-medium text-white">
        Attest user contributions on the knowledge graph:
      </span>{" "}
      Every action you take—learning, completing quests, exploring projects, or campaigns—creates proof recorded and verifiable on-chain through the Intuition Knowledge Graph.
    </span>
  </li>
</ul>
      </div>

      {/* Built On */}
      <div id="built-on" className="mt-10">
        <div className="flex items-center gap-3">
          {/* <div className="w-[4px] h-[24px] bg-[#8B3EFE]" /> */}
          <h3 className="text-xl font-medium">What Nexura is Built On</h3>
          <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
        </div>

        <p className="mt-4 text-gray-400 text-sm max-w-[59rem]">
          Nexura is built on the Intuition Network, a custom Layer 3 blockchain settling to Base, built on the Arbitrum Orbit stack. Intuition is a decentralized protocol for building the world's first open, semantic, and token curated knowledge graph.
        </p>
      </div>

      {/* Who it serves */}
      <div id="who-serves" className="mt-10">
        <div className="flex items-center gap-3">
          {/* <div className="w-[4px] h-[24px] bg-[#8B3EFE]" /> */}
          <h3 className="text-xl font-medium">Who Nexura Serves</h3>
          <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
        </div>

        <p className="mt-2 text-gray-400 text-sm max-w-[59rem]">
          Nexura serves two types of participants in the Intuition ecosystem:
        </p>

        <div className="mt-6 space-y-6">

          {/* Everyday Users */}
          <div>
            <div className="flex items-center gap-1">
          <div className="w-[2px] h-[16px] bg-[#8B3EFE]" />
          <h3 className="text-[#8B3EFE] text-sm font-medium">Everyday Users:</h3>
          {/* <div className="flex-1 h-[1px] bg-[#FFFFFF33]" /> */}
        </div>

            <p className="mt-2 text-gray-400 text-sm max-w-[59rem]">
              Users who want to discover projects, build their reputation, learn, give feedback, contribute meaningfully to the ecosystem, and earn rewards or recognition for their contributions.
            </p>
          </div>

          {/* Builders & Projects */}
          <div>
            <div className="flex items-center gap-1">
          <div className="w-[2px] h-[16px] bg-[#8B3EFE]" />
          <h3 className="text-[#8B3EFE] text-sm font-medium">Builders and Projects:</h3>
          {/* <div className="flex-1 h-[1px] bg-[#FFFFFF33]" /> */}
        </div>

            <p className="mt-2 text-gray-400 text-sm max-w-[59rem]">
              Who need a structured way to onboard users, engage their community, track participation, and gather meaningful feedback from users.
            </p>
          </div>
        </div>
      </div>
    </div>

          {/* Next Button */}
<div className="mt-10 flex justify-end">
  <div
  onClick={onNext}
    className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg bg-transparent p-2"
  >
    {/* Label */}
    <div className="flex justify-end">
      <h4 className="text-xs font-medium tracking-wider text-[#8B3EFE]">
        NEXT
      </h4>
    </div>

    {/* Content */}
    <div className="flex items-center justify-between mt-2">
      <p className="text-gray-400 text-sm">
        Key Features
      </p>

      <span className="text-[#8B3EFE] text-base transition group-hover:translate-x-1">
        →
      </span>
    </div>
  </div>
</div>

    </div>
  );
};

export default Introduction;