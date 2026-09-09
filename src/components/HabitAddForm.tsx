"use client";

import { useActionState, useEffect, useRef } from "react";
import { createHabit, type ActionState } from "@/lib/actions";

const initialState: ActionState = {};

export function HabitAddForm() {
  const [state, formAction, pending] = useActionState(createHabit, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        name="name"
        placeholder="np. Siłownia"
        required
        className="flex-1 min-w-[140px] rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 transition-colors"
      >
        {pending ? "Dodawanie…" : "Dodaj"}
      </button>
      {state.error && <p className="w-full text-xs text-negative">{state.error}</p>}
    </form>
  );
}
