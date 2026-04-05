import { useEffect } from "react";

const KeyFeatures = ({ onNext, onPrev, setSections }: any) => {

  useEffect(() => {
  setSections([
    { id: "key-features", title: "Key Features", level: 2 },

    { id: "quests", title: "Quests", level: 3 },
    { id: "campaigns", title: "Campaigns", level: 3 },
    { id: "xp", title: "XP (Experience Points)", level: 3 },
  ]);
}, []);

  return (
    <div id="key-features">
      {/* Intro */}
      <p className="text-gray-400 text-sm max-w-[59rem]">
        Nexura is built around a small number of core concepts. These concepts define how participation is structured and how users progress through the system. Understanding these concepts is essential to understanding how Nexura works.
      </p>

      {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Quests */}
      <div className="mt-8 flex gap-8 items-center max-w-[59rem]">
        
        {/* Text */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img src="/quest-icon.png" className="w-4 h-4" />
            <h3 id="quests" className="text-[#8B3EFE] text-sm font-medium">
              Quests
            </h3>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            A quest represents a defined activity that a user can complete. It is often the first point of interaction most users have with Nexura.
          </p>

          <div className="mt-4 text-gray-400 text-sm">
            <p>Quest activities may include:</p>

            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Exploring a project.</li>
              <li>Reading documentation.</li>
              <li>Support Claims</li>
              <li>Testing a feature</li>
              <li>Joining a Discord, following a project on X, or engaging with posts through likes, comments and reposts.</li>
              <li>Performing a specific action inside an application</li>
            </ul>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center items-center">
          <img src="/campaign-real.png" className="w-full max-w-[24rem]" />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Campaigns */}
      <div className="mt-8 flex gap-8 items-center max-w-[59rem]">
        
        {/* Image (left) */}
        <div className="flex-1 flex justify-center items-center">
          <img src="/campaign-image.png" className="w-full max-w-[24rem]" />
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img src="/campaign-iconx.png" className="w-4 h-4" />
            <h3 id="campaigns" className="text-[#8B3EFE] text-sm font-medium">
              Campaigns
            </h3>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Campaigns are collections of related quests organized around a specific theme, project, or objective. While a quest is a single action, a campaign represents a journey.
          </p>

          <div className="mt-4 text-gray-400 text-sm">
            <p>Campaigns allow builders to:</p>

            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Design structured engagement flows.</li>
              <li>Guide users through defined learning paths.</li>
              <li>Collect multiple forms of contribution over time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* XP */}
      <div className="mt-8 flex gap-8 items-center max-w-[59rem]">
        
        {/* Text */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img src="/xp-icon.png" className="w-4 h-4" />
            <h3 id="xp" className="text-[#8B3EFE] text-sm font-medium">
              XP (Experience Points)
            </h3>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            XP represents the quantitative measure of participation. Every time a user completes a quest or campaign, they earn XP. Over time, XP accumulates and reflects how active the user has been within Nexura.
          </p>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center items-center">
          <img src="/xp-image.png" className="w-full max-w-[16rem]" />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between max-w-[59rem]">

        {/* Previous */}
        <div 
          onClick={onPrev}
          className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2">
          <div className="flex justify-start">
            <h4 className="text-[#8B3EFE] text-xs font-medium tracking-wider">
              PREVIOUS
            </h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[#8B3EFE] transition group-hover:-translate-x-1">
              ←
            </span>

            <p className="text-gray-400 text-sm">
              User Guide
            </p>
          </div>
        </div>

        {/* Next */}
        <div 
          onClick={onNext}
          className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2">
          <div className="flex justify-end">
            <h4 className="text-[#8B3EFE] text-xs font-medium tracking-wider">
              NEXT
            </h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-400 text-sm">
              Nexon System
            </p>

            <span className="text-[#8B3EFE] transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default KeyFeatures;