# LRSB Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-fidelity interactive prototype of the LRSB bet slip, payout graph, and My Bets screen, deployed to Vercel.

**Architecture:** Single-page Next.js app with bottom tab navigation. React context for bet state (no persistence). Recharts for payout graphs. Device frame wrapper with toggle for mobile/desktop presentation.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, Recharts, TypeScript, Vercel

**Spec:** `docs/superpowers/specs/2026-04-13-lrsb-prototype-design.md`

---

## File Map

```
src/
  app/
    layout.tsx              — Root layout, font config, global styles
    page.tsx                — Single page: tab routing between Markets and My Bets
    globals.css             — Tailwind imports + custom teal palette CSS variables
  components/
    layout/
      DeviceFrame.tsx       — Phone frame wrapper with toggle
      BottomNav.tsx         — Two-tab nav: Markets / My Bets
      Header.tsx            — Match header (name, kick-off, competition)
    market/
      MarketList.tsx        — Renders all markets for a fixture
      MarketCard.tsx        — Single market row: name, buy price, sell price
    betslip/
      BetSlip.tsx           — Sheet (mobile) / modal (desktop) container
      DirectionToggle.tsx   — Buy/Sell segmented control
      StakeInput.tsx        — Numeric keypad for stake entry
      PayoutGraph.tsx       — Bar or line chart via Recharts
      PayoutText.tsx        — Descriptive payout sentence
    mybets/
      OpenPositions.tsx     — List of open bet cards
      BetCard.tsx           — Single open bet with mini graph
  data/
    fixtures.ts             — Static fixture + market data
  lib/
    types.ts                — Shared TypeScript types
    payout.ts               — Payout calculation logic
  context/
    BetsContext.tsx          — React context for placed bets
tailwind.config.ts          — Custom teal scale, spacing, radii
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run from `/Users/alex/Projects/lrsb-prototype`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-install
```

Select defaults when prompted. The `--skip-install` flag lets us add dependencies first.

- [ ] **Step 2: Install dependencies**

```bash
npm install recharts
npm install
```

- [ ] **Step 3: Configure Tailwind with LRSB design tokens**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          100: "#E6F4F6",
          300: "#6DC2CC",
          500: "#1FA3B0",
          600: "#168D99",
          700: "#127780",
          900: "#0A5059",
        },
        success: "#39C172",
        danger: "#BD2A2E",
        warning: "#FCCE2B",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      spacing: {
        xs: "5px",
        s: "10px",
        m: "15px",
      },
      borderRadius: {
        sm: "4px",
        md: "10px",
        pill: "100px",
      },
      fontSize: {
        "page-title": ["16px", { fontWeight: "700", lineHeight: "1.3" }],
        "section-title": ["12px", { fontWeight: "700", lineHeight: "1.3" }],
        body: ["16px", { fontWeight: "400", lineHeight: "1.4" }],
        sub: ["12px", { fontWeight: "400", lineHeight: "1.3" }],
        legal: ["10px", { fontWeight: "400", lineHeight: "1.3" }],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Set up globals.css**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f5f5;
}
```

- [ ] **Step 5: Set up root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LRSB Prototype",
  description: "Limited Risk Spread Betting prototype",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Minimal page to verify setup**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-page-title text-teal-600">LRSB Prototype</h1>
    </div>
  );
}
```

- [ ] **Step 7: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000. Expect to see "LRSB Prototype" in teal. Verify the font is Arial and the colour matches #168D99.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with LRSB design tokens"
```

---

## Task 2: Types & Static Data

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/data/fixtures.ts`

- [ ] **Step 1: Define shared types**

Create `src/lib/types.ts`:

```ts
export type MarketType = "discrete" | "continuous";
export type Direction = "buy" | "sell";

export type Market = {
  id: string;
  name: string;
  eventId: string;
  type: MarketType;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  limitLevel: number | null;
  minOutcome: number;
  maxOutcome: number;
  step: number; // increment between x-axis points (1 for goals, 1 for corners, etc.)
};

export type Fixture = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickOff: string; // display string, e.g. "Sat 15:00"
  markets: Market[];
};

export type PlacedBet = {
  id: string;
  market: Market;
  direction: Direction;
  stake: number;
  entryPrice: number;
  pnl: number; // static display value
};
```

- [ ] **Step 2: Create fixture data**

Create `src/data/fixtures.ts`:

```ts
import { Fixture } from "@/lib/types";

export const fixtures: Fixture[] = [
  {
    id: "ars-che",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    competition: "Premier League",
    kickOff: "Sat 15:00",
    markets: [
      {
        id: "ars-che-goals",
        name: "Total Goals",
        eventId: "ars-che",
        type: "discrete",
        buyPrice: 2.8,
        sellPrice: 2.5,
        unit: "goals",
        limitLevel: null,
        minOutcome: 0,
        maxOutcome: 8,
        step: 1,
      },
      {
        id: "ars-che-supremacy",
        name: "Supremacy",
        eventId: "ars-che",
        type: "discrete",
        buyPrice: 0.4,
        sellPrice: 0.1,
        unit: "goals",
        limitLevel: null,
        minOutcome: -4,
        maxOutcome: 4,
        step: 1,
      },
      {
        id: "ars-che-corners",
        name: "Total Corners",
        eventId: "ars-che",
        type: "discrete",
        buyPrice: 11.5,
        sellPrice: 10.5,
        unit: "corners",
        limitLevel: null,
        minOutcome: 0,
        maxOutcome: 20,
        step: 1,
      },
      {
        id: "ars-che-win",
        name: "Win Match %",
        eventId: "ars-che",
        type: "continuous",
        buyPrice: 58,
        sellPrice: 55,
        unit: "%",
        limitLevel: 100,
        minOutcome: 0,
        maxOutcome: 100,
        step: 10,
      },
    ],
  },
  {
    id: "liv-mci",
    homeTeam: "Liverpool",
    awayTeam: "Man City",
    competition: "Premier League",
    kickOff: "Sat 17:30",
    markets: [
      {
        id: "liv-mci-goals",
        name: "Total Goals",
        eventId: "liv-mci",
        type: "discrete",
        buyPrice: 3.1,
        sellPrice: 2.8,
        unit: "goals",
        limitLevel: null,
        minOutcome: 0,
        maxOutcome: 8,
        step: 1,
      },
      {
        id: "liv-mci-supremacy",
        name: "Supremacy",
        eventId: "liv-mci",
        type: "discrete",
        buyPrice: 0.2,
        sellPrice: -0.1,
        unit: "goals",
        limitLevel: null,
        minOutcome: -4,
        maxOutcome: 4,
        step: 1,
      },
      {
        id: "liv-mci-corners",
        name: "Total Corners",
        eventId: "liv-mci",
        type: "discrete",
        buyPrice: 12.0,
        sellPrice: 11.0,
        unit: "corners",
        limitLevel: null,
        minOutcome: 0,
        maxOutcome: 20,
        step: 1,
      },
      {
        id: "liv-mci-win",
        name: "Win Match %",
        eventId: "liv-mci",
        type: "continuous",
        buyPrice: 52,
        sellPrice: 49,
        unit: "%",
        limitLevel: 100,
        minOutcome: 0,
        maxOutcome: 100,
        step: 10,
      },
    ],
  },
  {
    id: "tot-new",
    homeTeam: "Tottenham",
    awayTeam: "Newcastle",
    competition: "Premier League",
    kickOff: "Sun 14:00",
    markets: [
      {
        id: "tot-new-goals",
        name: "Total Goals",
        eventId: "tot-new",
        type: "discrete",
        buyPrice: 2.6,
        sellPrice: 2.3,
        unit: "goals",
        limitLevel: null,
        minOutcome: 0,
        maxOutcome: 8,
        step: 1,
      },
      {
        id: "tot-new-supremacy",
        name: "Supremacy",
        eventId: "tot-new",
        type: "discrete",
        buyPrice: -0.3,
        sellPrice: -0.6,
        unit: "goals",
        limitLevel: null,
        minOutcome: -4,
        maxOutcome: 4,
        step: 1,
      },
      {
        id: "tot-new-win",
        name: "Win Match %",
        eventId: "tot-new",
        type: "continuous",
        buyPrice: 45,
        sellPrice: 42,
        unit: "%",
        limitLevel: 100,
        minOutcome: 0,
        maxOutcome: 100,
        step: 10,
      },
    ],
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/data/fixtures.ts
git commit -m "feat: add types and static fixture data"
```

---

## Task 3: Payout Calculation Logic

**Files:**
- Create: `src/lib/payout.ts`
- Create: `src/lib/__tests__/payout.test.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts` at project root:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Write failing tests for payout calculation**

Create `src/lib/__tests__/payout.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { calculatePayout, type PayoutResult } from "@/lib/payout";
import { Market } from "@/lib/types";

const totalGoalsMarket: Market = {
  id: "test-goals",
  name: "Total Goals",
  eventId: "test",
  type: "discrete",
  buyPrice: 2.5,
  sellPrice: 2.2,
  unit: "goals",
  limitLevel: null,
  minOutcome: 0,
  maxOutcome: 8,
  step: 1,
};

const winMatchMarket: Market = {
  id: "test-win",
  name: "Win Match %",
  eventId: "test",
  type: "continuous",
  buyPrice: 55,
  sellPrice: 52,
  unit: "%",
  limitLevel: 100,
  minOutcome: 0,
  maxOutcome: 100,
  step: 10,
};

describe("calculatePayout", () => {
  describe("buy direction on discrete market (Total Goals)", () => {
    it("returns correct stop level based on stake and buy price", () => {
      // £10 stake, buy at 2.5. £/point = stake / buyPrice = 10 / 2.5 = £4/point
      // Stop level = 0 (can't go below 0 goals)
      // Max loss at 0 goals = 2.5 * 4 = £10 = stake. So £/point = stake / buyPrice.
      const result = calculatePayout(totalGoalsMarket, "buy", 10);
      expect(result.perPoint).toBeCloseTo(4);
      expect(result.stopLevel).toBe(0);
    });

    it("returns zero payout at and below the stop level", () => {
      const result = calculatePayout(totalGoalsMarket, "buy", 10);
      const zeroOutcome = result.outcomes.find((o) => o.outcome === 0);
      expect(zeroOutcome?.payout).toBe(0);
    });

    it("returns positive payout above the buy price", () => {
      const result = calculatePayout(totalGoalsMarket, "buy", 10);
      // At 3 goals: (3 - 2.5) * 4 = £2 profit + £10 stake back = £12 return
      const threeGoals = result.outcomes.find((o) => o.outcome === 3);
      expect(threeGoals?.payout).toBeCloseTo(12);
    });

    it("returns partial stake back between stop and buy price", () => {
      const result = calculatePayout(totalGoalsMarket, "buy", 10);
      // At 1 goal: (1 - 0) * 4 = £4 return (lost £6 of stake)
      const oneGoal = result.outcomes.find((o) => o.outcome === 1);
      expect(oneGoal?.payout).toBeCloseTo(4);
    });

    it("returns stake back at buy price", () => {
      const result = calculatePayout(totalGoalsMarket, "buy", 10);
      // At 2.5 goals doesn't exist as discrete, but at 2 goals:
      // (2 - 0) * 4 = £8 return
      const twoGoals = result.outcomes.find((o) => o.outcome === 2);
      expect(twoGoals?.payout).toBeCloseTo(8);
    });
  });

  describe("sell direction on discrete market (Total Goals)", () => {
    it("returns correct per-point for sell", () => {
      // £10 stake, sell at 2.2. Stop above sell price.
      // Max loss if outcome goes high. stop = sellPrice + stake/perPoint
      // perPoint = stake / (maxOutcome - sellPrice) would cap at maxOutcome,
      // but for unbounded markets we set stop = sellPrice + stake/perPoint
      // We choose perPoint so that at the stop level, loss = stake.
      // For sell: perPoint = stake / (stopLevel - sellPrice), stopLevel = maxOutcome
      // perPoint = 10 / (8 - 2.2) = 10 / 5.8 ~= 1.724
      const result = calculatePayout(totalGoalsMarket, "sell", 10);
      expect(result.perPoint).toBeCloseTo(1.724, 2);
      expect(result.stopLevel).toBe(8);
    });

    it("returns max return at 0 outcomes for sell", () => {
      const result = calculatePayout(totalGoalsMarket, "sell", 10);
      // At 0 goals: (2.2 - 0) * perPoint + stake = return
      // Actually: return = stake + (sellPrice - outcome) * perPoint
      // At 0: 10 + 2.2 * 1.724 = 10 + 3.793 = 13.793
      const zeroGoals = result.outcomes.find((o) => o.outcome === 0);
      expect(zeroGoals!.payout).toBeGreaterThan(10);
    });

    it("returns zero at stop level for sell", () => {
      const result = calculatePayout(totalGoalsMarket, "sell", 10);
      const stopOutcome = result.outcomes.find(
        (o) => o.outcome === result.stopLevel
      );
      expect(stopOutcome?.payout).toBe(0);
    });
  });

  describe("buy direction on continuous market (Win Match %)", () => {
    it("handles naturally bounded market (0-100)", () => {
      // Buy at 55, bounded at 0 and 100. Max loss = 55 * perPoint = stake
      // perPoint = 10 / 55 = 0.1818
      const result = calculatePayout(winMatchMarket, "buy", 10);
      expect(result.perPoint).toBeCloseTo(0.1818, 3);
      expect(result.stopLevel).toBe(0);
    });

    it("returns max payout at limit level", () => {
      const result = calculatePayout(winMatchMarket, "buy", 10);
      // At 100%: (100 - 55) * 0.1818 + 0 = 45 * 0.1818 = 8.18 profit
      // Return = stake + profit = 10 + 8.18 = 18.18
      const maxOutcome = result.outcomes.find((o) => o.outcome === 100);
      expect(maxOutcome?.payout).toBeCloseTo(18.18, 1);
    });
  });

  describe("outcome generation", () => {
    it("generates correct number of discrete outcomes", () => {
      const result = calculatePayout(totalGoalsMarket, "buy", 10);
      // 0 through 8 = 9 outcomes
      expect(result.outcomes.length).toBe(9);
    });

    it("generates outcomes at correct step intervals for continuous", () => {
      const result = calculatePayout(winMatchMarket, "buy", 10);
      // 0, 10, 20, ... 100 = 11 outcomes
      expect(result.outcomes.length).toBe(11);
      expect(result.outcomes[0].outcome).toBe(0);
      expect(result.outcomes[10].outcome).toBe(100);
    });
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
npm test
```

Expected: All tests fail with "cannot find module" or similar.

- [ ] **Step 5: Implement payout calculation**

Create `src/lib/payout.ts`:

```ts
import { Market, Direction } from "./types";

export type PayoutOutcome = {
  outcome: number;
  payout: number; // total return in GBP (0 = total loss of stake)
};

export type PayoutResult = {
  perPoint: number;
  stopLevel: number;
  maxReturn: number;
  outcomes: PayoutOutcome[];
};

export function calculatePayout(
  market: Market,
  direction: Direction,
  stake: number
): PayoutResult {
  if (stake <= 0) {
    return {
      perPoint: 0,
      stopLevel: 0,
      maxReturn: 0,
      outcomes: generateOutcomePoints(market).map((o) => ({
        outcome: o,
        payout: 0,
      })),
    };
  }

  const price = direction === "buy" ? market.buyPrice : market.sellPrice;
  const outcomePoints = generateOutcomePoints(market);

  if (direction === "buy") {
    return calculateBuyPayout(market, price, stake, outcomePoints);
  } else {
    return calculateSellPayout(market, price, stake, outcomePoints);
  }
}

function calculateBuyPayout(
  market: Market,
  price: number,
  stake: number,
  outcomePoints: number[]
): PayoutResult {
  // For buy: profit when outcome > price, loss when outcome < price
  // Stop level = where you lose entire stake
  // perPoint = stake / (price - stopLevel)
  const stopLevel = market.minOutcome;
  const perPoint = stake / (price - stopLevel);

  const limitLevel = market.limitLevel ?? market.maxOutcome;
  const maxReturn = stake + (limitLevel - price) * perPoint;

  const outcomes: PayoutOutcome[] = outcomePoints.map((outcome) => {
    // Return = (outcome - stopLevel) * perPoint, capped at 0 on the low end
    const rawReturn = (outcome - stopLevel) * perPoint;
    const cappedReturn = Math.max(0, rawReturn);
    // If there's a limit, cap the upside too
    const limitedReturn =
      market.limitLevel !== null ? Math.min(cappedReturn, maxReturn) : cappedReturn;
    return { outcome, payout: Math.round(limitedReturn * 100) / 100 };
  });

  return { perPoint, stopLevel, maxReturn, outcomes };
}

function calculateSellPayout(
  market: Market,
  price: number,
  stake: number,
  outcomePoints: number[]
): PayoutResult {
  // For sell: profit when outcome < price, loss when outcome > price
  // Stop level = where you lose entire stake (above price)
  const stopLevel = market.maxOutcome;
  const perPoint = stake / (stopLevel - price);

  const limitLevel = market.limitLevel !== null ? market.minOutcome : market.minOutcome;
  const maxReturn = stake + (price - limitLevel) * perPoint;

  const outcomes: PayoutOutcome[] = outcomePoints.map((outcome) => {
    // Return = (stopLevel - outcome) * perPoint, capped at 0
    const rawReturn = (stopLevel - outcome) * perPoint;
    const cappedReturn = Math.max(0, rawReturn);
    const limitedReturn = Math.min(cappedReturn, maxReturn);
    return { outcome, payout: Math.round(limitedReturn * 100) / 100 };
  });

  return { perPoint, stopLevel, maxReturn, outcomes };
}

function generateOutcomePoints(market: Market): number[] {
  const points: number[] = [];
  for (let i = market.minOutcome; i <= market.maxOutcome; i += market.step) {
    points.push(i);
  }
  // Ensure maxOutcome is included
  if (points[points.length - 1] !== market.maxOutcome) {
    points.push(market.maxOutcome);
  }
  return points;
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/payout.ts src/lib/__tests__/payout.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add payout calculation logic with tests"
```

---

## Task 4: Bets Context

**Files:**
- Create: `src/context/BetsContext.tsx`

- [ ] **Step 1: Create the context provider**

Create `src/context/BetsContext.tsx`:

```tsx
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
        pnl: 0, // static for prototype
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
```

- [ ] **Step 2: Wrap the app in BetsProvider**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { BetsProvider } from "@/context/BetsContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LRSB Prototype",
  description: "Limited Risk Spread Betting prototype",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BetsProvider>{children}</BetsProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify dev server still runs**

```bash
npm run dev
```

Open http://localhost:3000. Should still show "LRSB Prototype" with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/context/BetsContext.tsx src/app/layout.tsx
git commit -m "feat: add BetsContext for placed bet state"
```

---

## Task 5: Layout Components (DeviceFrame, BottomNav, Header)

**Files:**
- Create: `src/components/layout/DeviceFrame.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/Header.tsx`

- [ ] **Step 1: Create DeviceFrame**

Create `src/components/layout/DeviceFrame.tsx`:

```tsx
"use client";

import { useState, ReactNode } from "react";

type DeviceFrameProps = {
  children: ReactNode;
};

export function DeviceFrame({ children }: DeviceFrameProps) {
  const [showFrame, setShowFrame] = useState(true);

  return (
    <div className="min-h-screen bg-gray-200 relative">
      <button
        onClick={() => setShowFrame(!showFrame)}
        className="fixed top-4 right-4 z-50 bg-white text-sub text-gray-600 px-3 py-1.5 rounded-md shadow-md hover:bg-gray-50"
      >
        {showFrame ? "Remove frame" : "Show frame"}
      </button>

      {showFrame ? (
        <div className="flex items-start justify-center pt-8 pb-8 min-h-screen">
          <div className="relative">
            {/* Phone frame */}
            <div className="w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-4 border-gray-800 overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-gray-800 rounded-b-2xl z-10" />
              {/* Screen content */}
              <div className="h-full overflow-y-auto pt-[30px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto min-h-screen bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create BottomNav**

Create `src/components/layout/BottomNav.tsx`:

```tsx
"use client";

import { useBets } from "@/context/BetsContext";

type Tab = "markets" | "mybets";

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { bets } = useBets();

  return (
    <nav className="sticky bottom-0 bg-white border-t border-gray-200 flex">
      <button
        onClick={() => onTabChange("markets")}
        className={`flex-1 py-3 text-center text-sub font-bold ${
          activeTab === "markets" ? "text-teal-600 border-t-2 border-teal-600" : "text-gray-400"
        }`}
      >
        Markets
      </button>
      <button
        onClick={() => onTabChange("mybets")}
        className={`flex-1 py-3 text-center text-sub font-bold relative ${
          activeTab === "mybets" ? "text-teal-600 border-t-2 border-teal-600" : "text-gray-400"
        }`}
      >
        My Bets
        {bets.length > 0 && (
          <span className="absolute top-2 right-1/4 bg-teal-600 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
            {bets.length}
          </span>
        )}
      </button>
    </nav>
  );
}
```

- [ ] **Step 3: Create Header**

Create `src/components/layout/Header.tsx`:

```tsx
type HeaderProps = {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickOff: string;
};

export function Header({ homeTeam, awayTeam, competition, kickOff }: HeaderProps) {
  return (
    <div className="bg-teal-600 text-white p-m">
      <p className="text-sub opacity-80">{competition}</p>
      <h1 className="text-page-title">
        {homeTeam} vs {awayTeam}
      </h1>
      <p className="text-sub opacity-80">{kickOff}</p>
    </div>
  );
}
```

- [ ] **Step 4: Wire up the page with layout components**

Replace `src/app/page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { fixtures } from "@/data/fixtures";

type Tab = "markets" | "mybets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const fixture = fixtures[0]; // Default to first fixture

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
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expect: phone frame with teal header showing "Arsenal vs Chelsea", placeholder content, and a two-tab bottom nav. Toggle the frame on/off. Switch between Markets and My Bets tabs.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/page.tsx
git commit -m "feat: add DeviceFrame, BottomNav, and Header layout components"
```

---

## Task 6: Market List & Market Cards

**Files:**
- Create: `src/components/market/MarketList.tsx`
- Create: `src/components/market/MarketCard.tsx`

- [ ] **Step 1: Create MarketCard**

Create `src/components/market/MarketCard.tsx`:

```tsx
import { Market, Direction } from "@/lib/types";

type MarketCardProps = {
  market: Market;
  onSelect: (market: Market, direction: Direction) => void;
};

export function MarketCard({ market, onSelect }: MarketCardProps) {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-m">
      <p className="text-section-title text-gray-600 mb-s">{market.name}</p>
      <div className="flex gap-s">
        <button
          onClick={() => onSelect(market, "sell")}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-sm py-2 text-center hover:border-danger hover:bg-red-50 transition-colors"
        >
          <span className="text-sub text-gray-500 block">Sell</span>
          <span className="text-body font-bold text-danger">
            {market.sellPrice.toFixed(1)}
          </span>
        </button>
        <button
          onClick={() => onSelect(market, "buy")}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-sm py-2 text-center hover:border-teal-600 hover:bg-teal-100 transition-colors"
        >
          <span className="text-sub text-gray-500 block">Buy</span>
          <span className="text-body font-bold text-teal-600">
            {market.buyPrice.toFixed(1)}
          </span>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MarketList**

Create `src/components/market/MarketList.tsx`:

```tsx
import { Market, Direction } from "@/lib/types";
import { MarketCard } from "./MarketCard";

type MarketListProps = {
  markets: Market[];
  onSelectMarket: (market: Market, direction: Direction) => void;
};

export function MarketList({ markets, onSelectMarket }: MarketListProps) {
  return (
    <div className="flex flex-col gap-s">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          onSelect={onSelectMarket}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Wire markets into the page**

Update `src/app/page.tsx` — replace the markets placeholder:

```tsx
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
    // Will open bet slip in next task
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
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expect: market cards for Total Goals, Supremacy, Total Corners, Win Match %. Each card shows sell (red) and buy (teal) prices. Clicking logs to console.

- [ ] **Step 5: Commit**

```bash
git add src/components/market/ src/app/page.tsx
git commit -m "feat: add MarketList and MarketCard components"
```

---

## Task 7: Bet Slip Container (Sheet & Modal)

**Files:**
- Create: `src/components/betslip/BetSlip.tsx`
- Create: `src/components/betslip/DirectionToggle.tsx`

- [ ] **Step 1: Create DirectionToggle**

Create `src/components/betslip/DirectionToggle.tsx`:

```tsx
import { Direction } from "@/lib/types";

type DirectionToggleProps = {
  direction: Direction;
  onToggle: (direction: Direction) => void;
};

export function DirectionToggle({ direction, onToggle }: DirectionToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-md p-0.5">
      <button
        onClick={() => onToggle("buy")}
        className={`flex-1 py-2 text-sub font-bold rounded-md transition-colors ${
          direction === "buy"
            ? "bg-teal-600 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Buy
      </button>
      <button
        onClick={() => onToggle("sell")}
        className={`flex-1 py-2 text-sub font-bold rounded-md transition-colors ${
          direction === "sell"
            ? "bg-danger text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Sell
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create BetSlip shell**

Create `src/components/betslip/BetSlip.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Market, Direction } from "@/lib/types";
import { DirectionToggle } from "./DirectionToggle";
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

  // Close on escape key
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sheet (mobile) / Modal (desktop) */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="bg-white rounded-t-md md:rounded-md md:max-w-[420px] md:w-full max-h-[90vh] overflow-y-auto">
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center pt-2 md:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="p-m">
            {/* Mode pill */}
            <div className="mb-m">
              <span className="bg-teal-100 text-teal-700 text-sub px-3 py-1 rounded-pill">
                Limited Risk
              </span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-m">
              <div>
                <h2 className="text-page-title">{market.name}</h2>
                <p className="text-sub text-gray-500">{market.eventId}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Direction toggle */}
            <div className="mb-m">
              <DirectionToggle direction={direction} onToggle={setDirection} />
            </div>

            {/* Price */}
            <div className="text-center mb-m">
              <p className="text-sub text-gray-500">{direction === "buy" ? "Buy" : "Sell"} price</p>
              <p className="text-[28px] font-bold text-gray-900">{price.toFixed(1)}</p>
            </div>

            {/* Stake input — placeholder, built in next task */}
            <div className="mb-m">
              <p className="text-sub text-gray-500 mb-xs">Stake</p>
              <div className="text-center text-[28px] font-bold text-gray-900 py-2 border-b-2 border-teal-600">
                {stake > 0 ? `£${stake.toFixed(2)}` : "£0.00"}
              </div>
            </div>

            {/* Payout graph placeholder — built in task 9 */}
            <div className="mb-m h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
              <p className="text-sub text-gray-400">Payout graph</p>
            </div>

            {/* Place bet button */}
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
```

- [ ] **Step 3: Wire bet slip into the page**

Update `src/app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { MarketList } from "@/components/market/MarketList";
import { BetSlip } from "@/components/betslip/BetSlip";
import { fixtures } from "@/data/fixtures";
import { Market, Direction } from "@/lib/types";

type Tab = "markets" | "mybets";

type SlipState = {
  market: Market;
  direction: Direction;
} | null;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const [slipState, setSlipState] = useState<SlipState>(null);
  const fixture = fixtures[0];

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
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Click a buy or sell price. Expect: bet slip opens as bottom sheet showing market name, direction toggle, price, stake display (£0.00), placeholder graph, and disabled Place Bet button. Close with X or backdrop click.

- [ ] **Step 5: Commit**

```bash
git add src/components/betslip/BetSlip.tsx src/components/betslip/DirectionToggle.tsx src/app/page.tsx
git commit -m "feat: add BetSlip sheet/modal with DirectionToggle"
```

---

## Task 8: Stake Input (Numeric Keypad)

**Files:**
- Create: `src/components/betslip/StakeInput.tsx`
- Modify: `src/components/betslip/BetSlip.tsx`

- [ ] **Step 1: Create StakeInput**

Create `src/components/betslip/StakeInput.tsx`:

```tsx
"use client";

type StakeInputProps = {
  stake: number;
  onStakeChange: (stake: number) => void;
};

export function StakeInput({ stake, onStakeChange }: StakeInputProps) {
  // Store as string internally for clean input handling
  const displayValue = stake > 0 ? `£${stake.toFixed(2)}` : "£0.00";

  const handleKey = (key: string) => {
    if (key === "clear") {
      onStakeChange(0);
      return;
    }
    if (key === "backspace") {
      // Remove last digit: multiply by 100, floor, remove last digit, divide by 100
      const cents = Math.floor(stake * 100);
      const newCents = Math.floor(cents / 10);
      onStakeChange(newCents / 100);
      return;
    }
    // Append digit: treat stake as pence, shift left, add new digit
    const digit = parseInt(key);
    const cents = Math.floor(stake * 100);
    const newCents = cents * 10 + digit;
    // Cap at £9999.99
    if (newCents > 999999) return;
    onStakeChange(newCents / 100);
  };

  const quickStakes = [5, 10, 25, 50];

  return (
    <div>
      {/* Display */}
      <div className="text-center text-[28px] font-bold text-gray-900 py-2 mb-s border-b-2 border-teal-600">
        {displayValue}
      </div>

      {/* Quick stake buttons */}
      <div className="flex gap-xs mb-s">
        {quickStakes.map((amount) => (
          <button
            key={amount}
            onClick={() => onStakeChange(amount)}
            className="flex-1 py-1.5 text-sub font-bold text-teal-600 bg-teal-100 rounded-sm hover:bg-teal-300 transition-colors"
          >
            £{amount}
          </button>
        ))}
      </div>

      {/* Numeric keypad */}
      <div className="grid grid-cols-3 gap-1">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "backspace"].map(
          (key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="py-3 text-body font-bold text-gray-700 bg-gray-50 rounded-sm hover:bg-gray-100 transition-colors"
            >
              {key === "clear" ? "C" : key === "backspace" ? "⌫" : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace stake placeholder in BetSlip**

In `src/components/betslip/BetSlip.tsx`, add the import at the top:

```tsx
import { StakeInput } from "./StakeInput";
```

Then replace the stake section (the `{/* Stake input — placeholder, built in next task */}` block and its surrounding div) with:

```tsx
            {/* Stake input */}
            <div className="mb-m">
              <p className="text-sub text-gray-500 mb-xs">Stake</p>
              <StakeInput stake={stake} onStakeChange={setStake} />
            </div>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Open a bet slip. Tap quick stakes (£5, £10, £25, £50). Use the keypad to enter a custom amount. Verify C clears and backspace removes the last digit. Place Bet button should enable when stake > 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/betslip/StakeInput.tsx src/components/betslip/BetSlip.tsx
git commit -m "feat: add numeric keypad StakeInput component"
```

---

## Task 9: Payout Graph & Payout Text

**Files:**
- Create: `src/components/betslip/PayoutGraph.tsx`
- Create: `src/components/betslip/PayoutText.tsx`
- Modify: `src/components/betslip/BetSlip.tsx`

- [ ] **Step 1: Create PayoutGraph**

Create `src/components/betslip/PayoutGraph.tsx`:

```tsx
"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Market, Direction } from "@/lib/types";
import { calculatePayout, PayoutOutcome } from "@/lib/payout";

type PayoutGraphProps = {
  market: Market;
  direction: Direction;
  stake: number;
};

export function PayoutGraph({ market, direction, stake }: PayoutGraphProps) {
  const result = calculatePayout(market, direction, stake);

  if (stake <= 0) {
    return (
      <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
        <p className="text-sub text-gray-400">Enter a stake to see payouts</p>
      </div>
    );
  }

  const data = result.outcomes.map((o) => ({
    outcome: o.outcome,
    payout: o.payout,
    label: `${o.outcome}`,
  }));

  // Pick max 5 x-axis labels, evenly spaced
  const labelIndices = pickLabelIndices(data.length, 5);

  const maxPayout = Math.max(...data.map((d) => d.payout));
  const yDomain = [0, Math.ceil(maxPayout * 1.1)];

  if (market.type === "discrete") {
    return (
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="outcome"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(value, index) =>
                labelIndices.includes(index) ? `${value} ${market.unit}` : ""
              }
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(value) => `£${value}`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <ReferenceLine y={stake} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Bar dataKey="payout" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.payout >= stake ? "#168D99" : "#BD2A2E"}
                  fillOpacity={entry.payout >= stake ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Continuous (line) chart
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="outcome"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(value, index) =>
              labelIndices.includes(index) ? `${value}${market.unit}` : ""
            }
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(value) => `£${value}`}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <ReferenceLine y={stake} stroke="#e5e7eb" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="payout"
            stroke="#168D99"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function pickLabelIndices(total: number, max: number): number[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i);
  const indices: number[] = [0];
  const step = (total - 1) / (max - 1);
  for (let i = 1; i < max - 1; i++) {
    indices.push(Math.round(step * i));
  }
  indices.push(total - 1);
  return indices;
}
```

- [ ] **Step 2: Create PayoutText**

Create `src/components/betslip/PayoutText.tsx`:

```tsx
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
  const perPoint = result.perPoint;

  if (direction === "buy") {
    const lines: string[] = [];
    lines.push(
      `For every additional ${market.unit === "%" ? "point" : market.unit.slice(0, -1)} above ${price}, your returns increase by £${perPoint.toFixed(2)}.`
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

  // Sell direction
  const lines: string[] = [];
  lines.push(
    `For every additional ${market.unit === "%" ? "point" : market.unit.slice(0, -1)} below ${price}, your returns increase by £${perPoint.toFixed(2)}.`
  );
  lines.push(
    `At ${result.stopLevel} ${market.unit === "%" ? "%" : market.unit} or more, you return £0.`
  );
  return <p className="text-sub text-gray-500">{lines.join(" ")}</p>;
}
```

- [ ] **Step 3: Wire graph and text into BetSlip**

In `src/components/betslip/BetSlip.tsx`, add imports at the top:

```tsx
import { PayoutGraph } from "./PayoutGraph";
import { PayoutText } from "./PayoutText";
```

Replace the payout graph placeholder (`{/* Payout graph placeholder — built in task 9 */}` block) with:

```tsx
            {/* Payout graph */}
            <div className="mb-s">
              <PayoutGraph market={market} direction={direction} stake={stake} />
            </div>

            {/* Payout text */}
            <div className="mb-m">
              <PayoutText market={market} direction={direction} stake={stake} />
            </div>
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Open Total Goals bet slip, enter £10 stake. Expect: bar chart with red bars below break-even and teal bars above. Payout text below the graph describing the returns. Toggle to Sell — graph should invert. Open Win Match % — expect a line chart instead of bars.

- [ ] **Step 5: Commit**

```bash
git add src/components/betslip/PayoutGraph.tsx src/components/betslip/PayoutText.tsx src/components/betslip/BetSlip.tsx
git commit -m "feat: add PayoutGraph and PayoutText with real-time calculation"
```

---

## Task 10: My Bets Screen

**Files:**
- Create: `src/components/mybets/BetCard.tsx`
- Create: `src/components/mybets/OpenPositions.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create BetCard**

Create `src/components/mybets/BetCard.tsx`:

```tsx
"use client";

import { PlacedBet } from "@/lib/types";
import { PayoutGraph } from "@/components/betslip/PayoutGraph";

type BetCardProps = {
  bet: PlacedBet;
};

export function BetCard({ bet }: BetCardProps) {
  const { market, direction, stake, entryPrice, pnl } = bet;
  const eventParts = market.eventId.split("-");

  return (
    <div className="bg-white rounded-md border border-gray-200 p-m">
      <div className="flex justify-between items-start mb-s">
        <div>
          <p className="text-section-title text-gray-600">{market.name}</p>
          <p className="text-sub text-gray-400">{market.eventId}</p>
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
```

- [ ] **Step 2: Create OpenPositions**

Create `src/components/mybets/OpenPositions.tsx`:

```tsx
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
```

- [ ] **Step 3: Wire My Bets into the page**

In `src/app/page.tsx`, add imports:

```tsx
import { OpenPositions } from "@/components/mybets/OpenPositions";
```

Replace the My Bets placeholder:

```tsx
          {activeTab === "markets" ? (
            <MarketList
              markets={fixture.markets}
              onSelectMarket={handleSelectMarket}
            />
          ) : (
            <OpenPositions onGoToMarkets={() => setActiveTab("markets")} />
          )}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Place a bet (enter stake, click Place Bet). Switch to My Bets tab. Expect: bet card with market name, direction badge, entry price, stake, P&L (£0.00), and a mini payout graph. Badge count on My Bets tab should show "1". Go back to Markets, place another bet. Verify count increments and both cards appear.

Test the empty state: refresh the page, switch to My Bets. Expect "No open bets" with "Go to Markets" button.

- [ ] **Step 5: Commit**

```bash
git add src/components/mybets/ src/app/page.tsx
git commit -m "feat: add My Bets screen with BetCard and OpenPositions"
```

---

## Task 11: Fixture Selector

**Files:**
- Modify: `src/app/page.tsx`

The prototype defaults to the first fixture. Add a simple fixture tab bar below the header so stakeholders can switch between matches.

- [ ] **Step 1: Add fixture selector to page**

Update `src/app/page.tsx` — add a fixture index state and a tab bar:

```tsx
"use client";

import { useState } from "react";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { MarketList } from "@/components/market/MarketList";
import { BetSlip } from "@/components/betslip/BetSlip";
import { OpenPositions } from "@/components/mybets/OpenPositions";
import { fixtures } from "@/data/fixtures";
import { Market, Direction } from "@/lib/types";

type Tab = "markets" | "mybets";

type SlipState = {
  market: Market;
  direction: Direction;
} | null;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("markets");
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const [slipState, setSlipState] = useState<SlipState>(null);
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

        {/* Fixture selector */}
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
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expect: fixture tabs below the header (Arsenal v Chelsea, Liverpool v Man City, Tottenham v Newcastle). Switching tabs updates the header and market list. Fixture tabs should be horizontally scrollable on narrow screens.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add fixture selector tabs"
```

---

## Task 12: BetSlip Event Name Fix

**Files:**
- Modify: `src/components/betslip/BetSlip.tsx`
- Modify: `src/components/mybets/BetCard.tsx`
- Modify: `src/lib/types.ts`

The bet slip currently shows the `eventId` (e.g. "ars-che") instead of a readable event name. Fix this by adding `eventName` to the `Market` type and data.

- [ ] **Step 1: Add eventName to Market type**

In `src/lib/types.ts`, add `eventName` to the `Market` type:

```ts
export type Market = {
  id: string;
  name: string;
  eventId: string;
  eventName: string; // e.g. "Arsenal vs Chelsea"
  type: MarketType;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  limitLevel: number | null;
  minOutcome: number;
  maxOutcome: number;
  step: number;
};
```

- [ ] **Step 2: Add eventName to all fixture data**

In `src/data/fixtures.ts`, add `eventName` to every market object. For Arsenal vs Chelsea markets:

```ts
eventName: "Arsenal vs Chelsea",
```

For Liverpool vs Man City markets:

```ts
eventName: "Liverpool vs Man City",
```

For Tottenham vs Newcastle markets:

```ts
eventName: "Tottenham vs Newcastle",
```

- [ ] **Step 3: Update BetSlip to use eventName**

In `src/components/betslip/BetSlip.tsx`, replace `market.eventId` with `market.eventName` in the header section:

```tsx
                <p className="text-sub text-gray-500">{market.eventName}</p>
```

- [ ] **Step 4: Update BetCard to use eventName**

In `src/components/mybets/BetCard.tsx`, replace `market.eventId` with `market.eventName`:

```tsx
          <p className="text-sub text-gray-400">{market.eventName}</p>
```

- [ ] **Step 5: Update payout test market fixtures**

In `src/lib/__tests__/payout.test.ts`, add `eventName` to both test market objects:

```ts
eventName: "Test Event",
```

- [ ] **Step 6: Verify in browser and run tests**

```bash
npm test && npm run dev
```

Open a bet slip. Verify it shows "Arsenal vs Chelsea" (or whichever fixture) instead of "ars-che". Check My Bets cards too.

- [ ] **Step 7: Commit**

```bash
git add src/lib/types.ts src/data/fixtures.ts src/components/betslip/BetSlip.tsx src/components/mybets/BetCard.tsx src/lib/__tests__/payout.test.ts
git commit -m "fix: show readable event name in bet slip and bet cards"
```

---

## Task 13: GitHub Repo & Vercel Deployment

**Files:**
- Create: `.gitignore` (already created by create-next-app)

- [ ] **Step 1: Create GitHub repo**

```bash
cd /Users/alex/Projects/lrsb-prototype
gh repo create lrsb-prototype --public --source=. --push
```

This creates the repo on GitHub and pushes all commits.

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --yes
```

This links the project to Vercel and triggers the first deployment. Follow any prompts to link your Vercel account.

- [ ] **Step 3: Set up automatic deploys**

```bash
npx vercel --prod --yes
```

After this, every push to `main` will auto-deploy via the Vercel GitHub integration.

- [ ] **Step 4: Verify deployment**

Open the Vercel URL provided in the output. Verify:
- Phone frame renders with Arsenal vs Chelsea header
- Market cards show buy/sell prices
- Bet slip opens on tap
- Payout graph renders with correct chart types
- Place bet flow works and bet appears in My Bets
- Device frame toggle works

- [ ] **Step 5: Commit any Vercel config changes**

```bash
git add -A
git diff --cached --stat
# Only commit if there are changes (e.g. .vercel/ config)
git commit -m "chore: add Vercel deployment config" || true
git push
```

---

## Task 14: Final Polish & Verification

**Files:**
- Potentially any component file for minor fixes

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All payout tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: End-to-end browser walkthrough**

Open the local dev server and walk through:

1. Default view shows phone frame with Arsenal vs Chelsea
2. Switch fixtures via tabs — header and markets update
3. Open Total Goals bet slip (buy) — bar chart, enter £10
4. Toggle to Sell — graph inverts, prices update
5. Place bet — confirmation shows, bet appears in My Bets
6. Open Win Match % — line chart renders correctly
7. Open Supremacy — negative x-axis values shown
8. Toggle device frame off — content goes full-width, bet slip becomes modal
9. My Bets shows all placed bets with mini graphs
10. Empty state when no bets placed (refresh page, check My Bets)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final polish and fixes" || true
git push
```

- [ ] **Step 5: Share deployment URL**

The Vercel URL is the shareable prototype link for stakeholders.
