"use client";

import { useState, useEffect } from "react";
import { Market, Direction } from "@/lib/types";
import { DirectionToggle } from "./DirectionToggle";
import { StakeInput } from "./StakeInput";
import { useBets } from "@/context/BetsContext";

type BetSlipProps = {
  market: Market;
  initialDirection: Direction;
  onClose: () => void;
};

export function BetSlip({ market, initialDirection, onClose }: BetSlipProps) {
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [stake, setStake] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { placeBet } = useBets();

  const price = direction === "buy" ? market.buyPrice : market.sellPrice;

  const handlePlaceBet = () => {
    if (stake <= 0) return;
    placeBet(market, direction, stake);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 1200);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (showConfirmation) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" />
        <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
          <div className="bg-white rounded-t-md md:rounded-md md:max-w-[420px] md:w-full p-m text-center">
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-m">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-page-title">Bet Placed</p>
            <p className="text-sub text-gray-500 mt-xs">
              {direction === "buy" ? "Buy" : "Sell"} {market.name} at {price.toFixed(1)} for £{stake.toFixed(2)}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="bg-white rounded-t-md md:rounded-md md:max-w-[420px] md:w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center pt-2 md:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="p-m">
            <div className="mb-m">
              <span className="bg-teal-100 text-teal-700 text-sub px-3 py-1 rounded-pill">
                Limited Risk
              </span>
            </div>
            <div className="flex justify-between items-start mb-m">
              <div>
                <h2 className="text-page-title">{market.name}</h2>
                <p className="text-sub text-gray-500">{market.eventName}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                ✕
              </button>
            </div>
            <div className="mb-m">
              <DirectionToggle direction={direction} onToggle={setDirection} />
            </div>
            <div className="text-center mb-m">
              <p className="text-sub text-gray-500">{direction === "buy" ? "Buy" : "Sell"} price</p>
              <p className="text-[28px] font-bold text-gray-900">{price.toFixed(1)}</p>
            </div>
            <div className="mb-m">
              <p className="text-sub text-gray-500 mb-xs">Stake</p>
              <StakeInput stake={stake} onStakeChange={setStake} />
            </div>
            {/* Payout graph placeholder — Task 9 will replace this */}
            <div className="mb-m h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
              <p className="text-sub text-gray-400">Payout graph</p>
            </div>
            <button
              onClick={handlePlaceBet}
              disabled={stake <= 0}
              className="w-full bg-teal-600 text-white text-sub font-bold py-3 rounded-md hover:bg-teal-900 disabled:bg-gray-400 transition-colors"
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
