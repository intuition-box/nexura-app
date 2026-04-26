const TechnicalOverview = ({onNext, onPrev}: any) => {
  return (
    <div id="nexura-technical-overview" className="max-w-[59rem]">

      {/* Intro Paragraph */}
      <p className="text-gray-400 text-sm mt-4">
        Nexura is built as a three-part system that separates user experience, application logic, and on-chain ownership while keeping them tightly connected.
      </p>

      <p className="text-gray-400 text-sm mt-3">
        At a high level:
      </p>

      {/* Key Points */}
      <ul className="mt-4 space-y-3 text-gray-400 text-sm list-none">

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>
            <span className="font-semibold">Browser (React);</span> The interface users interact with
          </span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>
            <span className="font-semibold">Server (Bun + Express);</span> Handles logic, progress tracking, verification, and authorization
          </span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>
            <span className="font-semibold">Intuition chain;</span> Stores badges, rewards, and claim shares
          </span>
        </li>

      </ul>

      {/* Section Title */}
      <h4 id="stack-at-a-glance" className="text-[#8B3EFE] text-lg font-medium mt-10">
        Stack at a Glance
      </h4>

      <p className="text-gray-400 text-sm mt-3">
        A breakdown of the technologies powering Nexura. Our architecture is designed for maximum scalability, security, and developer experience.
      </p>

      {/* Image */}
      <div className="mt-8 flex justify-center">
        <img
          src="/technical.png"
          alt="Technical Overview"
          className="w-full max-w-[32rem]"
        />
      </div>

            {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between max-w-[59rem]">

        {/* Previous */}
        <div
          onClick={onPrev}
          className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2"
        >
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
              The Nexon System
            </p>
          </div>
        </div>

        {/* Next */}
        <div
          onClick={onNext}
          className="w-[10rem] cursor-pointer group border border-white/30 rounded-lg p-2"
        >
          <div className="flex justify-end">
            <h4 className="text-[#8B3EFE] text-xs font-medium tracking-wider">
              NEXT
            </h4>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-400 text-sm">
              Architectural Layer
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

export default TechnicalOverview;