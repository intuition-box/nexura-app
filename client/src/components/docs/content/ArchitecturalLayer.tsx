const ArchitecturalLayer = ({onNext, onPrev}: any) => {
  return (
    <div id="architectural-layer docs-top" className="max-w-[59rem]">

      {/* Intro */}
      <p className="text-gray-400 text-sm">
        Presentation, Wallet, API, Auth, Data, Cache, Media, Integration, Server On-Chain, User On-Chain, Protocol, Knowledge Graph, and Ops form a layered architecture where each layer handles a specific responsibility while working together as one unified flow.
      </p>

      {/* Best Practices for Users Header */}
      <div id="best-practices-for-users" className="flex items-center gap-3 mt-10">
        <div className="w-[4px] h-[24px] bg-[#8B3EFE]" />
        <h3 className="text-[#8B3EFE] text-sm font-medium">
          Best Practices for Users
        </h3>
        <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
      </div>

      {/* User Points */}
      <ul className="mt-4 space-y-3 text-gray-400 text-sm list-none">

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Always verify the URL before connecting your wallet. The official site is nexura.intuition.box</span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Never share your private keys, seed phrases, or recovery phrases</span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Carefully review all wallet approval prompts before confirming transactions</span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Only interact with campaigns through the official platform</span>
        </li>

      </ul>

      {/* Best Practices for Builders Header */}
      <div id="best-practices-for-builders" className="flex items-center gap-3 mt-10">
        <div className="w-[4px] h-[24px] bg-[#8B3EFE]" />
        <h3 className="text-[#8B3EFE] text-sm font-medium">
          Best Practices for Builders
        </h3>
        <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
      </div>

      {/* Builder Points */}
      <ul className="mt-4 space-y-3 text-gray-400 text-sm list-none">

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Ensure campaign information is accurate and transparent</span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Protect your Studio credentials and share them only with trusted team members</span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Communicate clearly with your community about tasks and rewards</span>
        </li>

        <li className="flex gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>Review submissions fairly and carefully</span>
        </li>

      </ul>

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
              Nexura Technical Overview
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
            FAQs
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

export default ArchitecturalLayer;