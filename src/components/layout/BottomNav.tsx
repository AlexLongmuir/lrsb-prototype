"use client";

import { useBets } from "@/context/BetsContext";

type Tab = "markets" | "mybets";

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

type NavItem = {
  id: string;
  label: string;
  tab: Tab | null;
  icon: React.ReactNode;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { bets } = useBets();

  const items: NavItem[] = [
    {
      id: "home",
      label: "Home",
      tab: "markets",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "mybets",
      label: "My Bets",
      tab: "mybets",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8l-4 4h3v4h2v-4h3l-4-4zM5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      id: "inplay",
      label: "In-Play",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      id: "promotions",
      label: "Promotions",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      id: "more",
      label: "More",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky bottom-0 bg-header-bg flex">
      {items.map((item) => {
        const isActive =
          (item.tab === "markets" && activeTab === "markets") ||
          (item.tab === "mybets" && activeTab === "mybets");

        return (
          <button
            key={item.id}
            onClick={() => item.tab && onTabChange(item.tab)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 relative ${
              isActive ? "text-primary-red" : "text-gray-400"
            } ${item.tab ? "cursor-pointer" : "cursor-default"}`}
          >
            {item.icon}
            <span className="text-legal">{item.label}</span>
            {item.id === "mybets" && bets.length > 0 && (
              <span className="absolute top-1 right-1/4 bg-primary-red text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {bets.length}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
