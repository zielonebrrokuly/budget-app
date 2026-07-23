"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export function CategoryTrendChart({
  categories,
  monthlyByCategory,
  monthLabels,
}: {
  categories: string[];
  monthlyByCategory: Record<string, number[]>;
  monthLabels: string[];
}) {
  const [selected, setSelected] = useState(categories[0] ?? "");

  if (categories.length === 0) {
    return <p className="text-sm text-muted">Brak kategorii wydatków.</p>;
  }

  const values = monthlyByCategory[selected] ?? new Array(12).fill(0);
  const data = monthLabels.map((month, i) => ({ month, value: values[i] ?? 0 }));
  const hasData = data.some((d) => d.value > 0);
  const total = values.reduce((sum, v) => sum + v, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-xl bg-surface-alt border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <p className="text-sm text-muted">
          Suma wydatków — {selected}:{" "}
          <span className="text-foreground font-medium">{formatCurrency(total)}</span>
        </p>
      </div>

      <div className="h-56">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="categoryTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4c8dfb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4c8dfb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#8b8fa3"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#8b8fa3" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), selected]}
                contentStyle={{
                  background: "#14161d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#eceef3",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4c8dfb"
                strokeWidth={2}
                fill="url(#categoryTrendFill)"
                dot={{ r: 3, fill: "#4c8dfb" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted">
            Brak wydatków w kategorii „{selected}” w tym roku.
          </div>
        )}
      </div>
    </div>
  );
}
