// Client-safe stałe wykresu kategorii (zero importów).
export const CATEGORY_CHART_TOP_N = 5;

// Sam pierścień ma stałą wysokość odpowiadającą mniej więcej 6 wierszom listy,
// więc nawet przy 1-2 kategoriach sekcja nie robi się niższa.
const DONUT_ROW_EQUIVALENT = 6;

// Na ile wierszy listy „wygląda" karta wykresu przy danej liczbie kategorii
// głównych — używane, żeby lista ostatnich transakcji obok miała zbliżoną wysokość.
export function categoryChartRowEquivalent(categoryCount: number) {
  const legendRows =
    categoryCount <= CATEGORY_CHART_TOP_N ? categoryCount : CATEGORY_CHART_TOP_N + 1;
  return Math.max(legendRows, DONUT_ROW_EQUIVALENT);
}
