import { Market, Direction } from "@/lib/types";
import { MarketCard } from "./MarketCard";

type MarketListProps = {
  markets: Market[];
  onSelectMarket: (market: Market, direction: Direction) => void;
};

export function MarketList({ markets, onSelectMarket }: MarketListProps) {
  return (
    <div className="flex flex-col gap-s">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          onSelect={onSelectMarket}
        />
      ))}
    </div>
  );
}
