"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { DASHBOARD_SECTION_ORDER_KEY, type DashboardSectionId } from "./dashboardSections";
import { FOOD_BUDGET_CATEGORY, FOOD_BUDGET_DESCRIPTION, DEFAULT_FOOD_BUDGET } from "./foodBudget";
import { TILE_KEYS } from "./tiles";
import { evalAmount } from "./calc";

export type ActionState = { error?: string; success?: boolean };

function parseAmount(value: FormDataEntryValue | null): number {
  // Akceptuje też działania (np. 84/2, 40+15,50) — patrz src/lib/calc.ts.
  const amount = evalAmount(String(value ?? ""));
  if (amount === null || amount <= 0) {
    throw new Error("Podaj poprawną kwotę większą od zera.");
  }
  return amount;
}

function parseDate(value: FormDataEntryValue | null): Date {
  const raw = String(value ?? "");
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Podaj poprawną datę.");
  return date;
}

function parseType(value: FormDataEntryValue | null): "EXPENSE" | "INCOME" {
  if (value === "EXPENSE" || value === "INCOME") return value;
  throw new Error("Nieprawidłowy typ transakcji.");
}

async function assertCategoryExists(type: "EXPENSE" | "INCOME", category: string) {
  const found = await prisma.category.findFirst({ where: { type, name: category } });
  if (!found) throw new Error("Wybierz poprawną kategorię.");
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/transakcje/wydatki");
  revalidatePath("/transakcje/przychody");
  revalidatePath("/transakcje/historia");
  revalidatePath("/podsumowanie");
  revalidatePath("/ustawienia/kategorie");
}

const isFoodMarker = (category: string, description: string | null) =>
  category === FOOD_BUDGET_CATEGORY && description === FOOD_BUDGET_DESCRIPTION;

// Odejmuje `amount` od budżetu Jedzenie w danym miesiącu (albo od 1000, gdy brak wpisu).
// Ten sam wzorzec find-or-create + audyt co setFoodBudget. Miesiąc liczony w UTC,
// bo daty transakcji zapisujemy jako północ UTC.
async function deductFromFoodBudget(date: Date, amount: number) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));

  const existing = await prisma.transaction.findFirst({
    where: {
      type: "EXPENSE",
      category: FOOD_BUDGET_CATEGORY,
      description: FOOD_BUDGET_DESCRIPTION,
      date: { gte: start, lt: end },
    },
  });

  const base = existing ? existing.amount : DEFAULT_FOOD_BUDGET;
  const newAmount = Math.max(0, Math.round((base - amount) * 100) / 100);

  if (existing) {
    await prisma.$transaction([
      prisma.transactionAudit.create({
        data: {
          transactionId: existing.id,
          action: "UPDATED",
          type: existing.type,
          oldDate: existing.date,
          oldAmount: existing.amount,
          oldCategory: existing.category,
          oldDescription: existing.description,
          newDate: existing.date,
          newAmount,
          newCategory: existing.category,
          newDescription: existing.description,
        },
      }),
      prisma.transaction.update({ where: { id: existing.id }, data: { amount: newAmount } }),
    ]);
  } else {
    await assertCategoryExists("EXPENSE", FOOD_BUDGET_CATEGORY);
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        category: FOOD_BUDGET_CATEGORY,
        description: FOOD_BUDGET_DESCRIPTION,
        amount: newAmount,
        date: start,
      },
    });
  }
}

export async function createTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const type = parseType(formData.get("type"));
    const category = String(formData.get("category") ?? "");
    await assertCategoryExists(type, category);

    const amount = parseAmount(formData.get("amount"));
    const date = parseDate(formData.get("date"));
    const description = String(formData.get("description") ?? "").trim() || null;

    await prisma.transaction.create({
      data: { type, category, amount, date, description },
    });

    // Checkbox „Odejmij z karty jedzenie" — obniża budżet Jedzenie o kwotę tego wydatku.
    if (
      formData.get("deductFromFood") &&
      type === "EXPENSE" &&
      !isFoodMarker(category, description)
    ) {
      await deductFromFoodBudget(date, amount);
    }

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function updateTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Brak identyfikatora transakcji." };

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) return { error: "Nie znaleziono transakcji." };

    const type = parseType(formData.get("type"));
    const category = String(formData.get("category") ?? "");
    await assertCategoryExists(type, category);

    const amount = parseAmount(formData.get("amount"));
    const date = parseDate(formData.get("date"));
    const description = String(formData.get("description") ?? "").trim() || null;

    await prisma.$transaction([
      prisma.transactionAudit.create({
        data: {
          transactionId: existing.id,
          action: "UPDATED",
          type: existing.type,
          oldDate: existing.date,
          oldAmount: existing.amount,
          oldCategory: existing.category,
          oldDescription: existing.description,
          newDate: date,
          newAmount: amount,
          newCategory: category,
          newDescription: description,
        },
      }),
      prisma.transaction.update({
        where: { id },
        data: { category, amount, date, description },
      }),
    ]);

    // Checkbox „Odejmij z karty jedzenie" — obniża budżet Jedzenie o kwotę tego wpisu.
    if (
      formData.get("deductFromFood") &&
      type === "EXPENSE" &&
      !isFoodMarker(category, description)
    ) {
      await deductFromFoodBudget(date, amount);
    }

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function deleteTransaction(id: string) {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.$transaction([
    prisma.transactionAudit.create({
      data: {
        transactionId: existing.id,
        action: "DELETED",
        type: existing.type,
        oldDate: existing.date,
        oldAmount: existing.amount,
        oldCategory: existing.category,
        oldDescription: existing.description,
      },
    }),
    prisma.transaction.delete({ where: { id } }),
  ]);

  revalidateAll();
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const type = parseType(formData.get("type"));
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Podaj nazwę kategorii." };

    const existing = await prisma.category.findFirst({ where: { type, name } });
    if (existing) return { error: "Taka kategoria już istnieje." };

    await prisma.category.create({ data: { type, name } });

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function renameCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!id) return { error: "Brak identyfikatora kategorii." };
    if (!name) return { error: "Podaj nazwę kategorii." };

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { error: "Nie znaleziono kategorii." };

    const duplicate = await prisma.category.findFirst({
      where: { type: category.type, name, NOT: { id } },
    });
    if (duplicate) return { error: "Taka kategoria już istnieje." };

    await prisma.$transaction([
      prisma.category.update({ where: { id }, data: { name } }),
      prisma.transaction.updateMany({
        where: { type: category.type, category: category.name },
        data: { category: name },
      }),
    ]);

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function deleteCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Brak identyfikatora kategorii." };

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { error: "Nie znaleziono kategorii." };

    const inUse = await prisma.transaction.count({
      where: { type: category.type, category: category.name },
    });
    if (inUse > 0) {
      return {
        error: `Nie można usunąć — ${inUse} transakcji używa tej kategorii.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function updateTileVisibility(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await Promise.all(
      TILE_KEYS.map((key) => {
        const value = formData.get(key) ? "on" : "off";
        return prisma.setting.upsert({
          where: { key: `tile_${key}` },
          create: { key: `tile_${key}`, value },
          update: { value },
        });
      }),
    );

    revalidatePath("/");
    revalidatePath("/ustawienia/kafelki");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function updateDashboardSectionOrder(order: DashboardSectionId[]) {
  await prisma.setting.upsert({
    where: { key: DASHBOARD_SECTION_ORDER_KEY },
    create: { key: DASHBOARD_SECTION_ORDER_KEY, value: JSON.stringify(order) },
    update: { value: JSON.stringify(order) },
  });
  revalidatePath("/");
}

export async function addPlannedExpense(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const year = Number(formData.get("year"));
    const month = Number(formData.get("month"));
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Podaj nazwę." };
    const amount = parseAmount(formData.get("amount"));

    await prisma.plannedExpense.create({ data: { year, month, name, amount } });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}

export async function togglePlannedExpensePaid(id: string, isPaid: boolean) {
  await prisma.plannedExpense.update({ where: { id }, data: { isPaid } });
  revalidatePath("/");
}

export async function deletePlannedExpense(id: string) {
  await prisma.plannedExpense.delete({ where: { id } });
  revalidatePath("/");
}

export async function setFoodBudget(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const year = Number(formData.get("year"));
    const month = Number(formData.get("month"));
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return { error: "Nieprawidłowy miesiąc." };
    }
    await assertCategoryExists("EXPENSE", FOOD_BUDGET_CATEGORY);

    // Północ UTC — spójnie z resztą danych (reimport + daty z formularza),
    // żeby marker trafiał we właściwy miesiąc niezależnie od strefy serwera.
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));

    const existing = await prisma.transaction.findFirst({
      where: {
        type: "EXPENSE",
        category: FOOD_BUDGET_CATEGORY,
        description: FOOD_BUDGET_DESCRIPTION,
        date: { gte: start, lt: end },
      },
    });

    const amount = parseAmount(formData.get("amount"));

    if (existing) {
      await prisma.$transaction([
        prisma.transactionAudit.create({
          data: {
            transactionId: existing.id,
            action: "UPDATED",
            type: existing.type,
            oldDate: existing.date,
            oldAmount: existing.amount,
            oldCategory: existing.category,
            oldDescription: existing.description,
            newDate: existing.date,
            newAmount: amount,
            newCategory: existing.category,
            newDescription: existing.description,
          },
        }),
        prisma.transaction.update({ where: { id: existing.id }, data: { amount } }),
      ]);
    } else {
      await prisma.transaction.create({
        data: {
          type: "EXPENSE",
          category: FOOD_BUDGET_CATEGORY,
          description: FOOD_BUDGET_DESCRIPTION,
          amount,
          date: start,
        },
      });
    }

    revalidateAll();
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Coś poszło nie tak." };
  }
}
