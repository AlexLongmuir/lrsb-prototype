"use client";

type StakeInputProps = {
  stake: number;
  onStakeChange: (stake: number) => void;
};

export function StakeInput({ stake, onStakeChange }: StakeInputProps) {
  const displayValue = stake > 0 ? `£${stake.toFixed(2)}` : "£0.00";

  const handleKey = (key: string) => {
    if (key === "clear") {
      onStakeChange(0);
      return;
    }
    if (key === "backspace") {
      const cents = Math.floor(stake * 100);
      const newCents = Math.floor(cents / 10);
      onStakeChange(newCents / 100);
      return;
    }
    const digit = parseInt(key);
    const cents = Math.floor(stake * 100);
    const newCents = cents * 10 + digit;
    if (newCents > 999999) return; // cap at £9999.99
    onStakeChange(newCents / 100);
  };

  const quickStakes = [5, 10, 25, 50];

  return (
    <div>
      <div className="text-center text-[28px] font-bold text-gray-900 py-2 mb-s border-b-2 border-teal-600">
        {displayValue}
      </div>

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
