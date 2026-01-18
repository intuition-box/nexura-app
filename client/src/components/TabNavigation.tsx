import { Button } from "./ui/button";
import { useState } from "react";

interface TabNavigationProps {
  onTabChange?: (tab: string) => void;
}

export default function TabNavigation({ onTabChange }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "collections", label: "Collections" },
    { id: "ecosystems", label: "Ecosystems" },
    { id: "campaigns", label: "Campaigns" },
    { id: "streaks", label: "Streaks" },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
    console.log(`Tab ${tabId} selected`); // todo: remove mock functionality
  };

  return (
    <div className="border-b border-border bg-background sticky top-16 z-40" data-testid="tab-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 py-4 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleTabClick(tab.id)}
              className="whitespace-nowrap hover-elevate"
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}