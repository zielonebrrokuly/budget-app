import { Card } from "@/components/Card";
import { AuditEntryCard } from "@/components/AuditEntryCard";
import { getTransactionAudits } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HistoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; action?: string }>;
}) {
  const params = await searchParams;
  const type = params.type === "EXPENSE" || params.type === "INCOME" ? params.type : undefined;
  const action =
    params.action === "UPDATED" || params.action === "DELETED" ? params.action : undefined;

  const audits = await getTransactionAudits({ type, action });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <form className="flex flex-wrap items-end gap-3" action="/transakcje/historia">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Typ
            <select
              name="type"
              defaultValue={type ?? ""}
              className="rounded-xl bg-surface-alt border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Wszystkie</option>
              <option value="EXPENSE">Wydatki</option>
              <option value="INCOME">Przychody</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Akcja
            <select
              name="action"
              defaultValue={action ?? ""}
              className="rounded-xl bg-surface-alt border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Wszystkie</option>
              <option value="UPDATED">Zmienione</option>
              <option value="DELETED">Usunięte</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Filtruj
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {audits.length === 0 && (
          <p className="text-sm text-muted py-6 text-center">Brak wpisów w historii.</p>
        )}
        {audits.map((audit) => (
          <AuditEntryCard key={audit.id} audit={audit} />
        ))}
      </div>
    </div>
  );
}
