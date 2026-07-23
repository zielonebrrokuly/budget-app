import { TransactionForm } from "@/components/TransactionForm";
import { TransactionsSearch } from "@/components/TransactionsSearch";
import { getAvailableYears, getCategoryNames, getTransactions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PrzychodyPage({
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

  const [years, transactions, categories] = await Promise.all([
    getAvailableYears(),
    getTransactions("INCOME", year, month, category),
    getCategoryNames("INCOME"),
  ]);

  const advancedActive =
    !!category || month === undefined || month !== now.getMonth() || year !== now.getFullYear();

  const outlineBox = "bg-surface rounded-2xl p-5";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransactionsSearch
          basePath="/transakcje/przychody"
          years={years}
          year={year}
          month={month}
          filterCategories={categories}
          category={category}
          advancedActive={advancedActive}
          transactions={transactions}
          categories={categories}
          type="INCOME"
          searchClassName="order-1 lg:order-none lg:col-span-3 lg:row-start-1"
          listClassName="order-2 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-2"
        />
        <div className={`order-3 lg:order-none lg:col-start-3 lg:row-start-2 lg:self-start ${outlineBox}`}>
          <h2 className="font-medium text-foreground mb-4">Dodaj przychód</h2>
          <TransactionForm type="INCOME" categories={categories} />
        </div>
      </div>
    </div>
  );
}
