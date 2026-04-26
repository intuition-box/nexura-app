import { useState } from "react";
import DocsSidebar from "../components/DocsSidebar";
import DocsHeader from "../components/DocsHeader";
import Introduction from "../components/docs/content/Introduction";
import KeyFeatures from "../components/docs/content/KeyFeatures";
import NexonSystem from "../components/docs/content/TheNexonSystem";
import GettingStarted from "../components/docs/content/GettingStartedOnNexura";
import TechnicalOverview from "../components/docs/content/TechnicalOverview";
import ArchitecturalLayer from "../components/docs/content/ArchitecturalLayer";
import FAQs from "../components/docs/content/FAQs";
import Legal from "../components/docs/content/Legal";
import OnThisPage from "../components/docs/content/OnThisPage";

const docsContentMap = {
  introduction: Introduction,
  features: KeyFeatures,
  gettingstarted: GettingStarted,
  nexonsystem: NexonSystem,
  technicaloverview: TechnicalOverview,
  architecturallayer: ArchitecturalLayer,
  faqs: FAQs,
  legal: Legal,
};

const docsMap = {
  introduction: {
    topic: "INTRODUCTION",
    subtopic: "Introduction",
  },
  features: {
    topic: "CORE CONCEPTS",
    subtopic: "Key Features",
  },
  gettingstarted: {
    topic: "USING NEXURA",
    subtopic: "Getting Started",
  },
  nexonsystem: {
    topic: "USING NEXURA",
    subtopic: "The Nexon System",
  },
  technicaloverview: {
    topic: "TECHNICAL OVERVIEW",
    subtopic: "Nexura Technical Overview",
  },
  architecturallayer: {
    topic: "TECHNICAL OVERVIEW",
    subtopic: "Architectural Layer",
  },

  faqs: {
    topic: "SUPPORT",
    subtopic: "Frequently Asked Questions",
  },
  legal: {
    topic: "LEGAL",
    subtopic: "Terms, Policies and Disclaimer",
  },
};

const docsSectionsMap = {
  introduction: [
    { id: "introduction", title: "Introduction", level: 1 },
    { id: "the-problem", title: "The Problem", level: 3 },
    { id: "the-solution", title: "The Solution", level: 3 },
    { id: "what-is-nexura", title: "What is Nexura?", level: 1 },
    { id: "the-vision", title: "The Vision", level: 3 },
    { id: "built-on", title: "What Nexura is Built On", level: 2 },
    { id: "who-serves", title: "Who Nexura Serves", level: 2 },
  ],
  features: [
  { id: "key-features", title: "Key Features", level: 1 },

  { id: "learn", title: "Learn", level: 3 },
  { id: "explore", title: "Explore", level: 3 },
  { id: "referrals", title: "Referrals", level: 3 },
  { id: "quests", title: "Quests", level: 3 },
  { id: "campaigns", title: "Campaigns", level: 3 },
  { id: "ecosystem-dapps", title: "Ecosystem Dapps", level: 3 },
  { id: "leaderboard", title: "Leaderboard", level: 3 },
  { id: "portal-claims", title: "Portal Claims", level: 3 },
  { id: "analytics", title: "Analytics", level: 3 },
  { id: "nexura-studio", title: "Nexura Studio", level: 1 },
],
  gettingstarted: [
  { id: "getting-started", title: "Getting Started", level: 1 },
  { id: "rewards", title: "Rewards", level: 1 },
  { id: "what-is-xp", title: "What is XP?", level: 3 },
],
  nexonsystem: [
  { id: "what-is-a-nexon", title: "What is a Nexon?", level: 1 },
  { id: "the-path-of-the-nexon", title: "The Path of the Nexon", level: 1 },
  { id: "nexon-progression-model", title: "Nexon Progression Model", level: 1 },
],
  technicaloverview: [
  { id: "nexura-technical-overview", title: "Nexura Technical Overview", level: 1 },

  { id: "stack-at-a-glance", title: "Stack at a Glance", level: 3 },
],
  architecturallayer: [
  { id: "architectural-layer", title: "Architectural Layer", level: 1 },

  { id: "best-practices-for-users", title: "Best Practices for Users", level: 3 },
  { id: "best-practices-for-builders", title: "Best Practices for Builders", level: 3 },
],
  faqs: [
  { id: "frequently-asked-questions", title: "Frequently Asked Questions", level: 1 },
],
  legal: [
  { id: "legal", title: "Terms, Policies and Disclaimer", level: 1 },

  { id: "terms-of-use", title: "Terms of Use", level: 3 },
  { id: "changes-to-terms", title: "Changes to Terms", level: 3 },
],
};

const Docs = () => {
  const [active, setActive] = useState("introduction");
  const sections = docsSectionsMap[active] || [];

  const current = docsMap[active];
  const ActiveContent = docsContentMap[active];

  const docsOrder = [
  "introduction",
  "features",
  "gettingstarted",
  "nexonsystem",
  "technicaloverview",
  "architecturallayer",
  "faqs",
  "legal"
];

const currentIndex = docsOrder.indexOf(active);

const handleNext = () => {
  if (currentIndex < docsOrder.length - 1) {
    setActive(docsOrder[currentIndex + 1]);
  }
};

const handlePrev = () => {
  if (currentIndex > 0) {
    setActive(docsOrder[currentIndex - 1]);
  }
};

  return (
    <div className="flex">
  {/* Sidebar */}
  <DocsSidebar active={active} setActive={setActive} />

  {/* Main Content */}
  <div className="flex-1 flex justify-center">
    <div className="w-full max-w-[59rem] p-6 text-white">
      <DocsHeader topic={current.topic} sections={sections} />

      <h1
        className="text-3xl font-bold mb-4"
        style={{
          background: "linear-gradient(90deg, #FFFFFF, #C287FC)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {current.subtopic}
      </h1>

      <ActiveContent
  onNext={handleNext}
  onPrev={handlePrev}
/>
    </div>


  {/* Right Side - On This Page */}
  {/* <div className="hidden lg:block w-[16rem] px-4"> */}
  <div className="w-[14rem] sticky top-0 h-fit self-start -ml-4">
    <OnThisPage sections={sections} />
  </div>
</div>
    </div>
  );
};

export default Docs;