import { Market, Direction } from "@/lib/types";

type MarketRowProps = {
  market: Market;
  onSelect: (market: Market, direction: Direction) => void;
  showDivider: boolean;
};

export function MarketRow({ market, onSelect, showDivider }: MarketRowProps) {
  return (
    <button
      onClick={() => onSelect(market, "buy")}
      className={`w-full flex items-center gap-2 px-m py-3 text-left hover:bg-gray-50 transition-colors ${
        showDivider ? "border-t border-border" : ""
      }`}
    >
      <span className="text-sub text-text-secondary flex-shrink-0">&#9432;</span>
      <span className="text-sub text-text-primary flex-1 min-w-0 truncate">
        {market.name}
      </span>
      <span className="flex-shrink-0 bg-spread-bg text-sub font-bold text-text-primary px-2.5 py-1 rounded-sm">
        {market.sellPrice % 1 === 0 && market.buyPrice % 1 === 0
          ? `${market.sellPrice} - ${market.buyPrice}`
          : `${market.sellPrice.toFixed(1)} - ${market.buyPrice.toFixed(1)}`}
      </span>
      <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
