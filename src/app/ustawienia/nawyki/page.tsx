import { Card } from "@/components/Card";
import { HabitAddForm } from "@/components/HabitAddForm";
import { HabitRow } from "@/components/HabitRow";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UstawieniaNawykiPage() {
  const habits = await prisma.habit.findMany({
    orderBy: [{ archived: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { entries: true } } },
  });

  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);

  return (
    <Card className="max-w-lg">
      <h2 className="font-medium text-foreground mb-1">Nawyki</h2>
      <p className="text-sm text-muted mb-4">
        Nawyki odhaczasz codziennie w zakładce Nawyki. Archiwizacja zdejmuje nawyk z listy, ale
        zachowuje odhaczone dni — usunięcie kasuje je bezpowrotnie.
      </p>

      <div className="flex flex-col gap-1 mb-4">
        {active.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={{
              id: habit.id,
              name: habit.name,
              archived: habit.archived,
              entryCount: habit._count.entries,
            }}
          />
        ))}
        {active.length === 0 && (
          <p className="text-sm text-muted py-2">Brak nawyków — dodaj pierwszy poniżej.</p>
        )}
      </div>

      <HabitAddForm />

      {archived.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted mb-2">Zarchiwizowane</h3>
          <div className="flex flex-col gap-1">
            {archived.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={{
                  id: habit.id,
                  name: habit.name,
                  archived: habit.archived,
                  entryCount: habit._count.entries,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
