"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { fixtures } from "@/data/fixtures";

type Tab = "markets" | "mybets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const fixture = fixtures[0];

  return (
    <DeviceFrame>
      <div className="flex flex-col min-h-full">
        <Header
          homeTeam={fixture.homeTeam}
          awayTeam={fixture.awayTeam}
          competition={fixture.competition}
          kickOff={fixture.kickOff}
        />
        <div className="flex-1 p-m">
          {activeTab === "markets" ? (
            <p className="text-body text-gray-400">Markets will go here</p>
          ) : (
            <p className="text-body text-gray-400">My Bets will go here</p>
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </DeviceFrame>
  );
}
