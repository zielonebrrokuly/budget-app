"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory, type ActionState } from "@/lib/actions";

const initialState: ActionState = {};

export function CategoryAddForm({ type }: { type: "EXPENSE" | "INCOME" }) {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="type" value={type} />
      <input
        type="text"
        name="name"
        placeholder="Nowa kategoria"
        required
        className="flex-1 min-w-0 rounded-xl bg-surface-alt border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Dodawanie…" : "Dodaj"}
      </button>
      {state.error && <p className="text-sm text-negative w-full">{state.error}</p>}
    </form>
  );
}
