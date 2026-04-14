# Spreadex UI Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the LRSB prototype to visually match the real Spreadex mobile site — dark header, red accents, grouped market rows, 5-item bottom nav.

**Architecture:** Rebuild the page layer (header, market display, navigation) while keeping the bet placement engine (BetSlip, BetsContext, payout.ts) untouched. New components: Header, MatchTitle, BettingToggle, CategoryTabs, MarketGroup, MarketRow. Data model adds MarketGroup type and restructures fixtures into grouped markets.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-04-14-spreadex-ui-reskin-design.md`

---

## File Map

**Create:**
- `src/components/layout/MatchTitle.tsx` — match name row with decorative chevrons
- `src/components/layout/BettingToggle.tsx` — Spread Betting / Fixed Odds pill toggle
- `src/components/market/CategoryTabs.tsx` — horizontal scrolling category tab bar
- `src/components/market/MarketGroup.tsx` — collapsible accordion for a group of markets
- `src/components/market/MarketRow.tsx` — single market row (name + spread pill)

**Rewrite:**
- `src/app/globals.css` — new color tokens (dark/red/white Spreadex palette)
- `src/lib/types.ts` — add MarketGroup, update Fixture
- `src/data/fixtures.ts` — single fixture with grouped markets
- `src/components/layout/Header.tsx` — dark header with logo, balance, icons
- `src/components/layout/BottomNav.tsx` — 5-item dark nav bar
- `src/app/page.tsx` — new layout composing all new components

**Update:**
- `src/components/betslip/BetSlip.tsx` — replace teal color references with new palette

**Remove:**
- `src/components/market/MarketList.tsx` — replaced by CategoryTabs + MarketGroup
- `src/components/market/MarketCard.tsx` — replaced by MarketRow

---

### Task 1: Update Design Tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the theme tokens in globals.css**

Replace the full contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@theme inline {
  /* Spreadex palette */
  --color-primary-red: #E53935;
  --color-header-bg: #1A1A1A;
  --color-surface: #FFFFFF;
  --color-page-bg: #F5F5F5;
  --color-border: #E0E0E0;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #757575;
  --color-spread-bg: #F0F0F0;
  --color-success: #39C172;
  --color-danger: #BD2A2E;
  --color-warning: #FCCE2B;

  /* Font family */
  --font-sans: Arial, Helvetica, sans-serif;

  /* Spacing */
  --spacing-xs: 5px;
  --spacing-s: 10px;
  --spacing-m: 15px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-pill: 100px;

  /* Font sizes */
  --text-page-title: 16px;
  --text-page-title--font-weight: 700;
  --text-page-title--line-height: 1.3;

  --text-section-title: 12px;
  --text-section-title--font-weight: 700;
  --text-section-title--line-height: 1.3;

  --text-body: 16px;
  --text-body--font-weight: 400;
  --text-body--line-height: 1.4;

  --text-sub: 12px;
  --text-sub--font-weight: 400;
  --text-sub--line-height: 1.3;

  --text-legal: 10px;
  --text-legal--font-weight: 400;
  --text-legal--line-height: 1.3;
}

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

- [ ] **Step 2: Verify the dev server starts without errors**

Run: `cd /Users/alex/Projects/lrsb-prototype && npx next dev --port 3111`

Expected: Server starts. The page will look broken (teal classes no longer resolve) — that's expected since we haven't updated components yet.

Stop the dev server after confirming it starts.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor: replace teal palette with Spreadex dark/red/white tokens"
```

---

### Task 2: Update Types and Fixture Data

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/data/fixtures.ts`

- [ ] **Step 1: Add MarketGroup type and update Fixture in types.ts**

Replace the full contents of `src/lib/types.ts` with:

```ts
export type MarketType = "discrete" | "continuous";
export type Direction = "buy" | "sell";

export type Market = {
  id: string;
  name: string;
  eventId: string;
  eventName: string;
  type: MarketType;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  limitLevel: number | null;
  minOutcome: number;
  maxOutcome: number;
  step: number;
};

export type MarketGroup = {
  id: string;
  name: string;
  category: string;
  markets: Market[];
};

export type Fixture = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickOff: string;
  marketGroups: MarketGroup[];
};

export type PlacedBet = {
  id: string;
  market: Market;
  direction: Direction;
  stake: number;
  entryPrice: number;
  pnl: number;
};
```

- [ ] **Step 2: Rewrite fixtures.ts with single grouped fixture**

Replace the full contents of `src/data/fixtures.ts` with:

```ts
import { Fixture } from "@/lib/types";

export const fixture: Fixture = {
  id: "ars-che",
  homeTeam: "Arsenal",
  awayTeam: "Chelsea",
  competition: "Premier League",
  kickOff: "Sat 15:00",
  marketGroups: [
    {
      id: "match-result",
      name: "Match Result",
      category: "main",
      markets: [
        {
          id: "ars-che-ars-win",
          name: "Arsenal to win match",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 63.9,
          sellPrice: 61.7,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
        {
          id: "ars-che-draw",
          name: "Match to be drawn",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 23.2,
          sellPrice: 20.8,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
        {
          id: "ars-che-che-win",
          name: "Chelsea to win match",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 17.5,
          sellPrice: 15.1,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
      ],
    },
    {
      id: "popular-markets",
      name: "Popular Markets",
      category: "main",
      markets: [
        {
          id: "ars-che-supremacy",
          name: "Arsenal/Chelsea (0-0)",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 1.2,
          sellPrice: 1,
          unit: "goals",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 6,
          step: 1,
        },
        {
          id: "ars-che-goals",
          name: "Total Goals (0)",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
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
          id: "ars-che-shirts",
          name: "Shirt Numbers (0)",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 46,
          sellPrice: 43,
          unit: "shirts",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 100,
          step: 1,
        },
        {
          id: "ars-che-bookings",
          name: "Bookings (0)",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 40,
          sellPrice: 36,
          unit: "points",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 80,
          step: 1,
        },
      ],
    },
    {
      id: "goal-scorers",
      name: "Goal Scorers",
      category: "players",
      markets: [
        {
          id: "ars-che-saka",
          name: "Saka",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 18,
          sellPrice: 15,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
        {
          id: "ars-che-havertz",
          name: "Havertz",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 16,
          sellPrice: 13,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
        {
          id: "ars-che-palmer",
          name: "Palmer",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 15,
          sellPrice: 12,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
        {
          id: "ars-che-jackson",
          name: "Jackson",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "continuous",
          buyPrice: 14,
          sellPrice: 11,
          unit: "%",
          limitLevel: 100,
          minOutcome: 0,
          maxOutcome: 100,
          step: 10,
        },
      ],
    },
    {
      id: "corners-group",
      name: "Corners",
      category: "corners",
      markets: [
        {
          id: "ars-che-total-corners",
          name: "Total Corners",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
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
          id: "ars-che-ars-corners",
          name: "Arsenal Corners",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 6.5,
          sellPrice: 5.5,
          unit: "corners",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 15,
          step: 1,
        },
        {
          id: "ars-che-che-corners",
          name: "Chelsea Corners",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 5.5,
          sellPrice: 4.5,
          unit: "corners",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 15,
          step: 1,
        },
      ],
    },
    {
      id: "cards-group",
      name: "Cards",
      category: "cards",
      markets: [
        {
          id: "ars-che-total-cards",
          name: "Total Cards",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 4.5,
          sellPrice: 3.5,
          unit: "cards",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 12,
          step: 1,
        },
        {
          id: "ars-che-ars-cards",
          name: "Arsenal Cards",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 2.2,
          sellPrice: 1.8,
          unit: "cards",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 8,
          step: 1,
        },
        {
          id: "ars-che-che-cards",
          name: "Chelsea Cards",
          eventId: "ars-che",
          eventName: "Arsenal vs Chelsea",
          type: "discrete",
          buyPrice: 2.0,
          sellPrice: 1.6,
          unit: "cards",
          limitLevel: null,
          minOutcome: 0,
          maxOutcome: 8,
          step: 1,
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/alex/Projects/lrsb-prototype && npx tsc --noEmit 2>&1 | head -20`

Expected: Errors in `page.tsx` (references `fixtures` array and `fixture.markets`) — this is expected and will be fixed in Task 8. No errors in `types.ts` or `fixtures.ts` themselves.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/data/fixtures.ts
git commit -m "feat: add MarketGroup type and restructure fixture data"
```

---

### Task 3: Build Header Component

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Rewrite Header.tsx**

Replace the full contents of `src/components/layout/Header.tsx` with:

```tsx
type HeaderProps = {
  homeTeam: string;
  awayTeam: string;
};

export function Header({ homeTeam, awayTeam }: HeaderProps) {
  return (
    <div className="bg-header-bg text-white">
      {/* Top bar: back, search, logo, balance, avatar */}
      <div className="flex items-center justify-between px-m py-2">
        <div className="flex items-center gap-3">
          <span className="text-body">&#x276E;</span>
          <span className="text-sub font-bold">Back</span>
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-page-title text-primary-red font-bold tracking-wide">SPREADEX</span>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-legal text-gray-400">Spr Bal: -£188.74</p>
            <p className="text-legal text-gray-400">Spr Av: £4,811.26</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: replace Header with Spreadex dark header bar"
```

---

### Task 4: Build MatchTitle Component

**Files:**
- Create: `src/components/layout/MatchTitle.tsx`

- [ ] **Step 1: Create MatchTitle.tsx**

Create `src/components/layout/MatchTitle.tsx` with:

```tsx
type MatchTitleProps = {
  homeTeam: string;
  awayTeam: string;
};

export function MatchTitle({ homeTeam, awayTeam }: MatchTitleProps) {
  return (
    <div className="bg-surface flex items-center justify-between px-m py-2 border-b border-border">
      <div className="flex items-center gap-1">
        <span className="text-body font-bold text-text-primary">
          {homeTeam} v {awayTeam}
        </span>
        <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MatchTitle.tsx
git commit -m "feat: add MatchTitle component"
```

---

### Task 5: Build BettingToggle Component

**Files:**
- Create: `src/components/layout/BettingToggle.tsx`

- [ ] **Step 1: Create BettingToggle.tsx**

Create `src/components/layout/BettingToggle.tsx` with:

```tsx
export function BettingToggle() {
  return (
    <div className="flex justify-center py-3 bg-surface border-b border-border">
      <div className="flex rounded-pill border border-primary-red overflow-hidden">
        <button className="px-4 py-1.5 text-sub font-bold bg-primary-red text-white">
          Spread Betting
        </button>
        <button className="px-4 py-1.5 text-sub font-bold text-primary-red bg-surface">
          Fixed Odds
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/BettingToggle.tsx
git commit -m "feat: add BettingToggle component (decorative)"
```

---

### Task 6: Build CategoryTabs Component

**Files:**
- Create: `src/components/market/CategoryTabs.tsx`

- [ ] **Step 1: Create CategoryTabs.tsx**

Create `src/components/market/CategoryTabs.tsx` with:

```tsx
"use client";

export const CATEGORIES = [
  { id: "main", label: "Main" },
  { id: "bet-builder", label: "Bet-Builder" },
  { id: "popular-bbs", label: "Popular BBs" },
  { id: "players", label: "Players" },
  { id: "corners", label: "Corners" },
  { id: "cards", label: "Cards" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

type CategoryTabsProps = {
  activeCategory: CategoryId;
  onCategoryChange: (category: CategoryId) => void;
};

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="bg-surface border-b border-border overflow-x-auto">
      <div className="flex">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex-shrink-0 px-m py-2.5 text-sub whitespace-nowrap border-b-2 transition-colors ${
              activeCategory === cat.id
                ? "text-primary-red font-bold border-primary-red"
                : "text-text-secondary border-transparent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/market/CategoryTabs.tsx
git commit -m "feat: add CategoryTabs with horizontal scrolling"
```

---

### Task 7: Build MarketRow and MarketGroup Components

**Files:**
- Create: `src/components/market/MarketRow.tsx`
- Create: `src/components/market/MarketGroup.tsx`

- [ ] **Step 1: Create MarketRow.tsx**

Create `src/components/market/MarketRow.tsx` with:

```tsx
import { Market, Direction } from "@/lib/types";

type MarketRowProps = {
  market: Market;
  onSelect: (market: Market, direction: Direction) => void;
  showDivider: boolean;
};

export function MarketRow({ market, onSelect, showDivider }: MarketRowProps) {
  return (
    <button
      onClick={() => onSelect(market, "buy")}
      className={`w-full flex items-center gap-2 px-m py-3 text-left hover:bg-gray-50 transition-colors ${
        showDivider ? "border-t border-border" : ""
      }`}
    >
      <span className="text-sub text-text-secondary flex-shrink-0">&#9432;</span>
      <span className="text-sub text-text-primary flex-1 min-w-0 truncate">
        {market.name}
      </span>
      <span className="flex-shrink-0 bg-spread-bg text-sub font-bold text-text-primary px-2.5 py-1 rounded-sm">
        {market.sellPrice % 1 === 0 && market.buyPrice % 1 === 0
          ? `${market.sellPrice} - ${market.buyPrice}`
          : `${market.sellPrice.toFixed(1)} - ${market.buyPrice.toFixed(1)}`}
      </span>
      <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: Create MarketGroup.tsx**

Create `src/components/market/MarketGroup.tsx` with:

```tsx
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
        <span className="text-body font-bold text-text-primary">{name}</span>
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/market/MarketRow.tsx src/components/market/MarketGroup.tsx
git commit -m "feat: add MarketGroup accordion and MarketRow components"
```

---

### Task 8: Replace BottomNav

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Rewrite BottomNav.tsx**

Replace the full contents of `src/components/layout/BottomNav.tsx` with:

```tsx
"use client";

import { useBets } from "@/context/BetsContext";

type Tab = "markets" | "mybets";

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

type NavItem = {
  id: string;
  label: string;
  tab: Tab | null;
  icon: React.ReactNode;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { bets } = useBets();

  const items: NavItem[] = [
    {
      id: "home",
      label: "Home",
      tab: "markets",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "mybets",
      label: "My Bets",
      tab: "mybets",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8l-4 4h3v4h2v-4h3l-4-4zM5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      id: "inplay",
      label: "In-Play",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      id: "promotions",
      label: "Promotions",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      id: "more",
      label: "More",
      tab: null,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky bottom-0 bg-header-bg flex">
      {items.map((item) => {
        const isActive =
          (item.tab === "markets" && activeTab === "markets") ||
          (item.tab === "mybets" && activeTab === "mybets");

        return (
          <button
            key={item.id}
            onClick={() => item.tab && onTabChange(item.tab)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 relative ${
              isActive ? "text-primary-red" : "text-gray-400"
            } ${item.tab ? "cursor-pointer" : "cursor-default"}`}
          >
            {item.icon}
            <span className="text-legal">{item.label}</span>
            {item.id === "mybets" && bets.length > 0 && (
              <span className="absolute top-1 right-1/4 bg-primary-red text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {bets.length}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/BottomNav.tsx
git commit -m "feat: replace BottomNav with 5-item Spreadex dark nav bar"
```

---

### Task 9: Update BetSlip Colors

**Files:**
- Modify: `src/components/betslip/BetSlip.tsx`

The BetSlip uses teal color classes that no longer exist. Replace them with the new palette.

- [ ] **Step 1: Update teal references in BetSlip.tsx**

Make these replacements in `src/components/betslip/BetSlip.tsx`:

1. Line 74: `bg-teal-100 text-teal-700` → `bg-red-50 text-primary-red`
2. Line 107: `bg-teal-600` → `bg-primary-red`
3. Line 107: `hover:bg-teal-900` → `hover:bg-red-700`

The exact strings to find and replace:

- `bg-teal-100 text-teal-700` → `bg-red-50 text-primary-red`
- `bg-teal-600 text-white text-sub font-bold py-3 rounded-md hover:bg-teal-900` → `bg-primary-red text-white text-sub font-bold py-3 rounded-md hover:bg-red-700`

- [ ] **Step 2: Commit**

```bash
git add src/components/betslip/BetSlip.tsx
git commit -m "fix: update BetSlip colors from teal to Spreadex red"
```

---

### Task 10: Rewrite Page and Clean Up

**Files:**
- Modify: `src/app/page.tsx`
- Remove: `src/components/market/MarketList.tsx`
- Remove: `src/components/market/MarketCard.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace the full contents of `src/app/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Delete old MarketList.tsx and MarketCard.tsx**

```bash
rm src/components/market/MarketList.tsx src/components/market/MarketCard.tsx
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

Run: `cd /Users/alex/Projects/lrsb-prototype && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 4: Verify dev server runs and page loads**

Run: `cd /Users/alex/Projects/lrsb-prototype && npx next dev --port 3111`

Expected: Page loads in browser at `http://localhost:3111` with:
- Dark header with SPREADEX logo, back button, balance text
- Match title "Arsenal v Chelsea"
- Red Spread Betting / Fixed Odds toggle
- Category tabs (Main active by default)
- Match Result and Popular Markets groups with expandable rows
- Switching tabs shows Players, Corners, Cards markets
- Tapping a market row opens BetSlip
- Bottom nav has 5 items, Home and My Bets functional

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: rewrite page with Spreadex layout, remove old market components"
```

---

### Task 11: Visual Polish Pass

**Files:**
- Potentially any of the new components

This task is for fixing visual issues found during browser testing after Task 10. Do NOT start this task until you've loaded the page in a browser and compared it to the Spreadex screenshot.

- [ ] **Step 1: Load the page and compare against the screenshot**

Open `http://localhost:3111` in a browser. Compare the prototype to the Spreadex screenshot side by side. Note any visual discrepancies in:
- Spacing / padding
- Font sizes / weights
- Color accuracy
- Alignment
- Component proportions

- [ ] **Step 2: Fix any discrepancies found**

Apply targeted fixes to the relevant component files. Common issues to watch for:
- Header feeling too tall or too short
- Tab text too large or too small
- Market row padding not matching
- Spread pill not the right shape/color
- Bottom nav icon sizes

- [ ] **Step 3: Commit fixes**

```bash
git add -A
git commit -m "fix: visual polish to match Spreadex design"
```
