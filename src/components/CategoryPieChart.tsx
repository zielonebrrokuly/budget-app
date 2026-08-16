"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { assignDistinctColors } from "@/lib/categoryColors";
import { CATEGORY_CHART_TOP_N as TOP_N } from "@/lib/categoryChart";

// Kategorie poza pierwszą piątką lądują w zwijanej pozycji „Pozostałe".
const REST_LABEL = "Pozostałe";
const REST_COLOR = "#6b7280";

// Pierścień rysujemy ręcznie (stroke-dasharray na <circle>), a nie komponentem
// <Pie> z Rechartsa — ten w tej wersji nie renderuje segmentów pod React 19.
const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 1.5;

export function CategoryPieChart({
  data,
}: {
  data: { category: string; amount: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted">
        Brak wydatków w tym miesiącu.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const rest = data.slice(TOP_N);
  const restTotal = rest.reduce((sum, d) => sum + d.amount, 0);

  const top = data.slice(0, TOP_N);
  const topColors = assignDistinctColors(top.map((d) => d.category));

  const segments = [
    ...top.map((d, i) => ({ label: d.category, amount: d.amount, color: topColors[i] })),
    ...(rest.length > 0
      ? [{ label: REST_LABEL, amount: restTotal, color: REST_COLOR }]
      : []),
  ];

  let cursor = 0;
  const arcs = segments.map((segment) => {
    const length = total > 0 ? (segment.amount / total) * CIRCUMFERENCE : 0;
    const arc = { ...segment, length: Math.max(length - GAP, 0), offset: cursor };
    cursor += length;
    return arc;
  });

  const focused = segments.find((s) => s.label === hovered) ?? null;
  const centerAmount = focused ? focused.amount : total;
  const centerPercent = total > 0 ? Math.round((centerAmount / total) * 100) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2 flex items-center justify-center">
        <div className="relative w-full max-w-[220px] aspect-square">
          <svg
            viewBox="0 0 110 110"
            className="w-full h-full"
            role="img"
            aria-label={`Wydatki wg kategorii, łącznie ${formatCurrency(total)}`}
          >
            <g transform="rotate(-90 55 55)" fill="none" strokeWidth={13}>
              {arcs.map((arc) => (
                <circle
                  key={arc.label}
                  cx="55"
                  cy="55"
                  r={RADIUS}
                  stroke={arc.color}
                  strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                  strokeDashoffset={-arc.offset}
                  opacity={hovered && hovered !== arc.label ? 0.25 : 1}
                  className="transition-opacity"
                  onMouseEnter={() => setHovered(arc.label)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none px-6 text-center">
            <span className="text-xs text-muted truncate max-w-full">
              {focused ? focused.label : "Łącznie"}
            </span>
            <span className="text-lg font-medium text-foreground tabular-nums leading-tight">
              {formatCurrency(centerAmount)}
            </span>
            {focused && <span className="text-xs text-muted">{centerPercent}%</span>}
          </div>
        </div>
      </div>

      <ul className="w-full sm:w-1/2 flex flex-col gap-1.5 pr-1">
        {segments.map((segment) => {
          const isRest = segment.label === REST_LABEL;
          const row = (
            <>
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: segment.color }}
                />
                <span className={`truncate ${isRest ? "text-muted" : "text-foreground"}`}>
                  {isRest ? `${REST_LABEL} (${rest.length})` : segment.label}
                </span>
              </span>
              <span className="text-muted shrink-0 tabular-nums">
                {formatCurrency(segment.amount)}
              </span>
            </>
          );

          return (
            <li key={segment.label}>
              {isRest ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  onMouseEnter={() => setHovered(segment.label)}
                  onMouseLeave={() => setHovered(null)}
                  aria-expanded={expanded}
                  className="w-full flex items-center justify-between text-sm gap-2 hover:text-foreground transition-colors"
                >
                  {row}
                </button>
              ) : (
                <div
                  onMouseEnter={() => setHovered(segment.label)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center justify-between text-sm gap-2"
                >
                  {row}
                </div>
              )}

              {isRest && expanded && (
                <ul className="mt-1.5 flex flex-col gap-1 pl-[18px]">
                  {rest.map((entry) => (
                    <li
                      key={entry.category}
                      className="flex items-center justify-between text-xs gap-2 text-muted"
                    >
                      <span className="truncate">{entry.category}</span>
                      <span className="shrink-0 tabular-nums">
                        {formatCurrency(entry.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
