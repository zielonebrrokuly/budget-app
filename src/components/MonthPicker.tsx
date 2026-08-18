"use client";

import { useRouter } from "next/navigation";
import { MONTH_NAMES } from "@/lib/categories";

// Wersja na telefon: miesiąc wygląda jak tytuł strony, a nie jak pole formularza.
// Natywny <select> leży niewidocznie na wierzchu, więc dotknięcie otwiera
// systemowy wybierak (na iOS przewijane koło) i za darmo mamy obsługę
// klawiatury oraz czytników ekranu.
export function MonthPicker({
  selectedMonth,
  year,
}: {
  selectedMonth: number;
  year: number;
}) {
  const router = useRouter();

  return (
    // Ujemne marginesy zrównoważone paddingiem: pole dotyku rośnie do ~44 px,
    // a element nadal zajmuje w układzie tyle co sam tekst.
    <div className="relative inline-flex items-center gap-1.5 self-start -m-2 p-2 rounded-lg focus-within:ring-2 focus-within:ring-accent lg:hidden">
      <span className="text-xl font-semibold text-foreground">
        {MONTH_NAMES[selectedMonth]} {year}
      </span>
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
        className="text-muted"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <select
        value={selectedMonth}
        aria-label="Wybierz miesiąc"
        onChange={(e) => router.push(`/?month=${e.target.value}`)}
        className="absolute inset-0 w-full h-full appearance-none opacity-0"
      >
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={i}>
            {name} {year}
          </option>
        ))}
      </select>
    </div>
  );
}
