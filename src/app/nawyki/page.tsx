import Link from "next/link";
import { Card } from "@/components/Card";
import { HabitMonthGrid } from "@/components/HabitMonthGrid";
import { HabitHeatmap } from "@/components/HabitHeatmap";
import { MonthPicker } from "@/components/MonthPicker";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { getHabits, getHabitEntries } from "@/lib/queries";
import { MONTH_NAMES } from "@/lib/categories";
import { addDays, monthDays, startOfDay } from "@/lib/habits";

export const dynamic = "force-dynamic";

export default async function NawykiPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const today = startOfDay(new Date());
  const year = today.getFullYear();
  const selectedMonth = params.month !== undefined ? Number(params.month) : today.getMonth();

  const days = monthDays(year, selectedMonth);
  const habits = await getHabits();

  // Sięgamy 60 dni przed miesiąc, żeby seria licząca wstecz od dziś nie urywała
  // się sztucznie na pierwszym dniu oglądanego okresu.
  const from = addDays(days[0], -60);
  const to = addDays(days[days.length - 1], 1);
  const entries = await getHabitEntries(from, to > addDays(today, 1) ? to : addDays(today, 1));

  const done: Record<string, string[]> = {};
  for (const habit of habits) done[habit.id] = Array.from(entries.get(habit.id) ?? []);

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${year}`;

  if (habits.length === 0) {
    return (
      <Card>
        <h1 className="font-medium text-foreground mb-1">Nawyki</h1>
        <p className="text-sm text-muted">
          Nie masz jeszcze żadnych nawyków.{" "}
          <Link href="/ustawienia/nawyki" className="text-accent hover:text-accent-hover">
            Dodaj pierwszy w Ustawieniach
          </Link>
          , a potem odhaczaj je tutaj każdego dnia.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Nawyki — {monthLabel}</h1>

      <MonthPicker selectedMonth={selectedMonth} year={year} basePath="/nawyki" />
      <MonthSwitcher selectedMonth={selectedMonth} basePath="/nawyki" />

      <Card>
        <h2 className="font-medium text-foreground mb-4">Odhaczanie — {monthLabel}</h2>
        <HabitMonthGrid habits={habits} days={days} done={done} today={today} />
      </Card>

      <Card>
        <h2 className="font-medium text-foreground mb-1">Przegląd miesiąca</h2>
        <p className="text-xs text-muted mb-4">
          Ten sam miesiąc w skrócie: gdzie były przerwy i ile dni z rzędu trwa seria.
        </p>
        <HabitHeatmap habits={habits} days={days} done={done} today={today} />
      </Card>
    </div>
  );
}
