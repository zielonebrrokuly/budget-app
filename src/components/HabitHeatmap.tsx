import { currentStreak, dayKey, sameDay } from "@/lib/habits";

type Habit = { id: string; name: string };

// Ten sam miesiąc co siatka powyżej, ale bez numerów dni i bez klikania: gęsty
// pasek, który mieści się na telefonie bez przewijania i pokazuje wzorzec —
// gdzie były przerwy — jednym rzutem oka.
export function HabitHeatmap({
  habits,
  days,
  done,
  today,
}: {
  habits: Habit[];
  days: Date[];
  done: Record<string, string[]>;
  today: Date;
}) {
  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => {
        const doneKeys = new Set(done[habit.id] ?? []);
        const total = days.filter((d) => doneKeys.has(dayKey(d))).length;
        const streak = currentStreak(doneKeys, today);

        return (
          <div key={habit.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-foreground truncate">{habit.name}</span>
              <span className="text-[11px] text-muted tabular-nums shrink-0">
                {total}/{days.length} dni · seria {streak}
              </span>
            </div>
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
            >
              {days.map((day) => {
                const isDone = doneKeys.has(dayKey(day));
                const isFuture = day.getTime() > today.getTime();
                return (
                  <span
                    key={dayKey(day)}
                    title={`${day.getDate()}.${day.getMonth() + 1}${isDone ? " — odhaczone" : ""}`}
                    className={`aspect-square rounded-[2px] ${
                      isDone
                        ? "bg-accent"
                        : isFuture
                          ? "bg-surface-alt/40"
                          : "bg-surface-alt"
                    } ${sameDay(day, today) && !isDone ? "ring-1 ring-muted/50" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
