import Link from "next/link";
import { MONTH_NAMES } from "@/lib/categories";

const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

// Kontrolka segmentowa z przesuwanym suwakiem: podświetlenie to JEDEN element
// pozycjonowany transformem, a nie tło doklejane do aktywnego linku. Dzięki temu
// React zachowuje ten sam węzeł DOM przy zmianie miesiąca i CSS animuje przejazd.
// Siatka bez odstępów, bo suwak ma szerokość dokładnie jednego segmentu.
export function MonthSwitcher({ selectedMonth }: { selectedMonth: number }) {
  return (
    <div
      className="month-track relative hidden lg:grid grid-cols-12 rounded-xl bg-surface border border-border p-1"
      style={{ ["--col-d" as string]: selectedMonth }}
    >
      <span
        aria-hidden="true"
        className="month-thumb pointer-events-none absolute top-1 left-1 rounded-lg bg-accent"
      />
      {MONTH_SHORT.map((label, i) => {
        const active = i === selectedMonth;
        return (
          <Link
            key={label}
            href={`/?month=${i}`}
            aria-current={active ? "page" : undefined}
            className={`relative z-10 rounded-lg px-2 py-1.5 text-sm font-medium text-center transition-colors ${
              active ? "text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
