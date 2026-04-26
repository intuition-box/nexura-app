import { useEffect, useState } from "react";

const OnThisPage = ({ sections = [] }: any) => {
  const [activeId, setActiveId] = useState<string>("");

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

useEffect(() => {
  if (!sections.length) return;

  let ticking = false;

  const handleScrollSpy = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const triggerPoint = window.innerHeight * 0.3; // active zone

      let newActive = "";

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();

        // section is in active zone
        if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
          newActive = section.id;
          break;
        }
      }

      if (newActive) {
        setActiveId(newActive);
      }

      ticking = false;
    });
  };

  window.addEventListener("scroll", handleScrollSpy, { passive: true });
  handleScrollSpy();

  return () => window.removeEventListener("scroll", handleScrollSpy);
}, [sections]);

  if (!sections.length) return null;

  // 🔥 GROUP SECTIONS (level 1 + level 3 children)
  const grouped = [];
  let currentGroup: any = null;

  sections.forEach((section: any) => {
    if (section.level !== 3) {
      currentGroup = { parent: section, children: [] };
      grouped.push(currentGroup);
    } else {
      if (currentGroup) {
        currentGroup.children.push(section);
      }
    }
  });

  return (
    <div className="w-[14rem] sticky top-20 h-fit">
      <h3 className="text-xs text-gray-500 mb-3 tracking-wide">
        ON THIS PAGE
      </h3>

      <ul className="relative space-y-3">
        {/* main vertical line (level 1 spine) */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />

        {grouped.map((group: any) => {
          const hasSub = group.children.length > 0;

          return (
            <div key={group.parent.id} className="relative">

              {/* LEVEL 1 */}
              <li
                onClick={() => handleScroll(group.parent.id)}
                className={`relative pl-3 cursor-pointer text-sm transition-all
                  ${
                    activeId === group.parent.id
                      ? "text-white font-medium"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                {activeId === group.parent.id && (
                  <span className="absolute left-0 top-[6px] w-[6px] h-[6px] rounded-full bg-[#8B3EFE]" />
                )}

                {group.parent.title}
              </li>

              {/* LEVEL 3 GROUP (ONLY IF EXISTS) */}
              {hasSub && (
                <div className="relative ml-4 pl-3 mt-1 border-l border-white/10">
                  {group.children.map((child: any) => {
                    const isActive = activeId === child.id;

                    return (
                      <li
                        key={child.id}
                        onClick={() => handleScroll(child.id)}
                        className={`relative cursor-pointer text-xs py-1 transition-all
                          ${
                            isActive
                              ? "text-white font-medium"
                              : "text-gray-400 hover:text-white"
                          }
                        `}
                      >
                        {isActive && (
                          <span className="absolute left-[-12px] top-[6px] w-[5px] h-[5px] rounded-full bg-[#8B3EFE]" />
                        )}

                        {child.title}
                      </li>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default OnThisPage;