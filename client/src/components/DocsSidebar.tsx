import { useState } from "react";
import AnimatedBackground from "./AnimatedBackground";

const DocsSidebar = ({ active, setActive }: any) => {
  const itemBaseStyle = {
    clipPath:
      "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
  };

  const renderItem = (id: string, text: string, icon: string) => {
  const isActive = active === id;

  return (
    <li key={id} className="cursor-pointer" onClick={() => setActive(id)}>
      <div className="flex items-center relative">
        <div
          className="flex items-center gap-2 px-3 py-2 border w-full relative"
          style={{
            ...itemBaseStyle,
            background: isActive ? "#8B5CF633" : "#FFFFFF0D",
            borderColor: "#8B5CF633",
          }}
        >
{/* Center-right vertical stick */}
{isActive && (
  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-[3px] h-5 bg-[#8B3EFE]" />
)}

          <span className="w-5 h-5">
            <img
              src={`/${icon}`}
              alt=""
              className={`w-full h-full object-contain ${
                isActive ? "opacity-100" : "opacity-70"
              }`}
            />
          </span>

          <span className={isActive ? "text-white" : "text-gray-300"}>
            {text}
          </span>
        </div>
      </div>
    </li>
  );
};

  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <AnimatedBackground />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Sidebar */}
      <aside className="relative z-20 w-64 text-white p-4 overflow-y-auto sticky top-0">
        {/* INTRODUCTION */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            <h2 className="text-purple-500 font-semibold text-sm">
              INTRODUCTION
            </h2>
          </div>

          <ul className="ml-2 space-y-3 text-sm">
            {renderItem("what-is", "What is Nexura?", "lightning.png")}
            {renderItem("why", "Why Nexura Exists", "idea.png")}
            {renderItem("guide", "User Guide", "user-guide.png")}
          </ul>
        </div>

        {/* CORE CONCEPTS */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            <h2 className="text-purple-500 font-semibold text-sm">
              CORE CONCEPTS
            </h2>
          </div>

          <ul className="ml-2 space-y-3 text-sm">
            {renderItem("features", "Key Features", "world-cut.png")}
            {renderItem("nexon", "Nexon System", "nexon-system.png")}
          </ul>
        </div>

        {/* BUILDER INTERACTION */}
        <div>
          <div className="flex items-center mb-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            <h2 className="text-purple-500 font-semibold text-sm">
              BUILDER INTERACTION
            </h2>
          </div>

          <ul className="ml-2 space-y-3 text-sm">
            {renderItem("builder", "Builder Guide", "lightning.png")}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default DocsSidebar;