export function BettingToggle() {
  return (
    <div className="flex justify-center bg-surface border-b border-border" style={{ padding: "10px 0" }}>
      <div className="flex border border-primary-red overflow-hidden" style={{ borderRadius: "100px" }}>
        <button className="font-bold bg-primary-red text-white" style={{ padding: "6px 16px", fontSize: "13px" }}>
          Spread Betting
        </button>
        <button className="font-bold text-primary-red bg-surface" style={{ padding: "6px 16px", fontSize: "13px" }}>
          Fixed Odds
        </button>
      </div>
    </div>
  );
}
