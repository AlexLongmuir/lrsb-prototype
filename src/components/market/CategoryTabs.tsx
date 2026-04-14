"use client";

export const CATEGORIES = [
  { id: "main", label: "Main" },
  { id: "bet-builder", label: "Bet-Builder" },
  { id: "popular-bbs", label: "Popular BBs" },
  { id: "players", label: "Players" },
  { id: "corners", label: "Corners" },
  { id: "cards", label: "Cards" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

type CategoryTabsProps = {
  activeCategory: CategoryId;
  onCategoryChange: (category: CategoryId) => void;
};

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="bg-surface border-b border-border overflow-x-auto">
      <div className="flex">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex-shrink-0 px-m py-2.5 text-sub whitespace-nowrap border-b-2 transition-colors ${
              activeCategory === cat.id
                ? "text-primary-red font-bold border-primary-red"
                : "text-text-secondary border-transparent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
