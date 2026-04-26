import { useEffect } from "react";

const BuilderGuide = ({ onNext, onPrev, setSections }: any) => {

useEffect(() => {
  setSections([
    { id: "builder-guide", title: "Builder Guide", level: 2 },

    { id: "designing-campaigns", title: "Designing Campaigns", level: 3 },
    { id: "use-cases", title: "Use Cases", level: 3 },
  ]);
}, []);

  return (
    <div id="builder-guide">
      {/* Intro */}
      <p className="text-gray-400 text-sm max-w-[59rem]">
        Builders interact with Nexura not as end users, but as designers of participation flows. Their role is not simply to attract users, but to create environments where meaningful contribution can occur and be sustained over time.
        Nexura provides builders with a shared framework for coordinating participation, making engagement visible, and aligning user activity with project goals.
      </p>

      {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Designing Campaigns */}
      <div className="mt-8 max-w-[59rem]">
        <h3
  id="designing-campaigns"
  className="text-[#8B3EFE] text-sm font-medium"
>
  Designing Campaigns
</h3>

        <p className="text-gray-400 text-sm mt-4">
          Campaigns allow builders to move beyond isolated interactions and design full participation journeys. A campaign represents a structured sequence of quests that guides users through a broader experience.
        </p>
      </div>

      {/* Use Cases */}
      <div className="mt-6 max-w-[59rem]">
<h3 id="use-cases" className="text-white text-sm font-medium">
  Use Cases
</h3>

        <div className="mt-4">
          <img
            src="/use-cases.png"
            alt="Use Cases"
            className="w-full max-w-[46rem] object-contain"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Previous Button */}
      <div className="mt-10 flex justify-start max-w-[59rem]">
        <div
          onClick={onPrev}
          className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2 bg-transparent"
        >
          <div className="flex justify-start">
            <h4 className="text-[#8B3EFE] text-xs font-medium tracking-wider">
              PREVIOUS
            </h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[#8B3EFE] text-base transition group-hover:-translate-x-1">
              ←
            </span>

            <p className="text-gray-400 text-sm">
              Nexon System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderGuide;