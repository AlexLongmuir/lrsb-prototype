import type { Market, Direction } from "@/lib/types";

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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Generates evenly-spaced outcome points from minOutcome to maxOutcome
 * at market.step intervals, inclusive of both endpoints.
 *
 * Uses integer arithmetic internally to avoid floating-point drift
 * (e.g. 0 + 0.1 + 0.1 + ... !== 1.0 in JS).
 */
function generateOutcomes(market: Market): number[] {
  const { minOutcome, maxOutcome, step } = market;
  const outcomes: number[] = [];
  // Multiply by a large integer scale factor to avoid floating-point drift
  const scale = 1e10;
  const minScaled = Math.round(minOutcome * scale);
  const maxScaled = Math.round(maxOutcome * scale);
  const stepScaled = Math.round(step * scale);

  for (let s = minScaled; s <= maxScaled; s += stepScaled) {
    outcomes.push(s / scale);
  }
  return outcomes;
}

export function calculatePayout(
  market: Market,
  direction: Direction,
  stake: number
): PayoutResult {
  const { buyPrice, sellPrice, minOutcome, maxOutcome, limitLevel } = market;
  const outcomes = generateOutcomes(market);

  if (direction === "buy") {
    const stopLevel = minOutcome;
    // perPoint: how much each point move is worth in GBP
    const perPoint = buyPrice === minOutcome ? 0 : stake / (buyPrice - minOutcome);
    // maxReturn: payout at the cap (limitLevel if set, otherwise maxOutcome)
    const capOutcome = limitLevel !== null ? limitLevel : maxOutcome;
    const maxReturn = round2((capOutcome - minOutcome) * perPoint);

    const outcomePoints: PayoutOutcome[] = outcomes.map((o) => {
      const raw = (o - minOutcome) * perPoint;
      const clamped = Math.min(Math.max(raw, 0), maxReturn);
      return { outcome: o, payout: round2(clamped) };
    });

    return { perPoint, stopLevel, maxReturn, outcomes: outcomePoints };
  } else {
    // sell
    const stopLevel = maxOutcome;
    const perPoint = maxOutcome === sellPrice ? 0 : stake / (maxOutcome - sellPrice);
    const capOutcome = limitLevel !== null ? limitLevel : minOutcome;
    const maxReturn = round2((maxOutcome - capOutcome) * perPoint);

    const outcomePoints: PayoutOutcome[] = outcomes.map((o) => {
      const raw = (maxOutcome - o) * perPoint;
      const clamped = Math.min(Math.max(raw, 0), maxReturn);
      return { outcome: o, payout: round2(clamped) };
    });

    return { perPoint, stopLevel, maxReturn, outcomes: outcomePoints };
  }
}
