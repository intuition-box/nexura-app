import { ReactNode } from "react";

const highlightText = (text: string, query: string) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-[#8B3EFE]/40 text-white px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const recursiveHighlight = (node: any, query: string): any => {
  if (typeof node === "string") return highlightText(node, query);

  if (Array.isArray(node)) {
    return node.map((child, i) => recursiveHighlight(child, query));
  }

  if (node?.props?.children) {
    return {
      ...node,
      props: {
        ...node.props,
        children: recursiveHighlight(node.props.children, query),
      },
    };
  }

  return node;
};

const HighlightWrapper = ({ children, query }: { children: ReactNode; query: string }) => {
  return <>{recursiveHighlight(children, query)}</>;
};

export default HighlightWrapper;