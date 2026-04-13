# LRSB Prototype — Design Spec

**Date:** 2026-04-13
**Author:** Alex + Claude
**Status:** Draft

## Purpose

A high-fidelity interactive prototype of the Limited Risk Spread Betting (LRSB) bet slip and payout graph experience. Used for:

- Stakeholder demos (conveying the UX to non-technical reviewers)
- Prototyping interactions (stake entry, graph updates, buy/sell toggling)
- Exploring edge cases across market types

This is not production code. No backend, no auth, no live data. State resets on page refresh.

---

## Architecture

**Stack:** Next.js (App Router) + Tailwind CSS + Recharts
**Deployment:** Vercel (new repo, own URL)
**Repo:** `lrsb-prototype` on GitHub (new, separate from `spreadex-mobile-ui`)
**State management:** React context. No persistence.

### Directory structure

```
src/
  app/                — Next.js app router (single page)
  components/
    layout/           — DeviceFrame, BottomNav, Header
    market/           — MarketList, MarketCard
    betslip/          — BetSlip, PayoutGraph, StakeInput
    mybets/           — BetCard, OpenPositions
  data/               — Static fixtures, markets, prices
  lib/                — Payout calculation logic, types
  context/            — BetsContext (open bets state)
```

---

## Data Model

All data is hardcoded in `src/data/`. No API calls.

### Fixtures

3-4 realistic Premier League matches with plausible kick-off times. Example:
- Arsenal vs Chelsea (Sat 15:00)
- Liverpool vs Man City (Sat 17:30)
- Tottenham vs Newcastle (Sun 14:00)

### Market type definition

```ts
type Market = {
  id: string
  name: string               // "Total Goals"
  eventName: string          // "Arsenal vs Chelsea"
  type: "discrete" | "continuous"
  buyPrice: number           // e.g. 2.5
  sellPrice: number          // e.g. 2.3
  unit: string               // "goals", "corners", "%"
  stopLevel: number | null   // calculated from stake
  limitLevel: number | null
  minOutcome: number         // for x-axis bounds
  maxOutcome: number
}
```

### Market types included

| Market | Chart Type | X-Axis Range | Notes |
|--------|-----------|--------------|-------|
| Total Goals | Bar | 0, 1, 2... 8+ | Classic LR case. Stop on buy downside. |
| Supremacy | Bar | -4, -3... 0... +4 | Negative x-axis. Stop on both directions. |
| Win Match % (100 Index) | Line | 0-100 | Naturally bounded, no stop needed. |
| Total Corners | Bar | 0, 2, 4... 16+ | Wider range than Total Goals. |
| Total Runs (Cricket) | Line | 0-400+ | Continuous, large range. |

### Payout calculation

Lives in `src/lib/payout.ts`. Given a market, direction (buy/sell), stake, and per-point value, it returns:
- Stop level (where user loses full stake)
- Payout at each outcome point
- Maximum win (at limit level, if applicable)

The payout graph reads directly from this function. Recalculates on stake change.

---

## Screens

### 1. Event Page (default view)

- **Header:** Match name, kick-off time, competition
- **Market list:** Card per market showing name, buy price, sell price. Tapping a price opens the bet slip with that direction pre-selected.
- **Bottom nav:** Two tabs: "Markets" (default active) and "My Bets" (badge count of open positions)

### 2. Bet Slip

Opens as a **bottom sheet on mobile**, **centred modal on tablet/desktop**.

Components top to bottom:
1. **Mode pill** — subtle teal pill showing "Limited Risk"
2. **Header** — market name + event name, close button
3. **Direction toggle** — segmented control: Buy / Sell. Buy defaulted. Switching recalculates graph.
4. **Price display** — current buy or sell price
5. **Stake input** — custom numeric keypad (in-app keyboard style). Changing stake recalculates payout graph in real time.
6. **Payout graph** — bar chart (discrete markets) or line chart (continuous). X-axis: outcomes (max 5 labels). Y-axis: return in GBP. Loss region shaded red, profit region shaded teal.
7. **Payout text** — descriptive sentence below graph (e.g. "For every additional goal above 2.5, your returns increase by GBP10.00. At 0 goals or fewer, you return GBP0.")
8. **Place Bet button** — full-width teal-600 primary button. On tap: brief confirmation animation, bet added to My Bets, slip closes.

### 3. My Bets

- **Open positions list.** Each bet card shows:
  - Event name + market name
  - Direction (Buy/Sell) + entry price
  - Stake
  - Mini payout graph (simplified, smaller)
  - Current P&L display (static values, shows the layout)
- **Empty state:** "No open bets" with CTA to go to Markets

### 4. Device Frame

- **Default:** Phone frame (375px width) centred on screen with subtle shadow
- **Toggle:** Button in top-right corner: "Remove frame" / "Show frame"
- **Without frame:** Content goes responsive full-width. Bet slip switches from bottom sheet to centred modal.

---

## Design System (LRSB Design System v2)

### Colours

**Primary teal scale** (derived from Teal 600: #168D99):
- Teal 100: #E6F4F6 (backgrounds)
- Teal 300: #6DC2CC (hover states, borders)
- Teal 500: #1FA3B0 (secondary actions)
- Teal 600: #168D99 (primary buttons, links)
- Teal 700: #127780 (active states)
- Teal 900: #0A5059 (hover on primary buttons)

**Status:** Success #39C172, Danger #BD2A2E, Warning #FCCE2B

**Payout graph:** Teal for profit region, danger red for loss region.

### Typography

Font: Arial (system font stack, Arial first). All sizes in px.

| Role | Size | Weight |
|------|------|--------|
| Page title | 16px | Bold |
| Section title | 12px | Bold |
| Body | 16px | Regular |
| Sub text | 12px | Regular |
| Link | 12px | Regular, Teal 600 |
| Legal | 10px | Regular |

### Spacing

- XS: 5px, S: 10px, M: 15px
- Page margin: 15px

### Border radius

- Small: 4px, Medium: 10px, Pill: 100px

### Buttons

- Primary: teal-600 bg, 12px bold, 10px radius
- Hover: teal-900
- Disabled: grey-400

---

## Interaction Flow

1. User lands on event page (default fixture selected)
2. Taps a buy or sell price on a market card
3. Bet slip opens (sheet on mobile, modal on desktop)
4. Buy/Sell direction pre-selected based on what was tapped
5. User enters a stake via numeric keypad
6. Payout graph and text update in real time
7. User can toggle Buy/Sell — graph inverts
8. User taps "Place Bet"
9. Brief confirmation animation
10. Bet appears in My Bets tab (badge increments)
11. Slip closes, user returns to event page
12. User can tap My Bets tab to see open positions

---

## Out of Scope (v1)

- No persistence across page refresh
- No authentication or accounts
- No LR/FR mode switching
- No onboarding/education flow
- No in-play state changes (greyed-out impossible outcomes)
- No price change or suspension animations
- No stake validation (min/max)
- No cash-out
- No accumulators
- No live data or WebSocket connections

### Potential v2 additions

- In-play state (current score, greyed-out impossible outcomes)
- Mode switching (LR/FR toggle)
- Onboarding education flow
- Additional fixtures and sports

---

## Deployment

- New GitHub repo: `lrsb-prototype`
- Deploy to Vercel on push to `main`
- Shareable URL for stakeholders
