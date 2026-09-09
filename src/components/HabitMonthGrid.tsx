"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { toggleHabitEntry } from "@/lib/actions";
import { dayKey, sameDay, WEEKDAY_SHORT } from "@/lib/habits";

type Habit = { id: string; name: string };

function getNameWidth(box: HTMLElement) {
  const grid = box.querySelector<HTMLElement>(".habit-month");
  if (!grid) return 0;
  const value = getComputedStyle(grid).getPropertyValue("--habit-name-w").trim();
  const px = parseFloat(value);
  if (!Number.isFinite(px)) return 0;
  return value.endsWith("rem") ? px * 16 : px;
}

// Cały miesiąc od lewej do prawej. Układ zmienia się z szerokością ekranu:
// na telefonie nazwa nawyku stoi NAD rzędem kratek (zwalnia całą szerokość na
// dni), na dużym ekranie po lewej stronie rzędu. Jedna struktura, dwa układy —
// dzięki temu nie ma dwóch wersji tego samego kodu do utrzymania.
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

  useEffect(() => {
    const box = scrollRef.current;
    const cell = todayRef.current;
    if (!box || !cell) return;
    // Liczymy z pozycji ekranowych, nie z offsetLeft — offsetParent kratki to
    // niekoniecznie kontener przewijania.
    const boxRect = box.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const cellCenter = cellRect.left - boxRect.left + box.scrollLeft + cellRect.width / 2;
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

  const cellsStyle = { gridTemplateColumns: `repeat(${days.length}, var(--habit-cell))` };

  return (
    <div ref={scrollRef} className="habit-scroll overflow-x-auto py-1">
      <div className="habit-month w-max flex flex-col gap-1">
        <div className="habit-row">
          <span className="habit-name habit-name--spacer" aria-hidden="true" />
          <div className="habit-cells" style={cellsStyle}>
            {days.map((day) => {
              const isToday = sameDay(day, today);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <span
                  key={dayKey(day)}
                  ref={isToday ? todayRef : undefined}
                  className={`text-center leading-tight ${
                    isToday
                      ? "text-foreground font-medium"
                      : isWeekend
                        ? "text-muted/60"
                        : "text-muted"
                  }`}
                >
                  <span className="block text-[10px]">{day.getDate()}</span>
                  <span className="block text-[9px] opacity-70">
                    {WEEKDAY_SHORT[(day.getDay() + 6) % 7]}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {habits.map((habit) => (
          <div key={habit.id} className="habit-row">
            <span className="habit-name text-xs text-foreground truncate">{habit.name}</span>
            <div className="habit-cells" style={cellsStyle}>
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
          </div>
        ))}
      </div>
    </div>
  );
}
