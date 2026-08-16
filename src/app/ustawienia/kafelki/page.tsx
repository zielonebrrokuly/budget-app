import { Card } from "@/components/Card";
import { TileVisibilityForm } from "@/components/TileVisibilityForm";
import { RecentTransactionsLimitForm } from "@/components/RecentTransactionsLimitForm";
import { getTileVisibility, getRecentTransactionsLimit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function UstawieniaKafelkiPage() {
  const [enabled, recentLimit] = await Promise.all([
    getTileVisibility(),
    getRecentTransactionsLimit(),
  ]);

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <Card>
        <h2 className="font-medium text-foreground mb-1">Kafelki na dashboardzie</h2>
        <p className="text-sm text-muted mb-4">
          Zaznacz, które kafelki mają być widoczne w sekcji podsumowania na dashboardzie.
        </p>
        <TileVisibilityForm enabled={enabled} />
      </Card>

      <Card>
        <h2 className="font-medium text-foreground mb-1">Ostatnie transakcje</h2>
        <p className="text-sm text-muted mb-4">
          Górny limit liczby transakcji w sekcji „Ostatnie transakcje&rdquo; na dashboardzie —
          rzeczywista liczba może być mniejsza, jeśli wykres kategorii ma mniej wierszy.
        </p>
        <RecentTransactionsLimitForm limit={recentLimit} />
      </Card>
    </div>
  );
}
