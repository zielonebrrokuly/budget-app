"use client";

import { useState } from "react";
import { MONTH_NAMES } from "@/lib/categories";

const selectClass =
  "rounded-xl bg-surface-alt border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function PeriodFilter({
  basePath,
  years,
  year,
  month,
  categories,
  category,
  advancedActive = false,
  liveQuery,
  onLiveQueryChange,
}: {
  basePath: string;
  years: number[];
  year: number;
  month?: number;
  categories?: string[];
  category?: string;
  advancedActive?: boolean;
  liveQuery: string;
  onLiveQueryChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(advancedActive);

  const periodLabel = month === undefined ? `Cały ${year}` : `${MONTH_NAMES[month]} ${year}`;

  return (
    <form className="flex flex-col gap-1.5" action={basePath}>
      <span className="text-xs text-muted">{periodLabel}</span>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-muted">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={liveQuery}
          onChange={(e) => onLiveQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Szukaj…"
          className="flex-1 min-w-0 bg-transparent border-0 p-0 text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Więcej filtrów"
          aria-expanded={open}
          className="shrink-0 text-muted hover:text-foreground transition-colors"
        >
          <ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {/* Zawsze zamontowane (żeby wartości się wysyłały), tylko ukrywane przy zwinięciu. */}
      <div
        className={
          open
            ? "mt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3"
            : "hidden"
        }
      >
        <label className="flex flex-col gap-1 text-sm text-muted">
          Rok
          <select name="year" defaultValue={year} className={selectClass}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Miesiąc
          <select name="month" defaultValue={month ?? ""} className={selectClass}>
            <option value="">Cały rok</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {categories && (
          <label className="flex flex-col gap-1 text-sm text-muted">
            Kategoria
            <select name="category" defaultValue={category ?? ""} className={selectClass}>
              <option value="">Wszystkie kategorie</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="submit"
          className="rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          Zastosuj
        </button>
        {advancedActive && (
          <a href={basePath} className="text-sm text-muted hover:text-foreground px-1 py-2">
            Wyczyść
          </a>
        )}
      </div>
    </form>
  );
}
