"use client";

import { useState } from "react";
import { Market, Direction } from "@/lib/types";
import { MarketRow } from "./MarketRow";

type MarketGroupProps = {
  name: string;
  markets: Market[];
  onSelectMarket: (market: Market, direction: Direction) => void;
};

export function MarketGroup({ name, markets, onSelectMarket }: MarketGroupProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-surface">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-m py-3 border-b border-border"
      >
        <span className="font-bold text-text-primary" style={{ fontSize: "16px" }}>{name}</span>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4v10H3zM10 4h4v13h-4zM17 9h4v8h-4z" />
          </svg>
          <svg
            className={`w-5 h-5 text-primary-red transition-transform ${expanded ? "" : "-rotate-90"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div>
          {markets.map((market, i) => (
            <MarketRow
              key={market.id}
              market={market}
              onSelect={onSelectMarket}
              showDivider={i > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
