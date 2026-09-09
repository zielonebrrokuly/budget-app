"use client";

import { useActionState, useState } from "react";
import { deleteHabit, renameHabit, setHabitArchived, type ActionState } from "@/lib/actions";

const initialState: ActionState = {};

export function HabitRow({
  habit,
}: {
  habit: { id: string; name: string; archived: boolean; entryCount: number };
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(renameHabit, initialState);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setEditing(false);
  }

  if (editing) {
    return (
      <form action={formAction} className="flex flex-wrap items-center gap-2 px-3 py-2">
        <input type="hidden" name="id" value={habit.id} />
        <input
          type="text"
          name="name"
          defaultValue={habit.name}
          required
          className="flex-1 min-w-[120px] rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
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
        {state.error && <p className="w-full text-sm text-negative">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-3 py-2 rounded-xl hover:bg-surface-alt transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm ${habit.archived ? "text-muted line-through" : "text-foreground"}`}>
          {habit.name}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted tabular-nums">{habit.entryCount} dni</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-accent hover:text-accent-hover"
          >
            Edytuj
          </button>
          <form action={setHabitArchived.bind(null, habit.id, !habit.archived)}>
            <button type="submit" className="text-sm text-muted hover:text-foreground">
              {habit.archived ? "Przywróć" : "Archiwizuj"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirming((v) => !v)}
            className="text-sm text-negative hover:opacity-80"
          >
            Usuń
          </button>
        </div>
      </div>

      {confirming && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>
            Usunięcie skasuje też {habit.entryCount} odhaczonych dni — tego nie da się cofnąć.
            Archiwizacja zachowuje historię.
          </span>
          <form action={deleteHabit.bind(null, habit.id)}>
            <button type="submit" className="rounded-lg bg-negative/15 text-negative px-2 py-1">
              Usuń mimo to
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-border px-2 py-1 text-muted hover:text-foreground"
          >
            Anuluj
          </button>
        </div>
      )}
    </div>
  );
}
