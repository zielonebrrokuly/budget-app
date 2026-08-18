import { Card } from "@/components/Card";
import { logout } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/session";

export default function UstawieniaKontoPage() {
  const authEnabled = isAuthEnabled();

  return (
    <Card className="max-w-md">
      <h2 className="font-medium text-foreground mb-1">Konto</h2>
      {authEnabled ? (
        <>
          <p className="text-sm text-muted mb-4">
            Jesteś zalogowany. Wylogowanie zamknie sesję na tym urządzeniu.
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-negative hover:bg-surface-alt transition-colors"
            >
              Wyloguj
            </button>
          </form>
        </>
      ) : (
        <p className="text-sm text-muted">
          Logowanie jest wyłączone — aplikacja działa bez hasła, więc nie ma sesji do zamknięcia.
        </p>
      )}
    </Card>
  );
}
