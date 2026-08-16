"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import { getCategoryColor } from "@/lib/categoryColors";

export function CategoryPieChart({
  data,
}: {
  data: { category: string; amount: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted">
        Brak wydatków w tym miesiącu.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2 h-56 sm:h-80 flex items-center justify-center">
        <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={getCategoryColor(entry.category)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{
                  background: "#14161d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#eceef3",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ul className="w-full sm:w-1/2 flex flex-col gap-1.5 pr-1">
        {data.map((entry) => (
          <li
            key={entry.category}
            className="flex items-center justify-between text-sm gap-2"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: getCategoryColor(entry.category) }}
              />
              <span className="truncate text-foreground">{entry.category}</span>
            </span>
            <span className="text-muted shrink-0">{formatCurrency(entry.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
