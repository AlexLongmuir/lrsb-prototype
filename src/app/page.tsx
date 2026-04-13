"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { MarketList } from "@/components/market/MarketList";
import { fixtures } from "@/data/fixtures";
import { Market, Direction } from "@/lib/types";

type Tab = "markets" | "mybets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const fixture = fixtures[0];

  const handleSelectMarket = (market: Market, direction: Direction) => {
    console.log("Selected:", market.name, direction);
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
        <div className="flex-1 p-m bg-gray-50">
          {activeTab === "markets" ? (
            <MarketList
              markets={fixture.markets}
              onSelectMarket={handleSelectMarket}
            />
          ) : (
            <p className="text-body text-gray-400">My Bets will go here</p>
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </DeviceFrame>
  );
}
