"use client";

import { useActionState, useState } from "react";
import { deleteTransaction, updateTransaction, type ActionState } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { AmountInput } from "@/components/AmountInput";

const initialState: ActionState = {};

function toIso(date: Date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function TransactionRow({
  transaction,
  categories,
  type,
}: {
  transaction: {
    id: string;
    date: Date;
    amount: number;
    category: string;
    description: string | null;
  };
  categories: readonly string[];
  type: "EXPENSE" | "INCOME";
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateTransaction, initialState);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setEditing(false);
  }

  if (editing) {
    return (
      <form
        action={formAction}
        className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-start bg-surface-alt rounded-lg p-2.5"
      >
        <input type="hidden" name="id" value={transaction.id} />
        <input type="hidden" name="type" value={type} />
        <input
          type="date"
          name="date"
          defaultValue={toIso(transaction.date)}
          required
          className="rounded-lg bg-surface border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <AmountInput
          defaultValue={String(transaction.amount)}
          required
          className="w-full rounded-lg bg-surface border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          name="category"
          defaultValue={transaction.category}
          required
          className="rounded-lg bg-surface border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="description"
          defaultValue={transaction.description ?? ""}
          placeholder="Opis"
          className="rounded-lg bg-surface border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm px-3 py-1.5"
          >
            {pending ? "Zapisywanie…" : "Zapisz"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-border text-sm px-3 py-1.5 text-muted hover:text-foreground"
          >
            Anuluj
          </button>
        </div>
        {type === "EXPENSE" && (
          <label className="col-span-2 sm:col-span-5 flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="deductFromFood"
              className="w-4 h-4 rounded border-border bg-surface-alt accent-accent"
            />
            Odejmij z karty jedzenie
          </label>
        )}
        {state.error && (
          <p className="col-span-2 sm:col-span-5 text-sm text-negative">{state.error}</p>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-alt transition-colors">
      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-0.5 items-center">
        <span className="text-xs text-muted">{formatDate(transaction.date)}</span>
        <span className="text-xs font-medium text-foreground">
          {formatCurrency(transaction.amount)}
        </span>
        <span className="text-xs text-foreground truncate min-w-0">{transaction.category}</span>
        <span className="text-xs text-muted truncate min-w-0">
          {transaction.description ?? "—"}
        </span>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-accent hover:text-accent-hover"
        >
          Edytuj
        </button>
        <form action={deleteTransaction.bind(null, transaction.id)}>
          <button type="submit" className="text-xs text-negative hover:opacity-80">
            Usuń
          </button>
        </form>
      </div>
    </div>
  );
}
