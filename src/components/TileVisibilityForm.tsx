"use client";

import { useActionState } from "react";
import { updateTileVisibility, type ActionState } from "@/lib/actions";
import { TILE_KEYS, TILE_LABELS, type TileKey } from "@/lib/tiles";

const initialState: ActionState = {};

export function TileVisibilityForm({ enabled }: { enabled: Record<TileKey, boolean> }) {
  const [state, formAction, pending] = useActionState(updateTileVisibility, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {TILE_KEYS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name={key}
              defaultChecked={enabled[key]}
              className="w-4 h-4 rounded border-border bg-surface-alt accent-accent"
            />
            {TILE_LABELS[key]}
          </label>
        ))}
      </div>

      {state.error && <p className="text-sm text-negative">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Zapisywanie…" : "Zapisz"}
      </button>
    </form>
  );
}
