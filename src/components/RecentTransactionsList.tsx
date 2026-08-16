import { formatCurrency, formatDate } from "@/lib/format";
import { getCategoryColor } from "@/lib/categoryColors";

type Transaction = {
  id: string;
  type: string;
  date: Date;
  amount: number;
  category: string;
  description: string | null;
};

export function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted py-6 text-center">Brak transakcji.</p>;
  }

  return (
    <ul className="grid grid-cols-[3rem_minmax(0,1fr)_auto] sm:grid-cols-[3.5rem_minmax(0,1fr)_7rem_auto] gap-x-3 gap-y-0.5">
      {transactions.map((t) => {
        const color = getCategoryColor(t.category);
        return (
          <li
            key={t.id}
            className="col-span-3 sm:col-span-4 grid grid-cols-subgrid [grid-template-columns:subgrid] items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-surface-alt transition-colors"
          >
            <span className="text-xs text-muted whitespace-nowrap">{formatDate(t.date).slice(0, 5)}</span>
            <span className="text-sm text-foreground truncate min-w-0">
              {t.description || t.category}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="truncate" style={{ color }}>
                {t.category}
              </span>
            </span>
            <span
              className={`shrink-0 text-sm font-medium tabular-nums text-right ${
                t.type === "INCOME" ? "text-positive" : "text-negative"
              }`}
            >
              {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
