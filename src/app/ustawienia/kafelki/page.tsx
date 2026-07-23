import { Card } from "@/components/Card";
import { TileVisibilityForm } from "@/components/TileVisibilityForm";
import { getTileVisibility } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function UstawieniaKafelkiPage() {
  const enabled = await getTileVisibility();

  return (
    <Card className="max-w-md">
      <h2 className="font-medium text-foreground mb-1">Kafelki na dashboardzie</h2>
      <p className="text-sm text-muted mb-4">
        Zaznacz, które kafelki mają być widoczne w sekcji podsumowania na dashboardzie.
      </p>
      <TileVisibilityForm enabled={enabled} />
    </Card>
  );
}
