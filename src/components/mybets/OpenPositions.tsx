"use client";

import { useBets } from "@/context/BetsContext";
import { BetCard } from "./BetCard";

type OpenPositionsProps = {
  onGoToMarkets: () => void;
};

export function OpenPositions({ onGoToMarkets }: OpenPositionsProps) {
  const { bets } = useBets();

  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-body text-gray-400 mb-m">No open bets</p>
        <button
          onClick={onGoToMarkets}
          className="bg-teal-600 text-white text-sub font-bold px-6 py-2 rounded-md hover:bg-teal-900 transition-colors"
        >
          Go to Markets
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-s">
      {bets.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </div>
  );
}
