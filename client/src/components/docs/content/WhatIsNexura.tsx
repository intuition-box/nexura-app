import { useEffect } from "react";

const WhatIsNexura = ({ onNext, setSections }: any) => {

useEffect(() => {
  setSections([
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "why-nexura", title: "Why Nexura", level: 2 },
    { id: "the-vision", title: "The Vision", level: 2 },
    { id: "vision-users", title: "For Users", level: 3 },
    { id: "vision-builders", title: "For Builders", level: 3 },
  ]);
}, []);

  return (
  <div id="introduction">
  <p className="text-gray-400 text-sm max-w-[59rem]">
        Nexura is an engagement engine for the Intuition ecosystem that organizes participation across decentralized projects. It creates a structured environment where users discover projects, complete quests and campaigns, and build contribution history, while builders coordinate engagement and identify contributors. By connecting activities, identity, and reputation in one participation framework, Nexura makes ecosystem engagement structured, trackable, and measurable.
      </p>

      {/* Subsection: For Users */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE] "></div>

          <h3
  className="text-[#8B3EFE] text-sm font-medium"
>
  For Users
</h3>

          <div className="flex-1 h-[1px] bg-[#FFFFFF33] max-w-[53rem]"></div>
        </div>

        <div className="mt-4 text-gray-400 text-sm max-w-[59rem] space-y-2">
          <p>Nexura Provides:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>The ability to discover projects, campaigns, and activities.</li>
            <li>A structured way to participate through tasks and quests.</li>
            <li>A means to track engagement through experience and reputation.</li>
            <li>The foundation for building an identity rooted in contribution.</li>
          </ul>
        </div>
      </div>

      {/* Subsection: For Builders */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

          <h3
  className="text-[#8B3EFE] text-sm font-medium"
>
  For Builders
</h3>

          <div className="flex-1 h-[1px] bg-[#FFFFFF33] max-w-[52rem]"></div>
        </div>

        <div className="mt-4 text-gray-400 text-sm max-w-[59rem] space-y-2">
          <p>Nexura Provides:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Tools to design and manage participation programs.</li>
            <li>Mechanisms to measure engagement quality.</li>
            <li>A framework for rewarding users fairly and transparently.</li>
          </ul>

          <div className="mt-4"></div>

          <p>
            As an engagement engine, Nexura acts as the connective layer between:
          </p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Users and applications.</li>
            <li>Participation and identity.</li>
            <li>Activities and reputation.</li>
          </ul>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 flex items-center gap-3 bg-[#C9AAFF33] p-1 rounded-md max-w-[43rem]">
        <img src="/info.png" alt="info" className="w-4 h-4" />
        <p className="text-xs">
          Nexura does not replace existing communities or projects. It connects them through a shared participation framework.
        </p>
      </div>

            {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>
      {/* Why Nexura */}
      <div className="mt-8 max-w-[59rem]">
        <h3
  id="why-nexura"
  className="text-[#8B3EFE] text-xl font-medium"
>
  Why Nexura
</h3>

        <p className="text-gray-400 text-sm mt-3">
          Decentralized ecosystems suffer from three structural limitations. Nexura is built to convert each limitation into an opportunity for active participation.
        </p>

        {/* Cards */}
        <div className="mt-6 flex gap-4 flex-wrap">
          <img src="/why-nexura.png" alt="Why Nexura" className="w-full max-w-[59rem]" />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* The Vision */}
      <div className="mt-8 max-w-[59rem]">
        <h3
  id="the-vision"
  className="text-[#8B3EFE] text-sm font-medium"
>
  The Vision
</h3>

        {/* Users */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

            <h4
  id="vision-users"
  className="text-[#8B3EFE] text-sm font-medium"
>
  For Users
</h4>

            <div className="flex-1 h-[1px] bg-[#FFFFFF33]"></div>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Nexura works as a starting point. A user can enter Nexura without prior knowledge of any project and still find a clear path forward. They can discover ongoing activities, choose what to explore, and begin participating without needing to search across many platforms simultaneously. As users continue to participate, Nexura becomes a permanent record of their activity. Each action adds to their experience and reputation. Over time, users move from simple exploration toward more meaningful contributions.
          </p>

          <div className="mt-4 text-gray-400 text-sm space-y-1">
            <p>User activities include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Discover projects and ecosystem opportunities.</li>
              <li>Participate through quest and campaigns.</li>
              <li>Track experience and contribution history.</li>
              <li>Build reputation through engagement.</li>
              <li>Learn and contribute across multiple projects.</li>
            </ul>
          </div>
        </div>

        {/* Builders */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

            <h4
  id="vision-builders"
  className="text-[#8B3EFE] text-sm font-medium"
>
  For Builders
</h4>

            <div className="flex-1 h-[1px] bg-[#FFFFFF33]"></div>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Nexura acts as an engagement tool that allows builders to define what they want users to do and make those actions visible inside the system. Builders use Nexura to:
          </p>

          <ul className="list-disc pl-5 mt-3 text-gray-400 text-sm space-y-1">
            <li>Launch participation campaigns and quests.</li>
            <li>Attract early users and testers.</li>
            <li>Collect structured user feedback.</li>
            <li>Track engagement and participation quality.</li>
            <li>Design guided participation flows.</li>
          </ul>
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
        Why Nexura Exists
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

export default WhatIsNexura;