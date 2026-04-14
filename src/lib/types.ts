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
