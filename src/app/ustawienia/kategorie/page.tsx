import { Card } from "@/components/Card";
import { CategoryAddForm } from "@/components/CategoryAddForm";
import { CategoryRow } from "@/components/CategoryRow";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function UstawieniaKategoriePage() {
  const [expenseCategories, incomeCategories] = await Promise.all([
    getCategories("EXPENSE"),
    getCategories("INCOME"),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="font-medium text-foreground mb-4">Kategorie wydatków</h2>
        <div className="flex flex-col gap-1 mb-4">
          {expenseCategories.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
          {expenseCategories.length === 0 && (
            <p className="text-sm text-muted py-2">Brak kategorii.</p>
          )}
        </div>
        <CategoryAddForm type="EXPENSE" />
      </Card>

      <Card>
        <h2 className="font-medium text-foreground mb-4">Kategorie przychodów</h2>
        <div className="flex flex-col gap-1 mb-4">
          {incomeCategories.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
          {incomeCategories.length === 0 && (
            <p className="text-sm text-muted py-2">Brak kategorii.</p>
          )}
        </div>
        <CategoryAddForm type="INCOME" />
      </Card>
    </div>
  );
}
