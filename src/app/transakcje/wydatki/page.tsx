import { FoodBudgetPanel } from "@/components/FoodBudgetPanel";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionsSearch } from "@/components/TransactionsSearch";
import { MONTH_NAMES } from "@/lib/categories";
import {
  getAvailableYears,
  getCategoryNames,
  getFoodBudget,
  getTransactions,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WydatkiPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; category?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  // Brak parametru = świeże wejście → domyślnie bieżący miesiąc.
  // Pusty parametr (month="") = jawnie wybrany "Cały rok" → bez filtra miesiąca.
  const month =
    params.month === undefined
      ? now.getMonth()
      : params.month === ""
        ? undefined
        : Number(params.month);
  const category = params.category?.trim() || undefined;

  // Panel budżetu Jedzenie dotyczy konkretnego miesiąca; gdy wybrany "Cały rok",
  // przyjmujemy bieżący miesiąc kalendarzowy.
  const budgetMonth = month ?? now.getMonth();
  const budgetMonthLabel = `${MONTH_NAMES[budgetMonth]} ${year}`;

  const [years, transactions, categories, foodBudget] = await Promise.all([
    getAvailableYears(),
    getTransactions("EXPENSE", year, month, category),
    getCategoryNames("EXPENSE"),
    getFoodBudget(year, budgetMonth),
  ]);

  // Czy „Więcej filtrów" ma być domyślnie rozwinięte (użyty inny okres/kategoria niż domyślny).
  const advancedActive =
    !!category || month === undefined || month !== now.getMonth() || year !== now.getFullYear();

  // Cienka ramka, tło jak strona (bez wypełnienia) — spójny styl dla Szukaj/Jedzenie/Transakcji/Dodaj wydatek.
  const outlineBox = "bg-surface rounded-2xl p-5";

  return (
    <div className="flex flex-col gap-6">
      {/* Jedna wspólna siatka steruje kolejnością na obu szerokościach.
          Na telefonie: Dodaj wydatek → Budżet Jedzenie (order-1) → Szukaj (order-2) → lista (order-3).
          Na desktopie: Szukaj na całą szerokość na górze (row 1), pod spodem (row 2) lista po lewej,
          Dodaj wydatek + Budżet Jedzenie po prawej (oba w jednym flex, żeby ewentualne rozciągnięcie
          przez siatkę dodawało pustą przestrzeń tylko na końcu tej kolumny, nie między nimi). */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="order-1 lg:order-none flex flex-col gap-6 lg:col-start-3 lg:row-start-2">
          <div className={outlineBox}>
            <h2 className="font-medium text-foreground mb-4">Dodaj wydatek</h2>
            <TransactionForm type="EXPENSE" categories={categories} />
          </div>
          <div className={outlineBox}>
            <FoodBudgetPanel
              year={year}
              month={budgetMonth}
              monthLabel={budgetMonthLabel}
              amount={foodBudget?.amount ?? null}
            />
          </div>
        </div>
        <TransactionsSearch
          basePath="/transakcje/wydatki"
          years={years}
          year={year}
          month={month}
          filterCategories={categories}
          category={category}
          advancedActive={advancedActive}
          transactions={transactions}
          categories={categories}
          type="EXPENSE"
          searchClassName="order-2 lg:order-none lg:col-span-3 lg:row-start-1"
          listClassName="order-3 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-2"
        />
      </div>
    </div>
  );
}

