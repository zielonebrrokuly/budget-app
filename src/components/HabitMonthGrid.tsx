"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { toggleHabitEntry } from "@/lib/actions";
import { dayKey, sameDay, WEEKDAY_SHORT } from "@/lib/habits";

type Habit = { id: string; name: string };

function getNameWidth(box: HTMLElement) {
  const grid = box.querySelector<HTMLElement>(".habit-month");
  if (!grid) return 0;
  const value = getComputedStyle(grid).getPropertyValue("--habit-name-w").trim();
  const rem = parseFloat(value);
  return Number.isFinite(rem) ? rem * 16 : 0;
}

// Cały miesiąc od lewej do prawej: 1. z lewej, ostatni z prawej. Na wąskim
// ekranie 30 kolumn się nie mieści, więc siatka przewija się w poziomie, a
// kolumna z nazwą nawyku zostaje przyklejona — inaczej nie wiadomo, co klikasz.
export function HabitMonthGrid({
  habits,
  days,
  done,
  today,
}: {
  habits: Habit[];
  days: Date[];
  /** habitId -> odhaczone dni ("YYYY-MM-DD") */
  done: Record<string, string[]>;
  today: Date;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLSpanElement>(null);

  // Miesiąc nie mieści się na ekranie, więc po wejściu przewijamy do dziś —
  // inaczej zawsze lądujesz na 1. dniu miesiąca i musisz szukać dzisiejszej kolumny.
  useEffect(() => {
    const box = scrollRef.current;
    const cell = todayRef.current;
    if (!box || !cell) return;
    // Liczymy z pozycji ekranowych, nie z offsetLeft — offsetParent kratki to
    // niekoniecznie kontener przewijania, więc offsetLeft potrafi być liczony
    // względem czegoś innego i dzień ląduje przy krawędzi zamiast na środku.
    const boxRect = box.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const cellCenter = cellRect.left - boxRect.left + box.scrollLeft + cellRect.width / 2;

    // Środkujemy w obszarze NA PRAWO od przyklejonej kolumny z nazwami, bo tylko
    // tam dzień jest widoczny.
    const nameWidth = getNameWidth(box);
    const visible = box.clientWidth - nameWidth;
    box.scrollLeft = Math.max(0, cellCenter - nameWidth - visible / 2);
  }, []);

  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    done,
    (state: Record<string, string[]>, change: { habitId: string; day: string }) => {
      const current = state[change.habitId] ?? [];
      const next = current.includes(change.day)
        ? current.filter((d) => d !== change.day)
        : [...current, change.day];
      return { ...state, [change.habitId]: next };
    },
  );

  return (
    // Bez poziomego paddingu: `left: 0` przykleja nazwę do krawędzi paddingu,
    // więc każdy px paddingu to szczelina, w której widać przejeżdżające kratki.
    // Pionowy zostaje, żeby obwódka dzisiejszego dnia nie była ucinana.
    <div ref={scrollRef} className="habit-scroll overflow-x-auto py-1">
      <div
        className="habit-month grid gap-1 items-center w-max"
        style={{ gridTemplateColumns: `var(--habit-name-w) repeat(${days.length}, var(--habit-cell))` }}
      >
        <span className="habit-sticky" />
        {days.map((day) => {
          const isToday = sameDay(day, today);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          return (
            <span
              key={dayKey(day)}
              ref={isToday ? todayRef : undefined}
              className={`text-center leading-tight ${
                isToday ? "text-foreground font-medium" : isWeekend ? "text-muted/60" : "text-muted"
              }`}
            >
              <span className="block text-[10px]">{day.getDate()}</span>
              <span className="block text-[9px] opacity-70">
                {WEEKDAY_SHORT[(day.getDay() + 6) % 7]}
              </span>
            </span>
          );
        })}

        {habits.map((habit) => (
          <div key={habit.id} className="contents">
            <span className="habit-sticky text-xs text-foreground truncate pr-2">{habit.name}</span>
            {days.map((day) => {
              const key = dayKey(day);
              const isDone = (optimistic[habit.id] ?? []).includes(key);
              const isToday = sameDay(day, today);
              const isFuture = day.getTime() > today.getTime();
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isFuture}
                  aria-pressed={isDone}
                  aria-label={`${habit.name}, ${day.getDate()}.${day.getMonth() + 1}${isDone ? " — odhaczone" : ""}`}
                  onClick={() =>
                    startTransition(async () => {
                      setOptimistic({ habitId: habit.id, day: key });
                      await toggleHabitEntry(habit.id, key);
                    })
                  }
                  className={`aspect-square rounded-md border transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
                    isDone
                      ? "bg-accent border-accent"
                      : "bg-surface-alt border-border hover:border-muted"
                  } ${isToday ? "ring-1 ring-muted ring-offset-1 ring-offset-surface" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
