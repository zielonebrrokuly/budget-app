// Wspólna paleta kolorów kategorii (client-safe, zero importów).
export const CATEGORY_COLORS = [
  "#4c8dfb",
  "#5a97fb",
  "#8f74ff",
  "#7a6bf0",
  "#a78bfa",
  "#5ec9e0",
  "#3ddc9a",
  "#f7c94c",
  "#ff6f8e",
  "#ff3d6e",
  "#c4b5fd",
  "#93c5fd",
];

// Deterministyczny kolor per nazwa kategorii (ta sama kategoria = ten sam kolor
// wszędzie, w przeciwieństwie do CategoryPieChart, gdzie kolor zależy od pozycji
// na liście danego miesiąca).
export function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}
