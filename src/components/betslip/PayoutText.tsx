import { Market, Direction } from "@/lib/types";
import { calculatePayout } from "@/lib/payout";

type PayoutTextProps = {
  market: Market;
  direction: Direction;
  stake: number;
};

export function PayoutText({ market, direction, stake }: PayoutTextProps) {
  if (stake <= 0) return null;

  const result = calculatePayout(market, direction, stake);
  const price = direction === "buy" ? market.buyPrice : market.sellPrice;

  // Determine the unit name for text (singular form)
  const unitName = market.unit === "%" ? "point" : market.unit.replace(/s$/, "");

  if (direction === "buy") {
    const lines: string[] = [];
    lines.push(
      `For every additional ${unitName} above ${price}, your returns increase by £${result.perPoint.toFixed(2)}.`
    );
    if (market.limitLevel !== null) {
      lines.push(
        `At ${market.limitLevel}${market.unit === "%" ? "%" : ` ${market.unit}`} or more, your returns are capped at £${result.maxReturn.toFixed(2)}.`
      );
    }
    lines.push(
      `At ${result.stopLevel} ${market.unit === "%" ? "%" : market.unit} or less, you return £0.`
    );
    return <p className="text-sub text-gray-500">{lines.join(" ")}</p>;
  }

  // Sell
  const lines: string[] = [];
  lines.push(
    `For every additional ${unitName} below ${price}, your returns increase by £${result.perPoint.toFixed(2)}.`
  );
  lines.push(
    `At ${result.stopLevel} ${market.unit === "%" ? "%" : market.unit} or more, you return £0.`
  );
  return <p className="text-sub text-gray-500">{lines.join(" ")}</p>;
}
