import { Card } from "@/components/Card";

export default function UstawieniaEksportPage() {
  return (
    <div className="flex flex-col gap-4 max-w-md">
      <Card className="flex flex-col gap-5">
        <div>
          <h2 className="font-medium text-foreground mb-1">Eksport danych</h2>
          <p className="text-sm text-muted">
            Pobierz wszystkie wydatki i przychody jako plik Excel.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="/api/export/transactions"
            className="rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 text-center transition-colors"
          >
            Pobierz jako Excel
          </a>
        </div>
      </Card>

      <Card className="flex flex-col gap-5">
        <div>
          <h2 className="font-medium text-foreground mb-1">Pełny backup</h2>
          <p className="text-sm text-muted">
            Pobierz komplet danych (transakcje, kategorie, historia, do zapłacenia, ustawienia)
            jako plik JSON — przydatne do przeniesienia na nowy serwer lub nową wersję aplikacji.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href="/api/export/backup"
            className="rounded-xl bg-surface-alt hover:bg-surface-alt/70 text-foreground text-sm font-medium px-4 py-2.5 text-center transition-colors"
          >
            Pobierz pełny backup (JSON)
          </a>
        </div>
      </Card>
    </div>
  );
}
