import { Card } from "@/components/Card";
import { formatCurrency } from "@/lib/format";
import { TILE_KEYS, TILE_LABELS, type TileKey } from "@/lib/tiles";

function colorFor(key: TileKey, value: number) {
  if (key === "income") return "text-positive";
  if (key === "expense") return "text-negative";
  return value >= 0 ? "text-positive" : "text-negative";
}

export function DashboardTiles({
  visibility,
  values,
}: {
  visibility: Record<TileKey, boolean>;
  values: Record<TileKey, number>;
}) {
  const visible = TILE_KEYS.filter((k) => visibility[k]);

  const colsClass =
    visible.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : visible.length === 3
        ? "sm:grid-cols-3"
        : visible.length === 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-1";

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4`}>{/* kolumny wg liczby widocznych kafelków */}
      {visible.map((key) => (
        <Card key={key}>
          <p className="text-sm text-muted">{TILE_LABELS[key]}</p>
          <p className={`text-xl font-semibold mt-1 ${colorFor(key, values[key])}`}>
            {formatCurrency(values[key])}
          </p>
        </Card>
      ))}
    </div>
  );
}
