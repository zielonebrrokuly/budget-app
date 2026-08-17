"use client";

import { useActionState, useEffect, useOptimistic, useRef, useTransition } from "react";
import {
  addPlannedExpense,
  deletePlannedExpense,
  togglePlannedExpensePaid,
  type ActionState,
} from "@/lib/actions";
import { formatCurrency } from "@/lib/format";
import { AmountInput } from "@/components/AmountInput";

const initialState: ActionState = {};

type PlannedExpenseItem = { id: string; name: string; amount: number | null; isPaid: boolean };

export function PlannedExpensesList({
  expenses,
  year,
  month,
}: {
  expenses: PlannedExpenseItem[];
  year: number;
  month: number;
}) {
  const [items, setOptimisticPaid] = useOptimistic(
    expenses,
    (state, update: { id: string; isPaid: boolean }) =>
      state.map((item) => (item.id === update.id ? { ...item, isPaid: update.isPaid } : item)),
  );
  const [, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(addPlannedExpense, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  function handleToggle(id: string, checked: boolean) {
    startTransition(async () => {
      setOptimisticPaid({ id, isPaid: checked });
      await togglePlannedExpensePaid(id, checked);
    });
  }

  const doneCount = items.filter((item) => item.isPaid).length;
  const total = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const paidTotal = items
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + (item.amount ?? 0), 0);

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 ? (
        <p className="text-xs text-muted">Brak zadań w tym miesiącu.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-alt transition-colors"
            >
              <input
                type="checkbox"
                checked={item.isPaid}
                onChange={(e) => handleToggle(item.id, e.target.checked)}
                className="w-3.5 h-3.5 shrink-0 rounded border-border bg-surface-alt accent-blue-500 cursor-pointer"
              />
              <span
                className={`flex-1 min-w-0 truncate text-xs ${item.isPaid ? "text-muted line-through" : "text-foreground"}`}
              >
                {item.name}
              </span>
              {item.amount !== null && (
                <span
                  className={`shrink-0 text-xs font-medium tabular-nums ${item.isPaid ? "text-muted line-through" : "text-foreground"}`}
                >
                  {formatCurrency(item.amount)}
                </span>
              )}
              <form action={deletePlannedExpense.bind(null, item.id)} className="shrink-0 flex">
                <button
                  type="submit"
                  aria-label="Usuń pozycję"
                  className="text-muted hover:text-negative text-xs px-0.5"
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted px-2.5 pt-1.5 border-t border-border">
          Zrobione {doneCount} z {items.length}
          {total > 0 && ` · zapłacono ${formatCurrency(paidTotal)} z ${formatCurrency(total)}`}
        </p>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-1.5 pt-1">
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="month" value={month} />
        <input
          type="text"
          name="name"
          placeholder="np. Czynsz"
          required
          className="flex-1 min-w-[120px] rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <AmountInput
          placeholder="Kwota (opc.)"
          className="w-24 rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 transition-colors"
        >
          {pending ? "Dodawanie…" : "Dodaj"}
        </button>
      </form>
      {state.error && <p className="text-xs text-negative">{state.error}</p>}
    </div>
  );
}
