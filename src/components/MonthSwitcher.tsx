import Link from "next/link";
import { MONTH_NAMES } from "@/lib/categories";

const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

export function MonthSwitcher({ selectedMonth }: { selectedMonth: number }) {
  return (
    <div className="grid grid-cols-6 lg:grid-cols-12 gap-2">
      {MONTH_SHORT.map((label, i) => (
        <Link
          key={label}
          href={`/?month=${i}`}
          className={`rounded-full px-2 sm:px-3 py-1.5 text-sm font-medium text-center transition-colors ${
            i === selectedMonth
              ? "bg-accent text-white"
              : "bg-surface-alt text-muted hover:text-foreground"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
