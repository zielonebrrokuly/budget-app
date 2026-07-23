"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createTransaction, type ActionState } from "@/lib/actions";
import { AmountInput } from "@/components/AmountInput";

const initialState: ActionState = {};

// Lokalna data kalendarzowa jako YYYY-MM-DD (spójne z zapisem: new Date("YYYY-MM-DD") = północ UTC).
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayIso() {
  return ymd(new Date());
}

const WEEKDAYS_PL = ["nie", "pon", "wt", "śr", "czw", "pt", "sob"];

export function TransactionForm({
  type,
  categories,
}: {
  type: "EXPENSE" | "INCOME";
  categories: readonly string[];
}) {
  const [state, formAction, pending] = useActionState(createTransaction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [date, setDate] = useState(todayIso());
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  // Wyśrodkuj „dziś" na pasku przy wejściu. `scrollIntoView` liczy pozycję względem
  // najbliższego przewijalnego przodka (a nie `offsetLeft`, który jest względny do
  // najbliższego pozycjonowanego przodka — na szerokim desktopie dawało to przewinięcie
  // poza zakres i przeglądarka przycinała je do samego końca paska).
  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  // Reset daty do „dziś" po udanym dodaniu — wzorzec render-phase (bez setState w efekcie).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setDate(todayIso());
  }

  // Wszystkie dni BIEŻĄCEGO miesiąca: 1. dnia po lewej → ostatni dzień po prawej. „Dziś" w środku.
  const quickDays = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const tIso = ymd(now);
    return Array.from({ length: lastDay }, (_, i) => {
      const d = new Date(y, m, i + 1);
      const iso = ymd(d);
      return { iso, dayNum: i + 1, weekday: WEEKDAYS_PL[d.getDay()], isToday: iso === tIso };
    });
  }, []);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2.5">
      <input type="hidden" name="type" value={type} />

      <div className="flex flex-col gap-1 text-xs text-muted">
        Data
        <input type="hidden" name="date" value={date} />
        <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-1">
          {quickDays.map((d) => {
            const active = d.iso === date;
            return (
              <button
                key={d.iso}
                ref={d.isToday ? todayRef : undefined}
                type="button"
                onClick={() => setDate(d.iso)}
                className={`flex shrink-0 flex-col items-center rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border text-muted hover:border-accent/50 hover:text-foreground"
                }`}
              >
                <span className="leading-tight">{d.isToday ? "Dziś" : d.weekday}</span>
                <span className="text-sm font-semibold leading-tight text-foreground">
                  {d.dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-0.5 text-xs text-muted">
          Kwota (zł)
          <AmountInput
            required
            placeholder="0,00 lub 84/2"
            className="w-full rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-0.5 text-xs text-muted">
          Kategoria
          <select
            name="category"
            required
            defaultValue=""
            className="rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="" disabled>
              Wybierz
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-0.5 text-xs text-muted">
        Opis (opcjonalnie)
        <input
          type="text"
          name="description"
          placeholder="np. zakupy spożywcze"
          className="rounded-lg bg-surface-alt border border-border px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      {type === "EXPENSE" && (
        <label className="flex items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            name="deductFromFood"
            className="w-3.5 h-3.5 rounded border-border bg-surface-alt accent-accent"
          />
          Odejmij z karty jedzenie
        </label>
      )}

      {state.error && <p className="text-sm text-negative">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-medium py-2 transition-colors"
      >
        {pending ? "Dodawanie…" : type === "EXPENSE" ? "Dodaj wydatek" : "Dodaj przychód"}
      </button>
    </form>
  );
}
