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

type PlannedExpenseItem = { id: string; name: string; amount: number; isPaid: boolean };

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

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = items.filter((item) => item.isPaid).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted">Brak pozycji do zapłacenia w tym miesiącu.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <input
                type="checkbox"
                checked={item.isPaid}
                onChange={(e) => handleToggle(item.id, e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface-alt accent-blue-500 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${item.isPaid ? "text-muted line-through" : "text-foreground"}`}
              >
                {item.name}
              </span>
              <span
                className={`text-sm font-medium tabular-nums ${item.isPaid ? "text-muted line-through" : "text-foreground"}`}
              >
                {formatCurrency(item.amount)}
              </span>
              <form action={deletePlannedExpense.bind(null, item.id)}>
                <button
                  type="submit"
                  aria-label="Usuń pozycję"
                  className="text-muted hover:text-negative text-sm px-1"
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted px-3 pt-1 border-t border-border">
          Zapłacono {formatCurrency(paidTotal)} z {formatCurrency(total)}
        </p>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2 pt-2">
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="month" value={month} />
        <input
          type="text"
          name="name"
          placeholder="np. Czynsz"
          required
          className="flex-1 min-w-[140px] rounded-xl bg-surface-alt border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <AmountInput
          placeholder="Kwota"
          required
          className="w-28 rounded-xl bg-surface-alt border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {pending ? "Dodawanie…" : "Dodaj"}
        </button>
      </form>
      {state.error && <p className="text-sm text-negative">{state.error}</p>}
    </div>
  );
}
