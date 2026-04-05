type Props = {
  topic: string;
  sections: any[];
};

const DocsHeader = ({ topic, sections }: Props) => {

  const mainSections = sections.filter((sec) => sec.level === 2);
const subSections = sections.filter((sec) => sec.level === 3);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Purple dot */}
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: "linear-gradient(135deg, #AE59D1, #592E6B)",
          }}
        />

        {/* DOCUMENTATION */}
        <span
          className="text-sm font-semibold"
          style={{
            background: "linear-gradient(90deg, #B184C4, #FF8CD9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          DOCUMENTATION
        </span>

        {/* Topic only */}
        <span className="text-white text-sm font-medium">
          {topic}
        </span>
      </div>

      {/* Right side */}
      <div className="border-l border-white/20 pl-3 space-y-3">

  {/* Main Sections */}
  {mainSections.map((sec: any) => (
    <div
      key={sec.id}
      className="cursor-pointer font-medium text-white"
      onClick={() => {
        document.getElementById(sec.id)?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      {sec.title}
    </div>
  ))}

  {/* Subsections Group */}
  {subSections.length > 0 && (
    <div className="relative pl-3">

      {/* ONE continuous vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/20"></div>

      <div className="space-y-2">
        {subSections.map((sec: any) => (
          <div
            key={sec.id}
            className="cursor-pointer text-xs text-gray-400"
            onClick={() => {
              document.getElementById(sec.id)?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            {sec.title}
          </div>
        ))}
      </div>

    </div>
  )}
</div>
    </div>
  );
};

export default DocsHeader;