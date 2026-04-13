"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Market, Direction } from "@/lib/types";
import { calculatePayout } from "@/lib/payout";

type PayoutGraphProps = {
  market: Market;
  direction: Direction;
  stake: number;
};

export function PayoutGraph({ market, direction, stake }: PayoutGraphProps) {
  const result = calculatePayout(market, direction, stake);

  if (stake <= 0) {
    return (
      <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
        <p className="text-sub text-gray-400">Enter a stake to see payouts</p>
      </div>
    );
  }

  const data = result.outcomes.map((o) => ({
    outcome: o.outcome,
    payout: o.payout,
  }));

  const labelIndices = pickLabelIndices(data.length, 5);
  const maxPayout = Math.max(...data.map((d) => d.payout));
  const yDomain: [number, number] = [0, Math.ceil(maxPayout * 1.1)];

  if (market.type === "discrete") {
    return (
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="outcome"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(value: number, index: number) =>
                labelIndices.includes(index) ? `${value}` : ""
              }
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(value: number) => `£${value}`}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <ReferenceLine y={stake} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Bar dataKey="payout" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.payout >= stake ? "#168D99" : "#BD2A2E"}
                  fillOpacity={entry.payout >= stake ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Continuous market — line chart
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="outcome"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(value: number, index: number) =>
              labelIndices.includes(index) ? `${value}${market.unit}` : ""
            }
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(value: number) => `£${value}`}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <ReferenceLine y={stake} stroke="#e5e7eb" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="payout"
            stroke="#168D99"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function pickLabelIndices(total: number, max: number): number[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i);
  const indices: number[] = [0];
  const step = (total - 1) / (max - 1);
  for (let i = 1; i < max - 1; i++) {
    indices.push(Math.round(step * i));
  }
  indices.push(total - 1);
  return indices;
}
