"use client";

import { useActionState, useState } from "react";
import { deleteCategory, renameCategory, type ActionState } from "@/lib/actions";

const initialState: ActionState = {};

export function CategoryRow({ category }: { category: { id: string; name: string } }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(renameCategory, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCategory, initialState);

  const [handledRename, setHandledRename] = useState(renameState);
  if (renameState !== handledRename) {
    setHandledRename(renameState);
    if (renameState.success) setEditing(false);
  }

  if (editing) {
    return (
      <form
        action={renameAction}
        className="flex flex-wrap items-center gap-2 bg-surface-alt rounded-xl p-2"
      >
        <input type="hidden" name="id" value={category.id} />
        <input
          type="text"
          name="name"
          defaultValue={category.name}
          required
          autoFocus
          className="flex-1 min-w-0 rounded-lg bg-surface border border-border px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={renamePending}
          className="rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm px-3 py-1.5"
        >
          {renamePending ? "Zapisywanie…" : "Zapisz"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-border text-sm px-3 py-1.5 text-muted hover:text-foreground"
        >
          Anuluj
        </button>
        {renameState.error && <p className="text-sm text-negative w-full">{renameState.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-alt transition-colors">
        <span className="text-sm text-foreground">{category.name}</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-accent hover:text-accent-hover"
          >
            Edytuj
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="text-sm text-negative hover:opacity-80 disabled:opacity-60"
            >
              Usuń
            </button>
          </form>
        </div>
      </div>
      {deleteState.error && <p className="text-sm text-negative px-3">{deleteState.error}</p>}
    </div>
  );
}
