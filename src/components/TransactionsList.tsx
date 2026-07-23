import { TransactionRow } from "@/components/TransactionRow";
import { formatCurrency } from "@/lib/format";

type Transaction = {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string | null;
};

export function TransactionsList({
  transactions,
  categories,
  type,
}: {
  transactions: Transaction[];
  categories: readonly string[];
  type: "EXPENSE" | "INCOME";
}) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted py-6 text-center">
        Brak transakcji w wybranym okresie.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="hidden sm:flex items-center gap-2 px-3 text-xs uppercase tracking-wide text-muted">
        <div className="flex-1 grid grid-cols-4 gap-2">
          <span>Data</span>
          <span>Kwota</span>
          <span>Kategoria</span>
          <span>Opis</span>
        </div>
        <span className="shrink-0 w-[92px]">Akcje</span>
      </div>
      <div className="flex flex-col gap-2">
        {transactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} categories={categories} type={type} />
        ))}
      </div>
      <div className="flex justify-between px-3 pt-3 mt-2 border-t border-border text-sm">
        <span className="text-muted">Suma</span>
        <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
