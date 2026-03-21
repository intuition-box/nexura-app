const UserGuide = ({ onNext, onPrev }: any) => {
  return (
    <div className="max-w-[59rem]">

      {/* Intro */}
      <p className="text-gray-400 text-sm">
        Nexura is accessed through its web interface. Users interact with the platform using a wallet, which serves as their primary identity within the system.
      </p>

      {/* User Participation */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

          <h3 className="text-[#8B3EFE] text-sm font-medium">
            User Participation
          </h3>
        </div>

        {/* Image */}
        <div className="mt-4 ml-16">
          <img
  src="/user-guide-1.png"
  alt="User Guide 1"
  className="w-full max-w-[40rem] h-auto rounded-md ml-4"
/>
        </div>

        {/* Text */}
        <p className="text-gray-400 text-sm mt-4">
          Nexura does not store or control user assets. The wallet connection is used only to authenticate participation and record activity.
        </p>
      </div>

      {/* Divider */}
      <div className="mt-6 h-[1px] bg-[#FFFFFF33] max-w-[59rem]"></div>

      {/* Builder Engagement */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="w-[4px] h-[24px] bg-[#8B3EFE]"></div>

          <h3 className="text-[#8B3EFE] text-sm font-medium">
            Builder Engagement
          </h3>
        </div>

        {/* Image */}
        <div className="mt-4">
          <img
  src="/user-guide-2.png"
  alt="User Guide 2"
  className="w-full max-w-[50rem] h-auto rounded-md"
/>
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
              Why Nexura Exists
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

export default UserGuide;