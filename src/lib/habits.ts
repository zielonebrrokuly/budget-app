// Nawyki odhaczasz codziennie. Dzień trzymamy jako północ lokalną — tak samo jak
// zakresy miesięcy w queries.ts, żeby nie mieszać dwóch konwencji w jednej apce.

export const WEEKDAY_SHORT = ["pn", "wt", "śr", "czw", "pt", "sb", "nd"] as const;

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function dayKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function sameDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b);
}

/** Wszystkie dni miesiąca, od 1. do ostatniego — kolejność od lewej do prawej. */
export function monthDays(year: number, month: number) {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1));
}

/** Ile dni z rzędu, licząc wstecz od dziś (albo od wczoraj, jeśli dziś jeszcze nieodhaczone). */
export function currentStreak(doneKeys: Set<string>, today: Date) {
  let streak = 0;
  let cursor = doneKeys.has(dayKey(today)) ? today : addDays(today, -1);
  while (doneKeys.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
