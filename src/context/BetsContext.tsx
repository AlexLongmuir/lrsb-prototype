"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { PlacedBet, Market, Direction } from "@/lib/types";

type BetsContextType = {
  bets: PlacedBet[];
  placeBet: (market: Market, direction: Direction, stake: number) => void;
};

const BetsContext = createContext<BetsContextType | null>(null);

export function BetsProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<PlacedBet[]>([]);

  const placeBet = useCallback(
    (market: Market, direction: Direction, stake: number) => {
      const entryPrice = direction === "buy" ? market.buyPrice : market.sellPrice;
      const newBet: PlacedBet = {
        id: `${market.id}-${Date.now()}`,
        market,
        direction,
        stake,
        entryPrice,
        pnl: 0,
      };
      setBets((prev) => [...prev, newBet]);
    },
    []
  );

  return (
    <BetsContext.Provider value={{ bets, placeBet }}>
      {children}
    </BetsContext.Provider>
  );
}

export function useBets() {
  const context = useContext(BetsContext);
  if (!context) {
    throw new Error("useBets must be used within a BetsProvider");
  }
  return context;
}
