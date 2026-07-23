"use client";

import { useMemo, useState } from "react";
import { PeriodFilter } from "@/components/PeriodFilter";
import { TransactionsList } from "@/components/TransactionsList";

type Transaction = {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string | null;
};

const outlineBox = "bg-surface rounded-2xl p-5";

// Łączy pasek "Szukaj" (PeriodFilter) z listą transakcji: wpisywanie frazy zawęża
// listę NATYCHMIAST w przeglądarce (bez przeładowania strony), bo wszystkie transakcje
// za wybrany okres/kategorię są już wczytane. Rok/Miesiąc/Kategoria nadal wymagają
// prawdziwego przeładowania (inny zakres danych z serwera).
export function TransactionsSearch({
  basePath,
  years,
  year,
  month,
  filterCategories,
  category,
  advancedActive,
  transactions,
  categories,
  type,
  searchClassName,
  listClassName,
}: {
  basePath: string;
  years: number[];
  year: number;
  month?: number;
  filterCategories?: string[];
  category?: string;
  advancedActive?: boolean;
  transactions: Transaction[];
  categories: readonly string[];
  type: "EXPENSE" | "INCOME";
  searchClassName?: string;
  listClassName?: string;
}) {
  const [liveQuery, setLiveQuery] = useState("");

  const filtered = useMemo(() => {
    const q = liveQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.category.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }, [transactions, liveQuery]);

  return (
    <>
      <div className={`${outlineBox} ${searchClassName ?? ""}`}>
        <PeriodFilter
          basePath={basePath}
          years={years}
          year={year}
          month={month}
          categories={filterCategories}
          category={category}
          advancedActive={advancedActive}
          liveQuery={liveQuery}
          onLiveQueryChange={setLiveQuery}
        />
      </div>
      <div className={`${outlineBox} ${listClassName ?? ""}`}>
        <TransactionsList transactions={filtered} categories={categories} type={type} />
      </div>
    </>
  );
}
