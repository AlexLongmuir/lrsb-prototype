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
