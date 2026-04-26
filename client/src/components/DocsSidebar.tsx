import { useState } from "react";
import AnimatedBackground from "./AnimatedBackground";

const DocsSidebar = ({ active, setActive }: any) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderItem = (id: string, text: string) => {
    const isActive = active === id;

    return (
      <li
        key={id}
        className={`cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-[#8B3EFE]  ${
  isActive
    ? "bg-[[#8B3EFE] ] text-white"
    : "text-gray-300 hover:text-white hover:bg-white/5"
}`}
        onClick={() => {
          setActive(id);
          setMobileOpen(false);
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isActive ? "#8B3EFE" : "#8C78D21F",
          }}
        />
        <span className="text-gray-300">{text}</span>
      </li>
    );
  };

  const Header = ({
    title,
    id,
    hasDropdown = true,
  }: {
    title: string;
    id?: string;
    hasDropdown?: boolean;
  }) => {
    const isOpen = openSection === id;

    return (
      <div
        className="flex items-center justify-between cursor-pointer text-[#8B3EFE] "
        onClick={() => {
          if (!hasDropdown) return;
          setOpenSection(isOpen ? null : id || null);
        }}
      >
        <h2
          style={{
            color: "[#8B3EFE] ",
            fontWeight: 700,
            fontSize: "13.08px",
            lineHeight: "22.23px",
            letterSpacing: "1.83px",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>

        {hasDropdown && (
          <img
            src="/dropdown.png"
            className={`w-3 h-2 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
    );
  };

  const Dropdown = ({ id, children }: any) => {
    const isOpen = openSection === id;

    return (
      <div
        className={`ml-2 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div
          className={`space-y-2 text-sm transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    );
  };

  const SidebarContent = () => (
    <aside className="relative w-64 h-screen text-[#00E1A2] p-4 overflow-y-auto sticky top-0 overflow-hidden">

  {/* Background layer */}
  <div className="absolute inset-0 z-0">
    <AnimatedBackground />
  </div>

  {/* Dark overlay for readability */}
  <div className="absolute inset-0 z-10" />

  {/* Sidebar content */}
  <div className="relative z-20 text-[#00E1A2]">
    {/* SEARCH */}
    <div className="mb-6">
      <div
        className="flex items-center justify-between px-3 py-2 rounded-md"
        style={{
          backgroundColor: "#14141F",
          border: "1px solid #8C78D21F",
        }}
      >
        <div className="flex items-center gap-2 w-full">
          <img src="/search.png" className="w-4 h-4 opacity-70" />
          <input
            placeholder="Search docs"
            className="bg-transparent outline-none text-sm text-gray-300 w-full"
          />
        </div>
        <img src="/scan.png" className="w-4 h-4 opacity-70" />
      </div>
    </div>

      {/* SECTIONS */}
      <div className="mb-6 text-[#00E1A2]">
        <Header title="INTRODUCTION" id="intro" />
        <Dropdown id="intro">
          {renderItem("introduction", "Introduction")}
        </Dropdown>
      </div>

      <div className="mb-6">
        <Header title="CORE CONCEPTS" id="core" />
        <Dropdown id="core">
          {renderItem("features", "Key Features")}
        </Dropdown>
      </div>

      <div className="mb-6">
        <Header title="USING NEXURA" id="using" />
        <Dropdown id="using">
          {renderItem("gettingstarted", "Getting Started")}
          {renderItem("nexonsystem", "The Nexon System")}
        </Dropdown>
      </div>

      <div className="mb-6">
        <Header title="TECHNICAL OVERVIEW" id="technical" />
        <Dropdown id="technical">
          {renderItem("technicaloverview", "Technical Overview")}
          {renderItem("architecturallayer", "Architectural Layer")}
        </Dropdown>
      </div>

      <div onClick={() => setActive("faqs")} className="cursor-pointer mb-4">
        <Header title="FAQs" hasDropdown={false} />
      </div>

      <div onClick={() => setActive("legal")} className="cursor-pointer">
        <Header title="LEGAL" hasDropdown={false} />
      </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
  onClick={() => setMobileOpen((prev) => !prev)}
  className="lg:hidden fixed top-6 left-4 z-50 px-3 py-2 bg-[#14141F] border border-[#8C78D21F] rounded-md flex items-center justify-center text-[#00E1A2]"
>
  {/* Hamburger icon */}
  <div className="relative w-5 h-4">
    <span
      className={`absolute left-0 w-5 h-[2px] bg-white transition-all duration-300 ${
        mobileOpen ? "rotate-45 top-1.5" : "top-0"
      }`}
    />
    <span
      className={`absolute left-0 w-5 h-[2px] bg-white transition-all duration-300 top-1.5 ${
        mobileOpen ? "opacity-0" : "opacity-100"
      }`}
    />
    <span
      className={`absolute left-0 w-5 h-[2px] bg-white transition-all duration-300 ${
        mobileOpen ? "-rotate-45 top-1.5" : "top-3"
      }`}
    />
  </div>
</button>

      {/* DESKTOP SIDEBAR (UNCHANGED) */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* MOBILE SIDEBAR (SEPARATE INSTANCE) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#0B0B12]">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default DocsSidebar;