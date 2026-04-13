"use client";

import { PlacedBet } from "@/lib/types";
import { PayoutGraph } from "@/components/betslip/PayoutGraph";

type BetCardProps = {
  bet: PlacedBet;
};

export function BetCard({ bet }: BetCardProps) {
  const { market, direction, stake, entryPrice, pnl } = bet;

  return (
    <div className="bg-white rounded-md border border-gray-200 p-m">
      <div className="flex justify-between items-start mb-s">
        <div>
          <p className="text-section-title text-gray-600">{market.name}</p>
          <p className="text-sub text-gray-400">{market.eventName}</p>
        </div>
        <span
          className={`text-sub font-bold px-2 py-0.5 rounded-sm ${
            direction === "buy"
              ? "bg-teal-100 text-teal-700"
              : "bg-red-50 text-danger"
          }`}
        >
          {direction === "buy" ? "Buy" : "Sell"}
        </span>
      </div>

      <div className="flex gap-m mb-s text-sub">
        <div>
          <span className="text-gray-400">Entry: </span>
          <span className="font-bold text-gray-700">{entryPrice.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-gray-400">Stake: </span>
          <span className="font-bold text-gray-700">£{stake.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-400">P&L: </span>
          <span
            className={`font-bold ${
              pnl >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {pnl >= 0 ? "+" : ""}£{pnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Mini payout graph */}
      <div className="h-[100px]">
        <PayoutGraph market={market} direction={direction} stake={stake} />
      </div>
    </div>
  );
}
