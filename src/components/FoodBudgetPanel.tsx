"use client";

import { useActionState } from "react";
import { setFoodBudget, type ActionState } from "@/lib/actions";
import { DEFAULT_FOOD_BUDGET } from "@/lib/foodBudget";

const initialState: ActionState = {};

export function FoodBudgetPanel({
  year,
  month,
  amount,
}: {
  year: number;
  month: number;
  monthLabel: string;
  amount: number | null;
}) {
  const [state, formAction, pending] = useActionState(setFoodBudget, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="month" value={month} />

      <span className="shrink-0 text-sm text-muted">Jedzenie</span>
      <input
        key={`${year}-${month}-${amount ?? "new"}`}
        type="number"
        name="amount"
        step="0.01"
        min="0"
        inputMode="decimal"
        defaultValue={amount ?? DEFAULT_FOOD_BUDGET}
        required
        className="flex-1 min-w-0 rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 transition-colors"
      >
        {pending ? "…" : amount === null ? "Dodaj" : "Zapisz"}
      </button>

      {state.error && <p className="text-xs text-negative">{state.error}</p>}
    </form>
  );
}
