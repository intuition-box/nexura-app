const WhyNexuraExists = ({ onNext, onPrev }: any) => {
  return (
    <div className="max-w-[59rem]">

      {/* Intro */}
      <p className="text-gray-400 text-sm">
        Decentralized ecosystems suffer from three structural limitations. Nexura is built to convert each limitation into an opportunity for active participation.
      </p>

      {/* Section 1 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] text-sm font-medium">
          Lack of Participation Status
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Most ecosystems provide tools for building applications, but not for coordinating user participation. This leaves users to discover projects independently, decide how to contribute without guidance, and understand each project's systems on their own. Without structure, the result is low participation and shallow engagement.
        </p>
      </div>

      {/* Section 2 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] text-sm font-medium">
          Limited Cross-Platform Engagement Tracking
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Participation is typically scattered across platforms including social networks, Discord servers, and isolated applications. Because there is no unified mechanism for tracking engagement across projects, participation remains fragmented and difficult to measure.
        </p>
      </div>

      {/* Section 3 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] text-sm font-medium">
          Builder-User Disconnect
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Without a shared or clearly defined framework, builders and users operate in isolation. Builders need feedback providers, contributors, and testers. Users want recognition for their efforts, guidance on how to contribute, and a meaningful sense of progress. Nexura bridges this gap by creating a structure that serves both sides simultaneously.
        </p>
      </div>

      {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33]"></div>

      {/* Ecosystem Role */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] text-sm font-medium">
          Nexura's Role in the Ecosystem
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Nexura exists to make participation more meaningful and to help projects attract the authentic, quality contribution they need to grow.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Nexura introduces standardized participation mechanics with measurable contribution signals. It is an engagement platform that supports progression and identity systems. With Nexura in place, participation is no longer unevenly distributed across isolated platforms. It is structured, trackable, and system-wide.
        </p>
      </div>

      {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33]"></div>

      {/* Audience Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

          <h3 className="text-[#8B3EFE] text-sm font-medium">
            This Documentation is written for?
          </h3>

          <div className="flex-1 h-[1px] bg-[#FFFFFF33]"></div>
        </div>

        <div className="mt-4 text-gray-400 text-sm space-y-4">

          <div>
            <p className="font-medium text-gray-300">Users:</p>
            <p>
              Individuals who want to participate in activities, build a visible presence in the ecosystem, explore projects, learn, and contribute. This documentation explains how Nexura works, how users can contribute and find projects, how progress is measured, and what Nexura offers for personal growth.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-300">Builders:</p>
            <p>
              Teams building applications or products who want to run campaigns or participation programs, engage users, collect structured feedback, and measure engagement outcomes. This documentation explains how to create quests and campaigns, how to design participation flows, and how to record user activity.
            </p>
          </div>

        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between">

        {/* Previous */}
        <div
        onClick={onPrev}
        className="w-[14rem] cursor-pointer group border border-white/30 rounded-lg p-3 bg-transparent">
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
              What is Nexura?
            </p>
          </div>
        </div>

        {/* Next */}
        <div 
        onClick={onNext}
        className="w-[14rem] cursor-pointer group border border-white/30 rounded-lg p-3 bg-transparent">
          <div className="flex justify-end">
            <h4 className="text-[#8B3EFE] text-xs font-medium tracking-wider">
              NEXT
            </h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-400 text-sm">
              User Guide
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

export default WhyNexuraExists;