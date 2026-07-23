import { TransakcjeNav } from "@/components/TransakcjeNav";

export default function TransakcjeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transakcje</h1>
        <p className="text-muted text-sm mt-1">Wydatki, przychody i historia zmian</p>
      </div>

      <TransakcjeNav />

      {children}
    </div>
  );
}
