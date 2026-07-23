// Client-safe rejestr kafelków dashboardu (zero importów z prisma).
export const TILE_KEYS = ["income", "expense", "savingsMonth", "savingsTotal"] as const;
export type TileKey = (typeof TILE_KEYS)[number];

export const TILE_LABELS: Record<TileKey, string> = {
  income: "Przychody w miesiącu",
  expense: "Wydatki w miesiącu",
  savingsMonth: "Oszczędności w miesiącu",
  savingsTotal: "Oszczędności łącznie",
};
