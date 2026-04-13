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
