import { Card } from "@/components/Card";
import { CategoryMonthCell } from "@/components/CategoryMonthCell";
import { CategoryTrendChart } from "@/components/CategoryTrendChart";
import { SavingsTrendChart } from "@/components/SavingsTrendChart";
import { MONTH_NAMES } from "@/lib/categories";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  getAvailableYears,
  getCategoryNames,
  getYearlyCategoryDetails,
  type CategoryMonthTransaction,
} from "@/lib/queries";

const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

function sumRow(row: number[]) {
  return row.reduce((a, b) => a + b, 0);
}

export default async function PodsumowaniePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();

  const [years, incomeTable, expenseTable, incomeCategories, expenseCategories] =
    await Promise.all([
      getAvailableYears(),
      getYearlyCategoryDetails(year, "INCOME"),
      getYearlyCategoryDetails(year, "EXPENSE"),
      getCategoryNames("INCOME"),
      getCategoryNames("EXPENSE"),
    ]);

  const emptyTransactions: CategoryMonthTransaction[][] = Array.from({ length: 12 }, () => []);

  const incomeRows = incomeCategories.map((category) => {
    const entry = incomeTable.get(category);
    return {
      category,
      values: entry?.values ?? new Array(12).fill(0),
      transactions: entry?.transactions ?? emptyTransactions,
    };
  });
  const expenseRows = expenseCategories.map((category) => {
    const entry = expenseTable.get(category);
    return {
      category,
      values: entry?.values ?? new Array(12).fill(0),
      transactions: entry?.transactions ?? emptyTransactions,
    };
  });

  const incomeByMonth = new Array(12).fill(0);
  for (const row of incomeRows) row.values.forEach((v, i) => (incomeByMonth[i] += v));
  const expenseByMonth = new Array(12).fill(0);
  for (const row of expenseRows) row.values.forEach((v, i) => (expenseByMonth[i] += v));

  const savingsByMonth = incomeByMonth.map((v, i) => v - expenseByMonth[i]);
  const balanceByMonth = savingsByMonth.reduce<number[]>((acc, v, i) => {
    acc.push((acc[i - 1] ?? 0) + v);
    return acc;
  }, []);

  const savingsTrendData = MONTH_SHORT.map((m, i) => ({
    month: m,
    income: incomeByMonth[i],
    expense: expenseByMonth[i],
    rate:
      incomeByMonth[i] > 0
        ? Math.round(((incomeByMonth[i] - expenseByMonth[i]) / incomeByMonth[i]) * 1000) / 10
        : 0,
  }));

  const monthlyByCategory: Record<string, number[]> = {};
  for (const row of expenseRows) monthlyByCategory[row.category] = row.values;

  const dataRows = (
    rows: { category: string; values: number[]; transactions: CategoryMonthTransaction[][] }[],
    label: string,
  ) => (
    <>
      <tr>
        <td
          colSpan={15}
          className="sticky left-0 bg-surface-alt text-xs uppercase tracking-wide text-muted font-semibold px-3 py-2"
        >
          {label}
        </td>
      </tr>
      {rows.map((row) => {
        const total = sumRow(row.values);
        const avg = total / 12;
        return (
          <tr key={row.category} className="hover:bg-surface-alt/60">
            <td className="sticky left-0 bg-surface px-3 py-1.5 text-foreground whitespace-nowrap">
              {row.category}
            </td>
            {row.values.map((v, i) => (
              <CategoryMonthCell
                key={i}
                amount={v}
                transactions={row.transactions[i]}
                label={`${row.category} — ${MONTH_NAMES[i]} ${year}`}
              />
            ))}
            <td className="px-2 py-1.5 text-right text-foreground font-medium tabular-nums">
              {formatNumber(avg)}
            </td>
            <td className="px-2 py-1.5 text-right text-foreground font-medium tabular-nums">
              {formatNumber(total)}
            </td>
          </tr>
        );
      })}
    </>
  );

  const totalsRow = (label: string, values: number[], colorClass = "text-foreground") => {
    const total = sumRow(values);
    const avg = total / 12;
    return (
      <tr className="border-t border-border font-semibold">
        <td className="sticky left-0 bg-surface px-3 py-2 text-foreground whitespace-nowrap">
          {label}
        </td>
        {values.map((v, i) => (
          <td key={i} className={`px-2 py-2 text-right tabular-nums ${colorClass}`}>
            {formatNumber(v)}
          </td>
        ))}
        <td className={`px-2 py-2 text-right tabular-nums ${colorClass}`}>{formatNumber(avg)}</td>
        <td className={`px-2 py-2 text-right tabular-nums ${colorClass}`}>{formatNumber(total)}</td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Podsumowanie roczne</h1>
        <p className="text-muted text-sm mt-1">Kategorie w podziale na miesiące — {year}</p>
      </div>

      <Card>
        <form className="flex items-end gap-3" action="/podsumowanie">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Rok
            <select
              name="year"
              defaultValue={year}
              className="rounded-xl bg-surface-alt border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Pokaż
          </button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-max text-sm border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="sticky left-0 bg-surface px-3 py-2 text-left">Kategoria</th>
                {MONTH_SHORT.map((m) => (
                  <th key={m} className="px-2 py-2 text-right font-medium">
                    {m}
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-medium">Śr.</th>
                <th className="px-2 py-2 text-right font-medium">Suma</th>
              </tr>
            </thead>
            <tbody>
              {dataRows(incomeRows, "Przychody")}
              {dataRows(expenseRows, "Wydatki")}
              <tr>
                <td colSpan={15} className="sticky left-0 bg-surface-alt text-xs uppercase tracking-wide text-muted font-semibold px-3 py-2">
                  Podsumowanie
                </td>
              </tr>
              {totalsRow("Przychody łącznie", incomeByMonth, "text-positive")}
              {totalsRow("Wydatki łącznie", expenseByMonth, "text-negative")}
              {totalsRow("Oszczędności", savingsByMonth)}
              {totalsRow("Saldo narastające", balanceByMonth)}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted">
        Roczne saldo końcowe: <span className="text-foreground font-medium">{formatCurrency(balanceByMonth[11] ?? 0)}</span>
      </p>

      <Card>
        <h2 className="font-medium text-foreground mb-4">Trend oszczędności — {year}</h2>
        <div className="h-56">
          <SavingsTrendChart data={savingsTrendData} />
        </div>
      </Card>

      <Card>
        <h2 className="font-medium text-foreground mb-4">Trend kategorii — {year}</h2>
        <CategoryTrendChart
          categories={expenseCategories}
          monthlyByCategory={monthlyByCategory}
          monthLabels={MONTH_SHORT}
        />
      </Card>
    </div>
  );
}
