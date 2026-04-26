type Props = {
  topic: string;
};

const DocsHeader = ({ topic }: Props) => {
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

    </div>
  );
};

export default DocsHeader;