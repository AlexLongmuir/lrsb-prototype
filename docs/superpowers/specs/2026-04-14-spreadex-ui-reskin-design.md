# Spreadex UI Reskin — Design Spec

**Date:** 2026-04-14
**Goal:** Make the LRSB prototype visually match the real Spreadex mobile site. Rebuild the page layer and market display while keeping the bet placement engine untouched.

## Approach

Rebuild the page layer (header, navigation, market display) from scratch to match Spreadex's layout and design language. Keep the "engine" intact: BetsContext, payout.ts, BetSlip and its children, OpenPositions, BetCard.

Single fixture only (Arsenal v Chelsea). No fixture switcher.

---

## 1. Color Scheme & Design Tokens

Replace the teal palette with Spreadex's dark/red/white scheme.

| Token | Old Value | New Value | Usage |
|---|---|---|---|
| `--color-primary-red` | (new) | `#E53935` | Active toggle, active tab underline, accent |
| `--color-header-bg` | (new) | `#1A1A1A` | Header and bottom nav background |
| `--color-surface` | (new) | `#FFFFFF` | Card/content backgrounds |
| `--color-page-bg` | `#F5F5F5` | `#F5F5F5` | Page background (unchanged) |
| `--color-border` | (new) | `#E0E0E0` | Dividers between market rows |
| `--color-text-primary` | (new) | `#1A1A1A` | Primary text |
| `--color-text-secondary` | (new) | `#757575` | Secondary/muted text |
| `--color-spread-bg` | (new) | `#F0F0F0` | Background for spread value pills |
| `--color-success` | `#39C172` | `#39C172` | Unchanged — positive P&L |
| `--color-danger` | `#BD2A2E` | `#BD2A2E` | Unchanged — sell/negative |

Remove: `teal-100`, `teal-300`, `teal-500`, `teal-600`, `teal-700`, `teal-900`.

Font family stays Arial/Helvetica/sans-serif (matches Spreadex).

Spacing and radius tokens stay as-is — they work for the new layout.

---

## 2. Page Layout (Top to Bottom)

All wrapped in existing `DeviceFrame.tsx` (unchanged).

### 2a. Header Bar (`Header.tsx` — replace)

Dark background (`header-bg`), single row, ~44px tall.

- **Left:** Back chevron (decorative) + search icon (decorative)
- **Center:** "SPREADEX" text in red bold (no SVG — plain text is sufficient)
- **Right:** Static balance text ("Spr Bal: -£188.74" etc.) in small white text + avatar circle
- All decorative — no functionality needed

### 2b. Match Title (`MatchTitle.tsx` — new)

White background row below header.

- Center: "Arsenal v Chelsea" in bold, dropdown chevron after text
- Right edge: forward arrow chevron
- Both decorative

### 2c. Spread Betting / Fixed Odds Toggle (`BettingToggle.tsx` — new)

Centered below match title, small padding.

- Two pill buttons side by side with red border
- "Spread Betting" — filled red background, white text (active)
- "Fixed Odds" — white background, red text/border (inactive)
- Non-functional — purely visual

### 2d. Category Tabs (`CategoryTabs.tsx` — new)

Horizontal scrolling tab bar.

- Tabs: "Main", "Bet-Builder", "Popular BBs", "Players", "Corners", "Cards"
- Active tab: red underline, bold text
- Inactive: gray text, no underline
- **Functional** — selecting a tab filters which market groups are visible
- "Main" is default active tab
- "Bet-Builder" and "Popular BBs" are decorative (no market groups mapped to them)

### 2e. Market Groups (`MarketGroup.tsx` — new)

Scrollable content area with market group accordion sections.

Each group:
- **Header row:** Bold title (e.g. "Match Result"), chart icon (decorative), chevron toggle
- Chevron rotates on collapse/expand
- **Body:** List of `MarketRow` components, separated by 1px `border` dividers
- All groups start expanded

### 2f. Market Rows (`MarketRow.tsx` — new)

Single market within a group. Full-width row.

- Left: Info icon (ⓘ) — decorative
- Center: Market name (e.g. "Arsenal to win match")
- Right: Spread values in gray pill (e.g. "61.7 - 63.9") + right chevron
- Tapping the row opens `BetSlip` with that market (same interaction as current MarketCard)
- The spread pill shows `sellPrice - buyPrice` formatted

### 2g. Bottom Nav (`BottomNav.tsx` — replace)

Dark background, 5 items.

| Item | Icon | Functional? |
|---|---|---|
| Home | House | Yes — shows markets (default) |
| My Bets | Diamond/gem | Yes — shows OpenPositions |
| In-Play | Clock | No — decorative |
| Promotions | Gift | No — decorative |
| More | Three dots | No — decorative |

Active item highlighted with red color. Inactive items in gray/white.

---

## 3. Data Model Changes

### New type: `MarketGroup`

```ts
type MarketGroup = {
  id: string;
  name: string;       // Display name: "Match Result", "Popular Markets"
  category: string;   // Maps to tab: "main", "players", "corners", "cards"
  markets: Market[];
};
```

### Updated `Fixture` type

```ts
type Fixture = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickOff: string;
  marketGroups: MarketGroup[];  // replaces markets: Market[]
};
```

### Fixture Data (Arsenal v Chelsea)

**Main tab:**

"Match Result" group:
- Arsenal to win match — sell: 61.7, buy: 63.9, type: continuous, range: 0-100, unit: %
- Match to be drawn — sell: 20.8, buy: 23.2, type: continuous, range: 0-100, unit: %
- Chelsea to win match — sell: 15.1, buy: 17.5, type: continuous, range: 0-100, unit: %

"Popular Markets" group:
- Arsenal/Chelsea (0-0) — sell: 1, buy: 1.2, type: discrete, range: 0-6, unit: goals
- Total Goals (0) — sell: 2.5, buy: 2.8, type: discrete, range: 0-8, unit: goals
- Shirt Numbers (0) — sell: 43, buy: 46, type: discrete, range: 0-100, unit: shirts
- Bookings (0) — sell: 36, buy: 40, type: discrete, range: 0-80, unit: points

**Players tab:**

"Goal Scorers" group:
- Saka — sell: 15, buy: 18, type: continuous, range: 0-100, unit: %
- Havertz — sell: 13, buy: 16, type: continuous, range: 0-100, unit: %
- Palmer — sell: 12, buy: 15, type: continuous, range: 0-100, unit: %
- Jackson — sell: 11, buy: 14, type: continuous, range: 0-100, unit: %

**Corners tab:**

"Corners" group:
- Total Corners — sell: 10.5, buy: 11.5, type: discrete, range: 0-20, unit: corners
- Arsenal Corners — sell: 5.5, buy: 6.5, type: discrete, range: 0-15, unit: corners
- Chelsea Corners — sell: 4.5, buy: 5.5, type: discrete, range: 0-15, unit: corners

**Cards tab:**

"Cards" group:
- Total Cards — sell: 3.5, buy: 4.5, type: discrete, range: 0-12, unit: cards
- Arsenal Cards — sell: 1.8, buy: 2.2, type: discrete, range: 0-8, unit: cards
- Chelsea Cards — sell: 1.6, buy: 2.0, type: discrete, range: 0-8, unit: cards

### Impact on Existing Code

- `PlacedBet` references `Market` directly — **unaffected**
- `BetsContext` — **unaffected**
- `payout.ts` — **unaffected**
- `page.tsx` — iterates `fixture.marketGroups` instead of `fixture.markets`

---

## 4. Component Inventory

| Component | Action | Notes |
|---|---|---|
| `Header.tsx` | **Replace** | Dark header, logo, decorative balance/icons |
| `MatchTitle.tsx` | **New** | Match name row with chevrons |
| `BettingToggle.tsx` | **New** | Spread Betting / Fixed Odds pills (decorative) |
| `CategoryTabs.tsx` | **New** | Horizontal scroll tabs, filters market groups |
| `MarketGroup.tsx` | **New** | Accordion: title + collapsible market list |
| `MarketRow.tsx` | **New** | Info icon + name + spread pill + chevron |
| `BottomNav.tsx` | **Replace** | 5-item dark nav bar |
| `MarketList.tsx` | **Remove** | Replaced by CategoryTabs + MarketGroup |
| `MarketCard.tsx` | **Remove** | Replaced by MarketRow |
| `page.tsx` | **Rewrite** | New layout, single fixture, new components |
| `globals.css` | **Rewrite** | New color tokens |
| `fixtures.ts` | **Rewrite** | Single fixture, grouped markets |
| `types.ts` | **Update** | Add MarketGroup, update Fixture |
| `DeviceFrame.tsx` | **Keep** | Unchanged |
| `BetSlip.tsx` | **Keep** | Unchanged |
| `DirectionToggle.tsx` | **Keep** | Unchanged |
| `StakeInput.tsx` | **Keep** | Unchanged |
| `PayoutGraph.tsx` | **Keep** | Unchanged |
| `PayoutText.tsx` | **Keep** | Unchanged |
| `BetsContext.tsx` | **Keep** | Unchanged |
| `payout.ts` | **Keep** | Unchanged |
| `OpenPositions.tsx` | **Keep** | Unchanged |
| `BetCard.tsx` | **Keep** | Unchanged |

---

## 5. What's NOT Changing

- The entire bet placement flow (BetSlip → DirectionToggle → StakeInput → PayoutGraph → PayoutText → confirm)
- Payout calculation engine
- BetsContext state management
- My Bets view (OpenPositions + BetCard)
- DeviceFrame wrapper
- The Market type itself (buyPrice, sellPrice, type, etc.)
