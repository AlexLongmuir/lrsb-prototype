import { describe, it, expect } from "vitest";
import { calculatePayout } from "@/lib/payout";
import type { Market } from "@/lib/types";

// Shared test markets
const totalGoalsMarket: Market = {
  id: "goals-1",
  name: "Total Goals",
  eventId: "evt-1",
  eventName: "Match 1",
  type: "discrete",
  buyPrice: 2.5,
  sellPrice: 2.2,
  unit: "goals",
  limitLevel: null,
  minOutcome: 0,
  maxOutcome: 8,
  step: 1,
};

const winPctMarket: Market = {
  id: "winpct-1",
  name: "Win Match %",
  eventId: "evt-2",
  eventName: "Match 2",
  type: "continuous",
  buyPrice: 55,
  sellPrice: 52,
  unit: "%",
  limitLevel: 100,
  minOutcome: 0,
  maxOutcome: 100,
  step: 10,
};

describe("calculatePayout – buy direction", () => {
  const stake = 10;
  const result = calculatePayout(totalGoalsMarket, "buy", stake);

  it("computes perPoint correctly", () => {
    // stake / (buyPrice - minOutcome) = 10 / 2.5 = 4
    expect(result.perPoint).toBeCloseTo(4, 5);
  });

  it("sets stopLevel to minOutcome", () => {
    expect(result.stopLevel).toBe(0);
  });

  it("generates 9 outcomes (0 through 8 inclusive)", () => {
    expect(result.outcomes).toHaveLength(9);
  });

  it("return at 0 goals is 0 (full stake lost)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 0)!;
    expect(pt.payout).toBe(0);
  });

  it("return at 1 goal is 4.00", () => {
    const pt = result.outcomes.find((o) => o.outcome === 1)!;
    expect(pt.payout).toBeCloseTo(4, 2);
  });

  it("return at 2 goals is 8.00 (break-even zone)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 2)!;
    expect(pt.payout).toBeCloseTo(8, 2);
  });

  it("return at 3 goals is 12.00 (profit)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 3)!;
    expect(pt.payout).toBeCloseTo(12, 2);
  });
});

describe("calculatePayout – sell direction", () => {
  const stake = 10;
  // perPoint = 10 / (8 - 2.2) = 10 / 5.8 ≈ 1.7241
  const result = calculatePayout(totalGoalsMarket, "sell", stake);

  it("computes perPoint correctly", () => {
    expect(result.perPoint).toBeCloseTo(10 / 5.8, 4);
  });

  it("sets stopLevel to maxOutcome", () => {
    expect(result.stopLevel).toBe(8);
  });

  it("generates 9 outcomes", () => {
    expect(result.outcomes).toHaveLength(9);
  });

  it("return at 8 goals is 0 (full stake lost at stop)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 8)!;
    expect(pt.payout).toBe(0);
  });

  it("return at 0 goals is ~13.79 (max profit)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 0)!;
    expect(pt.payout).toBeCloseTo(13.79, 1);
  });
});

describe("calculatePayout – buy on continuous market with limitLevel", () => {
  const stake = 10;
  // perPoint = 10 / (55 - 0) ≈ 0.1818
  const result = calculatePayout(winPctMarket, "buy", stake);

  it("computes perPoint correctly", () => {
    expect(result.perPoint).toBeCloseTo(10 / 55, 4);
  });

  it("sets stopLevel to minOutcome", () => {
    expect(result.stopLevel).toBe(0);
  });

  it("generates 11 outcomes (0,10,20...100)", () => {
    expect(result.outcomes).toHaveLength(11);
  });

  it("return at 100% is ~18.18 (capped by maxReturn)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 100)!;
    expect(pt.payout).toBeCloseTo(18.18, 1);
  });

  it("return at 0% is 0 (stop level)", () => {
    const pt = result.outcomes.find((o) => o.outcome === 0)!;
    expect(pt.payout).toBe(0);
  });
});

describe("calculatePayout – zero stake", () => {
  it("returns all-zero payouts when stake is 0", () => {
    const result = calculatePayout(totalGoalsMarket, "buy", 0);
    expect(result.outcomes.every((o) => o.payout === 0)).toBe(true);
  });
});

describe("calculatePayout – outcome generation", () => {
  it("outcomes start at minOutcome and end at maxOutcome", () => {
    const result = calculatePayout(totalGoalsMarket, "buy", 10);
    expect(result.outcomes[0].outcome).toBe(0);
    expect(result.outcomes[result.outcomes.length - 1].outcome).toBe(8);
  });

  it("outcomes are spaced by step", () => {
    const result = calculatePayout(winPctMarket, "buy", 10);
    const outcomes = result.outcomes.map((o) => o.outcome);
    expect(outcomes).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });
});
