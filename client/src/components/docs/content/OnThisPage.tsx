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

    const observer = new IntersectionObserver(
      (entries) => {
        let visibleSection = "";
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            visibleSection = entry.target.id;
          }
        });

        if (visibleSection) {
          setActiveId(visibleSection);
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    const elements: HTMLElement[] = [];

    sections.forEach((section: any) => {
      const el = document.getElementById(section.id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });

    // 🔥 NEW: force initial highlight on first render
    const first = sections.find((s: any) => s.level === 1);
    if (first?.id) {
      const el = document.getElementById(first.id);
      if (el) {
        setActiveId(first.id);
      }
    }

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [sections]);

  if (!sections.length) return null;

  const grouped: any = [];
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

        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />

        {grouped.map((group: any) => {
          const hasSub = group.children.length > 0;

          return (
            <div key={group.parent.id} className="relative">

              <li
                onClick={() => handleScroll(group.parent.id)}
                className={`relative pl-3 cursor-pointer text-sm transition-all
                  ${
                    activeId === group.parent.id
                      ? "text-[#00E1A2] font-medium"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                {activeId === group.parent.id && (
                  <span className="absolute left-0 top-[6px] w-[6px] h-[6px] rounded-full bg-[#00E1A2]" />
                )}

                {group.parent.title}
              </li>

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
                              ? "text-[#00E1A2] font-medium"
                              : "text-gray-400 hover:text-white"
                          }
                        `}
                      >
                        {isActive && (
                          <span className="absolute left-[-12px] top-[6px] w-[5px] h-[5px] rounded-full bg-[#00E1A2]" />
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