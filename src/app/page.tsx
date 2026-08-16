import { Card } from "@/components/Card";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { DashboardSections } from "@/components/DashboardSections";
import { DashboardTiles } from "@/components/DashboardTiles";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { PlannedExpensesList } from "@/components/PlannedExpensesList";
import { RecentTransactionsList } from "@/components/RecentTransactionsList";
import { MONTH_NAMES } from "@/lib/categories";
import type { DashboardSectionId } from "@/lib/dashboardSections";
import {
  getCategoryBreakdown,
  getDashboardSectionOrder,
  getMonthTotals,
  getPlannedExpenses,
  getRecentTransactions,
  getRecentTransactionsLimit,
  getRunningBalance,
  getTileVisibility,
} from "@/lib/queries";
import { TILE_KEYS, type TileKey } from "@/lib/tiles";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = now.getFullYear();
  const selectedMonth = params.month !== undefined ? Number(params.month) : now.getMonth();

  const [totals, runningBalance, breakdown, plannedExpenses, tileVisibility, sectionOrder, recentLimit] =
    await Promise.all([
      getMonthTotals(year, selectedMonth),
      getRunningBalance(year, selectedMonth),
      getCategoryBreakdown(year, selectedMonth, "EXPENSE"),
      getPlannedExpenses(year, selectedMonth),
      getTileVisibility(),
      getDashboardSectionOrder(),
      getRecentTransactionsLimit(),
    ]);

  // Liczba pokazanych ostatnich transakcji nie przekracza limitu z Ustawień,
  // ale też nie jest większa niż liczba wierszy w legendzie wykresu kategorii —
  // żeby obie kolumny (lista i wykres) miały zbliżoną wysokość.
  const visibleRecentCount = breakdown.length > 0 ? Math.min(recentLimit, breakdown.length) : recentLimit;
  const recentTransactions = await getRecentTransactions(visibleRecentCount);

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${year}`;

  const tileValues: Record<TileKey, number> = {
    income: totals.income,
    expense: totals.expense,
    savingsMonth: totals.savings,
    savingsTotal: runningBalance,
  };
  const anyTileVisible = TILE_KEYS.some((k) => tileVisibility[k]);

  const sections: Partial<Record<DashboardSectionId, React.ReactNode>> = {
    tiles: anyTileVisible ? (
      <DashboardTiles visibility={tileVisibility} values={tileValues} />
    ) : undefined,

    categoryChart: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-medium text-foreground mb-4">Ostatnie transakcje</h2>
          <RecentTransactionsList transactions={recentTransactions} />
        </Card>
        <Card>
          <h2 className="font-medium text-foreground mb-4">Wydatki wg kategorii — {monthLabel}</h2>
          <CategoryPieChart data={breakdown} />
        </Card>
      </div>
    ),

    toPay: (
      <Card>
        <h2 className="font-medium text-foreground mb-4">Do zapłacenia — {monthLabel}</h2>
        <PlannedExpensesList expenses={plannedExpenses} year={year} month={selectedMonth} />
      </Card>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Podsumowanie: {monthLabel}</p>
      </div>

      <MonthSwitcher selectedMonth={selectedMonth} />

      <DashboardSections initialOrder={sectionOrder} sections={sections} />
    </div>
  );
}
