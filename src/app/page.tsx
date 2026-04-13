"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { MarketList } from "@/components/market/MarketList";
import { fixtures } from "@/data/fixtures";
import { Market, Direction } from "@/lib/types";
import { BetSlip } from "@/components/betslip/BetSlip";
import { OpenPositions } from "@/components/mybets/OpenPositions";

type Tab = "markets" | "mybets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const [slipState, setSlipState] = useState<{ market: Market; direction: Direction } | null>(null);
  const fixture = fixtures[fixtureIndex];

  const handleSelectMarket = (market: Market, direction: Direction) => {
    setSlipState({ market, direction });
  };

  return (
    <DeviceFrame>
      <div className="flex flex-col min-h-full">
        <Header
          homeTeam={fixture.homeTeam}
          awayTeam={fixture.awayTeam}
          competition={fixture.competition}
          kickOff={fixture.kickOff}
        />
        {activeTab === "markets" && (
          <div className="flex bg-white border-b border-gray-200 overflow-x-auto">
            {fixtures.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setFixtureIndex(i)}
                className={`flex-shrink-0 px-m py-2 text-sub whitespace-nowrap ${
                  i === fixtureIndex
                    ? "text-teal-600 font-bold border-b-2 border-teal-600"
                    : "text-gray-400"
                }`}
              >
                {f.homeTeam} v {f.awayTeam}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 p-m bg-gray-50">
          {activeTab === "markets" ? (
            <MarketList
              markets={fixture.markets}
              onSelectMarket={handleSelectMarket}
            />
          ) : (
            <OpenPositions onGoToMarkets={() => setActiveTab("markets")} />
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {slipState && (
        <BetSlip
          market={slipState.market}
          initialDirection={slipState.direction}
          onClose={() => setSlipState(null)}
        />
      )}
    </DeviceFrame>
  );
}
