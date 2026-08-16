"use client";

import { useActionState } from "react";
import { updateRecentTransactionsLimit, type ActionState } from "@/lib/actions";

const initialState: ActionState = {};

export function RecentTransactionsLimitForm({ limit }: { limit: number }) {
  const [state, formAction, pending] = useActionState(updateRecentTransactionsLimit, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Maks. liczba transakcji
        <input
          type="number"
          name="limit"
          min={1}
          defaultValue={limit}
          className="w-24 rounded-xl bg-surface-alt border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Zapisywanie…" : "Zapisz"}
      </button>
      {state.error && <p className="text-sm text-negative w-full">{state.error}</p>}
    </form>
  );
}
