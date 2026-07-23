"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export function SavingsTrendChart({
  data,
}: {
  data: { month: string; rate: number; income: number; expense: number }[];
}) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted">
        Brak danych w tym roku.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" stroke="#8b8fa3" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#8b8fa3"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "rate") return [`${value}%`, "Oszczędności"];
            if (name === "income") return [formatCurrency(Number(value ?? 0)), "Przychody"];
            if (name === "expense") return [formatCurrency(Number(value ?? 0)), "Wydatki"];
            return [value, name];
          }}
          contentStyle={{
            background: "#14161d",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            color: "#eceef3",
          }}
        />
        <Line type="monotone" dataKey="rate" stroke="#4c8dfb" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
