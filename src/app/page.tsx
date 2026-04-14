"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { Header } from "@/components/layout/Header";
import { MatchTitle } from "@/components/layout/MatchTitle";
import { BettingToggle } from "@/components/layout/BettingToggle";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryTabs, CategoryId } from "@/components/market/CategoryTabs";
import { MarketGroup } from "@/components/market/MarketGroup";
import { fixture } from "@/data/fixtures";
import { Market, Direction } from "@/lib/types";
import { BetSlip } from "@/components/betslip/BetSlip";
import { OpenPositions } from "@/components/mybets/OpenPositions";

type Tab = "markets" | "mybets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("main");
  const [slipState, setSlipState] = useState<{ market: Market; direction: Direction } | null>(null);

  const handleSelectMarket = (market: Market, direction: Direction) => {
    setSlipState({ market, direction });
  };

  const visibleGroups = fixture.marketGroups.filter(
    (g) => g.category === activeCategory
  );

  return (
    <DeviceFrame>
      <div className="flex flex-col min-h-full">
        <Header homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} />
        {activeTab === "markets" && (
          <>
            <MatchTitle homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} />
            <BettingToggle />
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </>
        )}
        <div className="flex-1 bg-page-bg">
          {activeTab === "markets" ? (
            <div className="flex flex-col gap-2 py-2">
              {visibleGroups.length > 0 ? (
                visibleGroups.map((group) => (
                  <MarketGroup
                    key={group.id}
                    name={group.name}
                    markets={group.markets}
                    onSelectMarket={handleSelectMarket}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary text-sub">
                  No markets available for this category
                </div>
              )}
            </div>
          ) : (
            <div className="p-m">
              <OpenPositions onGoToMarkets={() => setActiveTab("markets")} />
            </div>
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
