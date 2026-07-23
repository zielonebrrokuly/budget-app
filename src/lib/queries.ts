import { prisma } from "./prisma";
import { DASHBOARD_SECTIONS, DASHBOARD_SECTION_ORDER_KEY, type DashboardSectionId } from "./dashboardSections";
import { FOOD_BUDGET_CATEGORY, FOOD_BUDGET_DESCRIPTION } from "./foodBudget";
import { TILE_KEYS, type TileKey } from "./tiles";

export async function getDashboardSectionOrder(): Promise<DashboardSectionId[]> {
  const setting = await prisma.setting.findUnique({ where: { key: DASHBOARD_SECTION_ORDER_KEY } });
  if (!setting) return [...DASHBOARD_SECTIONS];

  try {
    const parsed: unknown = JSON.parse(setting.value);
    if (!Array.isArray(parsed)) return [...DASHBOARD_SECTIONS];
    const valid = parsed.filter((id): id is DashboardSectionId =>
      (DASHBOARD_SECTIONS as readonly string[]).includes(id),
    );
    const missing = DASHBOARD_SECTIONS.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return [...DASHBOARD_SECTIONS];
  }
}

export async function getTileVisibility(): Promise<Record<TileKey, boolean>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: TILE_KEYS.map((k) => `tile_${k}`) } },
  });
  const overrides = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(
    TILE_KEYS.map((k) => [k, overrides.get(`tile_${k}`) !== "off"]),
  ) as Record<TileKey, boolean>;
}

export async function getCategories(type: "EXPENSE" | "INCOME") {
  return prisma.category.findMany({
    where: { type },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCategoryNames(type: "EXPENSE" | "INCOME") {
  const categories = await getCategories(type);
  return categories.map((c) => c.name);
}

export async function getTransactionAudits(filter: {
  type?: "EXPENSE" | "INCOME";
  action?: "UPDATED" | "DELETED";
} = {}) {
  return prisma.transactionAudit.findMany({
    where: {
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.action ? { action: filter.action } : {}),
    },
    orderBy: { changedAt: "desc" },
    take: 200,
  });
}

function monthRange(year: number, month: number) {
  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
}

export async function getMonthTotals(year: number, month: number) {
  const { start, end } = monthRange(year, month);
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME", date: { gte: start, lt: end } },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE", date: { gte: start, lt: end } },
    }),
  ]);
  const income = incomeAgg._sum.amount ?? 0;
  const expense = expenseAgg._sum.amount ?? 0;
  return { income, expense, savings: income - expense };
}

export async function getRunningBalance(year: number, throughMonth: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, throughMonth + 1, 1);
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME", date: { gte: start, lt: end } },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE", date: { gte: start, lt: end } },
    }),
  ]);
  return (incomeAgg._sum.amount ?? 0) - (expenseAgg._sum.amount ?? 0);
}

export async function getCategoryBreakdown(
  year: number,
  month: number,
  type: "EXPENSE" | "INCOME",
) {
  const { start, end } = monthRange(year, month);
  const rows = await prisma.transaction.groupBy({
    by: ["category"],
    where: { type, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return rows
    .map((r) => ({ category: r.category, amount: r._sum.amount ?? 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getTransactions(
  type: "EXPENSE" | "INCOME",
  year: number,
  month?: number,
  category?: string,
) {
  const { start, end } =
    month === undefined
      ? { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) }
      : monthRange(year, month);

  return prisma.transaction.findMany({
    where: {
      type,
      date: { gte: start, lt: end },
      ...(category ? { category } : {}),
    },
    orderBy: { date: "desc" },
  });
}

export async function getAvailableYears() {
  const rows = await prisma.transaction.findMany({ select: { date: true } });
  const years = new Set(rows.map((r) => r.date.getFullYear()));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export async function getPlannedExpenses(year: number, month: number) {
  return prisma.plannedExpense.findMany({
    where: { year, month },
    orderBy: { createdAt: "asc" },
  });
}

export async function getFoodBudget(year: number, month: number) {
  const { start, end } = monthRange(year, month);
  return prisma.transaction.findFirst({
    where: {
      type: "EXPENSE",
      category: FOOD_BUDGET_CATEGORY,
      description: FOOD_BUDGET_DESCRIPTION,
      date: { gte: start, lt: end },
    },
  });
}

export type CategoryMonthTransaction = {
  id: string;
  date: Date;
  amount: number;
  description: string | null;
};

export async function getYearlyCategoryDetails(
  year: number,
  type: "EXPENSE" | "INCOME",
) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const rows = await prisma.transaction.findMany({
    where: { type, date: { gte: start, lt: end } },
    select: { id: true, category: true, amount: true, date: true, description: true },
    orderBy: { date: "asc" },
  });

  const table = new Map<
    string,
    { values: number[]; transactions: CategoryMonthTransaction[][] }
  >();

  for (const row of rows) {
    if (!table.has(row.category)) {
      table.set(row.category, {
        values: new Array(12).fill(0),
        transactions: Array.from({ length: 12 }, () => []),
      });
    }
    const entry = table.get(row.category)!;
    const month = row.date.getMonth();
    entry.values[month] += row.amount;
    entry.transactions[month].push({
      id: row.id,
      date: row.date,
      amount: row.amount,
      description: row.description,
    });
  }
  return table;
}
