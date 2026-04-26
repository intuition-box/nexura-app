import { useEffect } from "react";

const KeyFeatures = ({ onNext, onPrev, setSections }: any) => {

  return (
    <div id="key-features">
      {/* Intro */}
      <p className="text-gray-400 text-sm max-w-[59rem]">
        Nexura is built around a set of interconnected features that work together to create a complete engagement experience for users and builders in the Intuition ecosystem. Each feature serves a specific purpose, but none of them exist in isolation. The way you learn connects to the way you explore. The way you explore connects to the quests you take on. The quests, lessons, and campaigns you complete feed into your reputation, your leaderboard position, and your rewards. Everything is designed to flow together.
        <br /><br />
        The following sections break down each feature available on Nexura, what it does, how to use it, and why it matters for your journey inside the ecosystem. Whether you are just getting started or have been active for a while, understanding what each part of the platform offers will help you get the most out of your time.
        <br /><br />
        The features are organised as they appear on the Nexura sidebar:
      </p>

      {/* Features List */}
      <div id="features-list" className="mt-8">
        <ul className="space-y-2 text-gray-400 text-sm list-none">

          {[
            "Learn",
            "Explore",
            "Referrals",
            "Quests",
            "Campaigns",
            "Leaderboard",
            "Portal Claims",
            "Analytics",
            "Nexura Studio"
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-[#8B3EFE]">•</span>
              <span>{feature}</span>
            </li>
          ))}

        </ul>
      </div>

      {/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Learn */}
<div id="learn" className="mt-8 flex gap-8 items-center max-w-[59rem]">

  {/* Text */}
  <div className="flex-1">
    <div className="flex items-center gap-2">
      <span className="text-[#8B3EFE]">•</span>
      <h3
        className="text-xl font-semibold"
        style={{
          background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Learn
      </h3>
    </div>

    <p className="text-gray-400 text-sm mt-4">
      The Learn tab is a Nexura built-in education hub that helps you understand how things work, and it was built because it is believed that contribution is most meaningful when it comes from understanding. Every lesson in the Learn tab earns you XP, which is a form of reward given for learning. To access Learn, click on the Learn tab in your Nexura sidebar and start with the first available lesson.
    </p>

    <div className="mt-4 text-gray-400 text-sm">
      <p>What you will find on Learn:</p>

      <ul className="mt-3 space-y-2 list-none">
        {[
          "Web3 fundamentals",
          "Blockchain and what it entails",
          "NFTs, DeFi, and smart contracts",
          "An explanation of how Intuition works",
          "An introduction to Nexura and how to make the most of the platform",
          "Available content related to other projects",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-[#8B3EFE]">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* Image */}
  <div className="flex-1 flex justify-center items-center">
    <img
      src="/learn-icon.png"
      alt="Learn"
      className="w-full max-w-[20rem]"
    />
  </div>
</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Explore */}
<div id="explore" className="mt-8 flex gap-8 items-center max-w-[59rem]">

  {/* Text */}
  <div className="flex-1">
    <div className="flex items-center gap-3">
      <span className="text-[#8B3EFE]">•</span>

      <h3
        className="text-xl font-semibold"
        style={{
          background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Explore
      </h3>
    </div>

    <p className="text-gray-400 text-sm mt-4">
      This is the Nexura homepage, your starting point on the platform where you can discover active campaigns, featured projects, and get a quick sense of where to begin. Instead of searching, you can simply open Explore on the sidebar of the Nexura dashboard and see what’s active and the trending dApps.
    </p>

    <div className="mt-4 text-gray-400 text-sm">
      <p>What you can see on Explore:</p>

      <ul className="mt-3 space-y-2 list-none">
        {[
          "Discover active projects and campaigns",
          "Stay updated without searching multiple places",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-[#8B3EFE]">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>

  {/* Image */}
  <div className="flex-1 flex justify-center items-center">
    <img
      src="/exploree.png"
      alt="Explore"
      className="w-full max-w-[20rem]"
    />
  </div>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Referrals */}
<div id="referrals" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Referrals
    </h3>
  </div>

  {/* Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    The Referrals tab is Nexura’s way of helping the ecosystem grow through its community. It allows users to invite others, track everything in one place, and earn rewards for bringing in active users.
    <br /><br />
    Each user receives a unique referral link that can be shared with anyone. When someone joins through the link, they appear in the dashboard as either an active or inactive user. To be considered active, the user must complete a quest or campaign.
  </p>

  {/* List */}
  <div className="mt-4 text-gray-400 text-sm">
    <p>What you can see in the Referrals tab:</p>

    <ul className="mt-3 space-y-2 list-none">
      {[
        "Your personal referral link",
        "A list of people you’ve invited",
        "Active referrals: users who joined and are participating",
        "Inactive referrals: users who have not completed quests or campaigns",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Closing Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    This makes referrals more meaningful. It is not just about how many people you invite, but how many actually get involved and contribute. To encourage growth, Nexura rewards users who bring in active participants.
  </p>

  {/* Image BELOW */}
  <div className="mt-6 flex justify-center">
    <img
      src="/referrals-image.png"
      alt="Referrals"
      className="w-full "
    />
  </div>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Quests */}
<div id="quests" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Quests
    </h3>
  </div>

  {/* Paragraph (FULL WIDTH) */}
  <p className="text-gray-400 text-sm mt-4">
    A quest is a defined activity on Nexura that users can discover and complete. It is one of the primary ways users engage, earn XP, and build their participation record.
    <br /><br />
    A user might start by exploring a project, then progress to testing a feature, verifying a claim, completing a social task, or interacting on-chain. Quests are also how new users get properly oriented within the ecosystem, providing context, purpose, and a sense of progress from the very first interaction. Experienced users can also create their own quests for others to participate in. Every quest completed contributes to XP, Nexon progression, and reputation.
  </p>

  {/* Steps + Image */}
  <div className="mt-6 flex gap-8 items-start">

    {/* Steps */}
    <div className="flex-[1.5] text-gray-400 text-sm">
      <p>How to complete a quest:</p>

      <ul className="mt-3 space-y-2 list-none">
        {[
          "Open the Quests tab from your sidebar",
          "Select a quest and read the instructions carefully",
          "Complete the required tasks",
          "Submit or verify your completion",
          "Create your Proof of Action and receive your XP reward automatically once verified",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-[#8B3EFE]">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Image (ONLY beside steps) */}
    <div className="flex-1 flex justify-center mt-4">
      <img
        src="/quest-image.png"
        alt="Quests"
        className="w-full max-w-[18rem]"
      />
    </div>

  </div>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Campaigns */}
<div id="campaigns" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Campaigns
    </h3>
  </div>

  {/* Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    Campaigns are how projects and builders on Nexura create structured engagement experiences for their communities. While quests are individual tasks, campaigns are collections of tasks and interaction checkpoints organized around a specific goal, whether that is onboarding new users, guiding users through a product in a structured and measurable way, testing a product feature, or gathering feedback.
    <br /><br />
    Campaigns on Nexura are flexible by design. Builders can choose to reward participation with TRUST tokens, XP, or both. The structure is entirely up to the builder, which means every campaign on Nexura is shaped by what the project actually needs rather than what a generic template allows.
    <br /><br />
    For users, campaigns are an opportunity to go deeper with a specific project. Instead of a single isolated action, a campaign guides users through a deliberate sequence of interactions that build their understanding of a project while rewarding their participation.
  </p>

  {/* Users Section */}
  <div className="mt-8">
    <div className="flex items-center gap-3">
      <div className="w-[4px] h-[24px] bg-[#8B3EFE]" />

      <h3 className="text-[#8B3EFE] text-sm font-medium">
        What users can do in Campaigns
      </h3>

      <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
    </div>

    <ul className="mt-4 space-y-2 text-gray-400 text-sm list-none">
      {[
        "Browse all active campaigns within Nexura.",
        "Join a campaign and follow its structured sequence of tasks.",
        "Earn XP or TRUST rewards for completing campaigns.",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>

    {/* Image BELOW */}
  <div className="mt-6 flex justify-start">
    <img
      src="/campaign-imagee.png"
      alt="Campaigns"
      className="w-full max-w-[28rem]"
    />
  </div>

  {/* Builders Section */}
  <div className="mt-8">
    <div className="flex items-center gap-3">
      <div className="w-[4px] h-[24px] bg-[#8B3EFE]" />

      <h3 className="text-[#8B3EFE] text-sm font-medium">
        What builders can do in Campaigns
      </h3>

      <div className="flex-1 h-[1px] bg-[#FFFFFF33]" />
    </div>

    <ul className="mt-4 space-y-2 text-gray-400 text-sm list-none">
      {[
        "Design multi-task campaigns with defined goals and eligibility requirements.",
        "Set automated rewards (optional).",
        "Collect feedback from users as part of a campaign flow.",
        "Onboard users.",
        "Engage their community with intention.",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Ecosystem Dapps */}
<div id="ecosystem-dapps" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Ecosystem Dapps
    </h3>
  </div>

  {/* Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    Ecosystem Dapps is a nexus that aggregates everything being built within the Intuition ecosystem, and helps people orient themselves quickly.
  </p>

  {/* What it offers */}
  <div className="mt-6">
    <p className="text-gray-400 text-sm">What Ecosystem Dapps offers:</p>

    <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
      {[
        "All active projects and applications in the Intuition ecosystem.",
        "Short descriptions of each project so users can understand its purpose before engaging.",
        "A constantly updated view of the ecosystem as new projects come online.",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Closing line */}
  <p className="text-gray-400 text-sm mt-6">
    <span className="font-medium text-white">For Builders</span>, being listed in Nexura’s Ecosystem Dapps means visibility in front of an already curious user base. For users, it means never having to wonder what is being built in the ecosystem.
  </p>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Leaderboard */}
<div id="leaderboard" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Leaderboard
    </h3>
  </div>

  {/* Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    The Leaderboard is Nexura’s ranking system. It turns participation into something visible, allowing users to track their progress and see their rank. The leaderboard breaks down how a user’s XP has been accumulated across four categories: Events, Quests, Campaigns, and Lessons. This gives a full picture of how active and well-rounded participation has been on Nexura.
  </p>

  {/* XP Breakdown */}
  <div className="mt-6">
    <p className="text-gray-400 text-sm">How XP is tracked:</p>

    <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
      {[
        { label: "Events", text: "XP from joining ecosystem events" },
        { label: "Quests", text: "XP from completing tasks on the platform" },
        { label: "Campaigns", text: "XP from participating in project campaigns" },
        { label: "Lessons", text: "XP from learning on the Learn hub" },
      ].map((item) => (
        <li key={item.label} className="flex items-start gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>
            <span className="font-medium text-white">
              {item.label}:
            </span>{" "}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  </div>

  {/* Image (LEFT aligned under content) */}
  <div className="mt-6 flex justify-start">
    <img
      src="/leaderboard-imagee.png"
      alt="Leaderboard"
      className="w-full max-w-[28rem]"
    />
  </div>

  {/* Closing */}
  <p className="text-gray-400 text-sm mt-6">
    This makes it easy to see how users are contributing. Users can also see their current rank at the top of the page, which means even if they are not in the Top 500, they can still know their current position.
  </p>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Portal Claims */}
<div id="portal-claims" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Portal Claims
    </h3>
  </div>

  {/* Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    Portal Claims brings Intuition staking features directly into Nexura, allowing users to stake on claims without leaving the platform. Staking on a claim signifies belief in the relevance of the respective triple and enhances its discoverability in the Intuition system. The more people stake on a claim, the stronger and more trusted it becomes in the Knowledge Graph. Nexura simply brings this functionality into the platform so that the entire experience, from discovery to exploration to staking conviction, happens in one place without unnecessary interruptions.
  </p>

</div>

{/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

{/* Analytics */}
<div id="analytics" className="mt-8 max-w-[59rem]">

  {/* Title */}
  <div className="flex items-center gap-3">
    <span className="text-[#8B3EFE]">•</span>

    <h3
      className="text-xl font-semibold"
      style={{
        background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Analytics
    </h3>
  </div>

  {/* Paragraph */}
  <p className="text-gray-400 text-sm mt-4">
    The Analytics dashboard is Nexura’s platform-wide engagement measurement tool. It provides a transparent, data-driven view of how Nexura is growing and how users are participating.
    <br /><br />
    Unlike the Leaderboard, which focuses on individual user rankings, Analytics zooms out to give a holistic picture of Nexura as a whole. It is useful for researchers, analysts, builders, and any user who wants to understand the momentum of the ecosystem.
  </p>

  {/* Metrics */}
  <div className="mt-6">
    <p className="text-gray-400 text-sm">What the Analytics dashboard tracks:</p>

    <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
      {[
        "Total users on Nexura",
        "Active and new users across multiple timeframes, including 24 hours, 7 days, 30 days, and all time",
        "Total transactions",
        "Total lessons created",
        "Total TRUST distributed",
        "Total claims created using Nexura’s Proof of Action",
        "Other user engagement metrics covering the breadth and depth of participation within Nexura",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#8B3EFE]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>

</div>

      {/* Divider */}
<div className="mt-8 h-[1px] bg-[#FFFFFF33] max-w-[59rem]" />

    <div id="nexura-studio" className="max-w-[59rem]">

      {/* Divider */}
      <div className="h-[1px] bg-[#FFFFFF33] mb-8" />

      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="text-[#8B3EFE]">•</span>

        <h3
          className="text-xl font-semibold"
          style={{
            background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Nexura Studio
        </h3>
      </div>

      {/* Intro */}
      <p className="text-gray-400 text-sm mt-4">
        Nexura Studio is a tool for projects and users on Intuition. It is built for projects that want to engage their communities with intention. Experienced users who are familiar with the ecosystem can also guide other users through meaningful quests.
      </p>

      {/* Guide Heading */}
      <h3 className="text-[#8B3EFE] text-lg font-medium mt-8">
        Nexura Studio Guide
      </h3>

      {/* Builder Guide */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-white">
          Builders Guide
        </h3>

        <p className="text-gray-400 text-sm mt-3">
          This guide is designed to walk builders through how to set up Nexura Studio, launch campaigns, and start growing an engaged community around their product.
        </p>
      </div>

      {/* Step 1 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 1: Head to Nexura Studio
        </h3>
        <p className="text-gray-400 text-sm mt-2">
          Navigate to the Nexura Studio tab and click “Enter Studio.”
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 2: Create Your Project Profile
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          When you first enter Nexura Studio, you will be prompted to set up your project. This includes:
        </p>

        <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
          <li><span className="text-[#8B3EFE]">•</span> Creating your project login credentials as the super admin.</li>
          <li><span className="text-[#8B3EFE]">•</span> <span className="font-medium text-white">Add Details:</span> Write your project name, upload your project logo, your project links, and write a compelling description. This description will appear on your project profile page.
</li>
          <li><span className="text-[#8B3EFE]">•</span> <span className="font-medium text-white">Connect Discord:</span> Linking your official Discord server to Nexura Studio is optional. However, to enable auto validation of Discord tasks, you must connect your Discord and add the Nexura Guide Bot and grant it admin permission. Nexura does not have access to or control over your server. The bot is used only to validate tasks and requires these permissions, just like other Discord bots.</li>
          <li><span className="text-[#8B3EFE]">•</span> Your project’s description, website link, documentation, X (formerly Twitter), and Discord server will be visible to all when you publish your campaign.</li>
        </ul>
      </div>

      {/* Step 3 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 3: Add Other Admins
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Nexura Studio allows you to add more admins so that multiple people can manage your project without friction. The creator of the hub is automatically a super admin. Only a super admin can send invites to other admins via email. You can choose to invite either an admin or a super admin.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Admins can validate tasks (approve or reject submissions) and view project settings. They do not have the right to edit project settings, invite other admins, or publish campaigns. Super admins, on the other hand, publish campaigns, manage campaigns, and control project settings.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          To add an admin or super admin, navigate to the Admin Management tab and click “Add Admin.” Enter the user’s email and select whether to assign admin or super admin privileges.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          An invitation email will be automatically sent to the user to sign up as either an admin or a super admin. You also have the right to remove admins if they are relieved of their duties or to promote an admin to a super admin.
        </p>
      </div>

      {/* Step 4 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 4: Build Your First Campaign
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Once your project is set up, you are ready to create your first campaign. Head to the Campaigns section inside Nexura Studio and click Create New Campaign.
        </p>

        <p className="text-gray-400 text-sm mt-3">When building a campaign, you will define:</p>

        <ul className="mt-2 space-y-2 text-gray-400 text-sm list-none">
          <li><span className="text-[#8B3EFE]">•</span> <span className="font-medium text-white">Campaign Details: </span>Give your campaign a name, description, and cover image. Be clear about what the campaign is about and what you want users to do. The more context you provide upfront, the better your participation quality will be.</li>
          <li><span className="text-[#8B3EFE]">•</span> <span className="font-medium text-white">Assign Tasks: </span>The specific actions you want users to complete as part of your campaign.</li>
          <li><span className="text-[#8B3EFE]">•</span> <span className="font-medium text-white">Tasks can include: </span>Social tasks such as following your X (formally Twitter) account, creating a post, engaging with a post, joining your Discord server, on-chain tasks involving interactions with your product, the Intuition Knowledge Graph, or feedback tasks where users share their thoughts on a specific feature or experience.</li>
        </ul>

        {/* Validation Rules */}
        <h4 className="text-white font-medium mt-6">Validation Rules:</h4>

        <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
          <li><span className="text-[#8B3EFE]">•</span>  Discord tasks are validated through Discord OAuth.</li>
          <li><span className="text-[#8B3EFE]">•</span> X tasks are reviewed and approved manually through your Admin Dashboard.</li>
          <li><span className="text-[#8B3EFE]">•</span> Portal claim tasks are validated automatically.</li>
          <li><span className="text-[#8B3EFE]">•</span> Feedback tasks are reviewed and approved manually through your Admin Dashboard.</li>
        </ul>

        <p className="text-gray-400 text-sm mt-4">
          On Nexura, tasks that involve interacting with your product are manually validated from your dashboard. You can choose what users are required to submit, such as a transaction hash, screenshot, username, or use Auto Click. Note that once a user clicks an Auto Click task, it is automatically validated whether the task was completed or not, so this option should be used carefully.
        </p>
        <p className="text-gray-400 text-sm mt-4">
          
If you want to automate validation for your product tasks, you can reach out to the Nexura team by creating a ticket on Discord.
        </p>
      </div>

      {/* Rewards */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">Rewards</h3>

        <p className="text-gray-400 text-sm mt-2">
          Rewards define how participation is incentivized. You can choose to distribute either TRUST tokens (optional), XP, or both. You can also set a cap on how many users will be rewarded, giving you full control over your engagement budget and campaign competitiveness.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          If you choose to distribute TRUST rewards, you will need to define the reward pool, the number of users to be rewarded, and the amount each participant can claim. Nexura sets a minimum of 1 TRUST per user, though you may allocate a higher amount if preferred.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Once configured, an automated reward smart contract will use these parameters, so ensure all values are entered correctly. Before publishing your campaign, click the deploy contract button. Please note that your wallet must hold sufficient funds equal to or greater than the total reward pool, as this amount will be automatically deducted to create and fund the reward smart contract.
        </p>
      </div>

      {/* Step 5 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 5: Publish Your Campaign
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          Once you have assigned your campaign tasks and reviewed your campaign, publish it to make it live on Nexura. There is also an activation fee of 1,000 TRUST required to publish a campaign. 
        </p>

        <p className="text-gray-400 text-sm mt-2">
          This helps prevent abuse of the XP system by discouraging users from creating campaigns, and supports the continued operation of the Nexura platform. You can edit your campaign at any time, add more tasks, or adjust your reward pool. No additional fees are charged for making these changes. The campaign will go live based on the time you set after publishing it. It will appear as either an upcoming or active campaign, depending on whether you choose to make it live immediately or at a later time. From the moment it goes live, users can discover it through the Explore and Campaigns tabs.
        </p>
      </div>

      {/* Step 6 */}
      <div className="mt-8">
        <h3 className="text-[#8B3EFE] font-medium">
          Step 6: Monitor and Optimize
        </h3>

        <p className="text-gray-400 text-sm mt-2">
         After your campaign goes live, use the Admin Dashboard in Nexura Studio to validate your X (formerly Twitter) and product tasks.
        </p>
      </div>

      {/* Tips */}
      <div className="mt-10">
        <h3 className="text-[#8B3EFE] font-medium">
          Tips for Running Effective Campaigns
        </h3>

        <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
          <li><span className="text-[#8B3EFE]">•</span> Be specific with your tasks. Vague instructions lead to low-quality completions. The clearer and more actionable each task is, the better the participation you will get.</li>

          <li><span className="text-[#8B3EFE]">•</span> Match your rewards to the effort. Users are more likely to complete complex, multi-step campaigns when the reward reflects the time and energy required. Be fair and generous with your incentives.</li>

          <li><span className="text-[#8B3EFE]">•</span> Use feedback tasks intentionally. If you want honest feedback, ask specific questions rather than open-ended ones. Specific questions produce specific answers that are far more useful for your product decisions.</li>

          <li><span className="text-[#8B3EFE]">•</span> Communicate with your community. Let your community know when a campaign is live through your own channels. The more visibility a campaign gets outside of Nexura, the more participation it will attract inside it.</li>

          <li><span className="text-[#8B3EFE]">•</span> Be active. Ensure you check your Admin Dashboard at least twice a day to validate tasks.</li>
        </ul>
      </div>

      {/* Support */}
      <div className="mt-10">
        <h3 className="text-[#8B3EFE] font-medium">
          Getting Support
        </h3>

        <p className="text-gray-400 text-sm mt-2">
        If you need help setting up your project, building a campaign, or troubleshooting anything inside Nexura Studio, the Nexura team is available to help.
        </p>

        <ul className="mt-3 space-y-2 text-gray-400 text-sm list-none">
          <li><span className="text-[#8B3EFE]">•</span> Join the official Nexura Discord and open a support ticket
</li>
          <li><span className="text-[#8B3EFE]">•</span> Browse the Nexura documentation for answers to common questions</li>
        </ul>
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
              Introduction
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
              Getting Started on Nexura
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