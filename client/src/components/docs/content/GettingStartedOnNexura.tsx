const GettingStarted = ({ onNext, onPrev }: any) => {
  return (
    <div id="getting-started docs-top" className="max-w-[59rem]">

      {/* Intro */}
      <p className="text-gray-400 text-sm mt-4">
        This guide is for new users who want to visit and navigate Nexura. Whether you are new to Web3 or already experienced, this will get you started quickly.
      </p>

      {/* Step 1 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 1: Visit Nexura
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Go to https://nexura.intuition.box on your mobile phone or PC.
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 2: Connect Your Wallet
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Click Connect Wallet at the top of the page. We support wallets such as MetaMask, Zerion, Rabby, Rainbow, and WalletConnect. Your wallet is your identity on Nexura; it tracks your progress and XP. Without connecting your wallet, you cannot participate in any activity on the platform.
        </p>
      </div>

      {/* Image */}
      <div className="mt-6 flex justify-start">
        <img
          src="/get-started.png"
          alt="Getting Started"
          className="w-48 h-48"
        />
      </div>

      {/* Info Box */}
      <div className="mt-6 flex items-center gap-3 bg-[#C9AAFF33] p-3 rounded-md max-w-[43rem]">
        <img src="/info.png" className="w-4 h-4" />
        <p className="text-xs text-gray-300">
          Nexura will never ask for your private key or recovery phrase. Never share them.
        </p>
      </div>

      {/* Step 3 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 3: Set Up Your Profile
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          At the top right, click the profile icon, then proceed to edit your profile. Set your username, profile picture, and connect your socials.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Connecting socials is mandatory for social tasks. Disconnecting triggers a 3-day cooldown before reuse on another account.
        </p>
      </div>

      {/* Step 4 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 4: Proceed to Explore Nexura
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          After setting up your profile, you are ready to begin your journey as a Trail Initiate. You can explore ecosystem dApps, participate in quests and campaigns, or take lessons.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          All of these contribute to your growth, and you can track your ranking on the leaderboard.
        </p>
      </div>

      {/* Image 2 */}
      <div className="mt-6 flex justify-start">
        <img
          src="/get-started-2.png"
          alt="Explore Nexura"
          className="w-full max-w-[28rem]"
        />
      </div>

      {/* Rewards Section */}
<div id="rewards" className="mt-8">

  <h3 className="text-[#8B3EFE] font-medium">
    Rewards
  </h3>

  <p className="text-gray-400 text-sm mt-2">
    On Nexura, users earn XP or TRUST by completing quests and campaigns, exploring dApps, participating in community events, taking lessons, using integrated portal claims, referring new users, or completing daily check-ins.
  </p>

  {/* XP Definition */}
  <div id="what-is-xp" className="mt-6">
    <h4 className="text-white font-medium">
      What is XP (Experience Points)
    </h4>

    <p className="text-gray-400 text-sm mt-2">
      XP (Experience Points) represents your participation and contribution within Nexura. Every meaningful action you complete earns you XP. The more XP you earn, the higher a user ranks on the leaderboard, reflecting their activity and reputation. XP also serves as the key to unlocking a Nexon.
    </p>
  </div>

  {/* Image */}
  <div className="mt-6 flex justify-start">
    <img
      src="/xp-image.png"
      alt="XP System"
      className="w-full max-w-[28rem]"
    />
  </div>

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
              Key Features
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
              The Nexon System
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

export default GettingStarted;