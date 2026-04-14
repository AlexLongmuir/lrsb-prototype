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
      className={`w-full flex items-center text-left hover:bg-gray-50 transition-colors ${
        showDivider ? "border-t border-border" : ""
      }`}
      style={{ padding: "12px", gap: "10px", fontSize: "14px" }}
    >
      <span className="text-text-secondary flex-shrink-0" style={{ fontSize: "16px" }}>&#9432;</span>
      <span className="text-text-primary flex-1 min-w-0 truncate">
        {market.name}
      </span>
      <span className="flex-shrink-0 bg-spread-bg font-bold text-text-primary" style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "14px" }}>
        {market.sellPrice % 1 === 0 && market.buyPrice % 1 === 0
          ? `${market.sellPrice} - ${market.buyPrice}`
          : `${market.sellPrice.toFixed(1)} - ${market.buyPrice.toFixed(1)}`}
      </span>
      <svg className="text-text-secondary flex-shrink-0" style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
