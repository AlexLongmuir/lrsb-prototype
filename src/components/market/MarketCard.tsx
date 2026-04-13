import { Market, Direction } from "@/lib/types";

type MarketCardProps = {
  market: Market;
  onSelect: (market: Market, direction: Direction) => void;
};

export function MarketCard({ market, onSelect }: MarketCardProps) {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-m">
      <p className="text-section-title text-gray-600 mb-s">{market.name}</p>
      <div className="flex gap-s">
        <button
          onClick={() => onSelect(market, "sell")}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-sm py-2 text-center hover:border-danger hover:bg-red-50 transition-colors"
        >
          <span className="text-sub text-gray-500 block">Sell</span>
          <span className="text-body font-bold text-danger">
            {market.sellPrice.toFixed(1)}
          </span>
        </button>
        <button
          onClick={() => onSelect(market, "buy")}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-sm py-2 text-center hover:border-teal-600 hover:bg-teal-100 transition-colors"
        >
          <span className="text-sub text-gray-500 block">Buy</span>
          <span className="text-body font-bold text-teal-600">
            {market.buyPrice.toFixed(1)}
          </span>
        </button>
      </div>
    </div>
  );
}
