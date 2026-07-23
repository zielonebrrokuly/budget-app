"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        action={formAction}
        className="w-full max-w-sm bg-surface rounded-2xl p-6 flex flex-col gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-foreground">Budżet domowy</h1>
          <p className="text-sm text-muted mt-1">Podaj hasło, aby kontynuować.</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-muted">
          Hasło
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="rounded-xl bg-surface-alt border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        {state.error && <p className="text-sm text-negative">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
        >
          {pending ? "Logowanie…" : "Zaloguj"}
        </button>
      </form>
    </div>
  );
}
