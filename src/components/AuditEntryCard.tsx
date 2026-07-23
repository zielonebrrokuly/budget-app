import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

type Audit = {
  id: string;
  action: string;
  type: string;
  oldDate: Date;
  oldAmount: number;
  oldCategory: string;
  oldDescription: string | null;
  newDate: Date | null;
  newAmount: number | null;
  newCategory: string | null;
  newDescription: string | null;
  changedAt: Date;
};

function Field({
  label,
  oldValue,
  newValue,
}: {
  label: string;
  oldValue: string;
  newValue?: string;
}) {
  const changed = newValue !== undefined && newValue !== oldValue;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
      {newValue === undefined ? (
        <span className="text-sm text-foreground">{oldValue}</span>
      ) : changed ? (
        <span className="text-sm">
          <span className="text-muted line-through">{oldValue}</span>{" "}
          <span className="text-foreground font-medium">→ {newValue}</span>
        </span>
      ) : (
        <span className="text-sm text-foreground">{oldValue}</span>
      )}
    </div>
  );
}

export function AuditEntryCard({ audit }: { audit: Audit }) {
  const isDelete = audit.action === "DELETED";
  const isUpdate = !isDelete;

  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isDelete ? "bg-negative/15 text-negative" : "bg-accent/15 text-accent"
            }`}
          >
            {isDelete ? "Usunięto" : "Zmieniono"}
          </span>
          <span className="text-xs text-muted">
            {audit.type === "EXPENSE" ? "Wydatek" : "Przychód"}
          </span>
        </div>
        <span className="text-xs text-muted">{formatDateTime(audit.changedAt)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field
          label="Data"
          oldValue={formatDate(audit.oldDate)}
          newValue={isUpdate && audit.newDate ? formatDate(audit.newDate) : undefined}
        />
        <Field
          label="Kwota"
          oldValue={formatCurrency(audit.oldAmount)}
          newValue={isUpdate && audit.newAmount !== null ? formatCurrency(audit.newAmount) : undefined}
        />
        <Field
          label="Kategoria"
          oldValue={audit.oldCategory}
          newValue={isUpdate ? audit.newCategory ?? undefined : undefined}
        />
        <Field
          label="Opis"
          oldValue={audit.oldDescription ?? "—"}
          newValue={isUpdate ? audit.newDescription ?? "—" : undefined}
        />
      </div>
    </div>
  );
}
