"use client";

import { useRouter } from "next/navigation";
import { MONTH_NAMES } from "@/lib/categories";

// Wersja na telefon: jeden miesiąc z pełną nazwą, a po dotknięciu natywny
// wybierak systemu — na iOS to właśnie to przewijane koło. Świadomie nie piszemy
// własnego: natywny jest dostępny z klawiatury i czytników ekranu za darmo.
export function MonthPicker({
  selectedMonth,
  year,
}: {
  selectedMonth: number;
  year: number;
}) {
  const router = useRouter();

  return (
    <div className="relative lg:hidden">
      <select
        value={selectedMonth}
        aria-label="Wybierz miesiąc"
        onChange={(e) => router.push(`/?month=${e.target.value}`)}
        className="w-full appearance-none rounded-xl bg-surface border border-border pl-4 pr-10 py-3 text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={i}>
            {name} {year}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
