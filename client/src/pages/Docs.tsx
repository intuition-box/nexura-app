import { useState } from "react";
import DocsSidebar from "../components/DocsSidebar";
import DocsHeader from "../components/DocsHeader";
import WhatIsNexura from "../components/docs/content/WhatIsNexura";
import WhyNexuraExists from "../components/docs/content/WhyNexuraExists";
import UserGuide from "../components/docs/content/UserGuide";
import KeyFeatures from "../components/docs/content/KeyFeatures";
import NexonSystem from "../components/docs/content/NexonSystem";
import BuilderGuide from "../components/docs/content/BuilderGuide";

const docsContentMap = {
  "what-is": WhatIsNexura,
  why: WhyNexuraExists,
  guide: UserGuide,
  features: KeyFeatures,
  nexon: NexonSystem,
  builder: BuilderGuide,
};



const docsMap = {
  "what-is": {
    topic: "INTRODUCTION",
    subtopic: "What is Nexura?",
  },
  "why": {
    topic: "INTRODUCTION",
    subtopic: "Why Nexura Exists",
  },
  "guide": {
    topic: "INTRODUCTION",
    subtopic: "User Guide",
  },
  "features": {
    topic: "CORE CONCEPTS",
    subtopic: "Key Features",
  },
  "nexon": {
    topic: "CORE CONCEPTS",
    subtopic: "Nexon System",
  },
  "builder": {
    topic: "BUILDER INTERACTION",
    subtopic: "Builder Guide",
  },
};

const Docs = () => {
  const [active, setActive] = useState("what-is");
  const [sections, setSections] = useState([]);

  const current = docsMap[active];
  const ActiveContent = docsContentMap[active];

  const docsOrder = [
  "what-is",
  "why",
  "guide",
  "features",
  "nexon",
  "builder",
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
      <DocsSidebar active={active} setActive={setActive} />

      <div className="flex-1 p-6 text-white">
        {/* Header */}
<DocsHeader topic={current.topic} sections={sections} />

{/* Content */}
<div>
  {/* Main Heading */}
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

{/* Dynamic Content */}
  <ActiveContent
  onNext={handleNext}
  onPrev={handlePrev}
  setSections={setSections}
/>
</div>
      </div>
    </div>
  );
};

export default Docs;