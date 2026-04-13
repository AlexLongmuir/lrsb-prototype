"use client";

import { useBets } from "@/context/BetsContext";

type Tab = "markets" | "mybets";

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { bets } = useBets();

  return (
    <nav className="sticky bottom-0 bg-white border-t border-gray-200 flex">
      <button
        onClick={() => onTabChange("markets")}
        className={`flex-1 py-3 text-center text-sub font-bold ${
          activeTab === "markets" ? "text-teal-600 border-t-2 border-teal-600" : "text-gray-400"
        }`}
      >
        Markets
      </button>
      <button
        onClick={() => onTabChange("mybets")}
        className={`flex-1 py-3 text-center text-sub font-bold relative ${
          activeTab === "mybets" ? "text-teal-600 border-t-2 border-teal-600" : "text-gray-400"
        }`}
      >
        My Bets
        {bets.length > 0 && (
          <span className="absolute top-2 right-1/4 bg-teal-600 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {bets.length}
          </span>
        )}
      </button>
    </nav>
  );
}
