import { useState } from "react";

const FAQItem = ({ question, answer }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={() => setOpen(!open)}
      className="bg-[#12131D] rounded-md px-4 py-3 w-full max-w-[42rem] cursor-pointer transition"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-white font-medium">
          {question}
        </h3>

        <img
          src="/dropdown.png"
          className={`w-3 h-2 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Divider */}
      {open && (
        <div className="mt-3 h-[1px] bg-[#FFFFFF33]" />
      )}

      {/* Answer */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[400px] mt-3" : "max-h-0"
        }`}
      >
        <p className="text-gray-400 text-sm whitespace-pre-line">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ = ({ onNext, onPrev }: any) => {
  const faqs = [
    {
      question: "What is Nexura?",
      answer:
        "Nexura is the engagement engine for the Intuition ecosystem. It is a platform where users discover projects across the ecosystem, participate in quests, learn about Web3 and the Intuition ecosystem, and build their reputation through meaningful contributions.",
    },
    {
      question: "Is Nexura free?",
      answer:
        "Nexura is mostly free to use. Most activities, such as quests, campaigns, dApp exploration, and lessons, are free. However, some tasks may require a small amount of TRUST (usually under $1) to participate, and while users may sometimes be compensated for completing certain tasks, this is not guaranteed. Also, Proof of Action is required to claim XP, which costs 0.1 TRUST.",
    },
    {
      question: "Which blockchain is it built on?",
      answer:
        "Nexura is built on the Intuition Network, a Layer 3 chain built on Arbitrum Orbit and settling to Base.",
    },
    {
      question: "Do I need Web3 experience?",
      answer:
        "No. Nexura is designed for all experience levels, with a Learn hub to help beginners onboard.",
    },
    {
      question: "How do I create an account?",
      answer:
        "To create an account, connect your wallet and approve the connection. Your wallet address becomes your identity on the platform, and all your progress is saved to it automatically.",
    },
    {
      question: "Which wallets are supported?",
      answer:
        "MetaMask, Zerion, Rabby, WalletConnect-compatible wallets, and other EVM wallets.",
    },
    {
      question: "Will Nexura ever ask for my private keys?",
      answer:
        "Nexura will never ask for your private key or seed phrase, nor do we store or have access to your private keys.",
    },
    {
      question: "Can I use multiple wallets?",
      answer:
        "Nexura strictly enforces a one-user, one-account rule.",
    },
    {
      question: "How do I earn XP?",
      answer:
        "Through quests, campaigns, lessons, events, check-ins, Portal Claims, referrals, or participation in community events.",
    },
    {
      question: "Daily check-in reward?",
      answer: "20 XP every 24 hours.",
    },
    {
      question: "Portal Claims reward?",
      answer: "500 XP per transaction above 200 TRUST.",
    },
    {
      question: "Can XP decrease?",
      answer: "No. XP is permanent.",
    },
    {
      question: "What is a Nexon?",
      answer:
        "A Nexon is an NFT on Nexura that represents a user’s level and progress within the platform.",
    },
    {
      question: "How do I rank up?",
      answer: "By consistent participation across platform activities.",
    },
    {
      question: "How many Nexons exist?",
      answer: "Ten total Nexons, from Trial Initiate to Nexon Vanguard.",
    },
    {
      question: "Difference between quests and campaigns?",
      answer:
        "Quests are individual tasks. Campaigns are structured, multi-step experiences created by builders.",
    },
    {
      question: "How long does it take to validate my social tasks?",
      answer: "It takes 10 minutes to 48 hours to validate social tasks.",
    },
    {
      question: "What if my task gets rejected?",
      answer:
        "You can resubmit, but make sure you complete the required task and submit the required evidence.",
    },
    {
  question: "Campaign cost?",
  answer:
    "For users, completing campaigns on Nexura is free to participate in. However, users are required to have at least 0.1 TRUST in their balance, as they must create a Proof of Action after completing a campaign before they can claim their XP. For builders who want to launch campaigns, there is a fee of 1,000 TRUST per campaign. This helps prevent abuse of the XP system by discouraging unauthorized campaign creation, as campaign creation is strictly reserved for builders. These fees also support the continued operation of the platform."
},
    {
      question: "Do I need to offer rewards?",
      answer:
        "No. XP-only campaigns are allowed. Adding TRUST rewards is optional.",
    },
    {
      question: "Can I edit campaigns after launch?",
      answer: "Yes, you can edit campaigns after publishing.",
    },
    {
      question: "How are campaign rewards distributed?",
      answer:
        "Nexura supports an FCFS rewards distribution model. Rewards are distributed via smart contracts and can be claimed immediately after completing the assigned tasks.",
    },
    {
      question: "Where do I get help?",
      answer:
        "Visit our Discord server and tag our moderators. If issues persist, kindly open a ticket.",
    },
    {
      question: "Where do I follow updates?",
      answer:
        <p className="text-gray-400 text-sm">
  • X: @NexuraXYZ
  <br />
  • Discord: link in X bio
  <br />
  • Website:{" "}
  <a
    href="https://nexura.intuition.box"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#8B3EFE] underline"
  >
    nexura.intuition.box
  </a>
</p>
    },
    {
      question: "How do I suggest features?",
      answer:
        "Use the feature request channel on Discord.",
    },
  ];

  return (
    <div id="frequently-asked-questions docs-top" className="flex flex-col items-start gap-3 w-full">
      {faqs.map((faq, index) => (
        <FAQItem key={index} {...faq} />
      ))}
      <div className="mt-10 w-full flex justify-between">

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
        Architectural Layer
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
        Legal
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

export default FAQ;