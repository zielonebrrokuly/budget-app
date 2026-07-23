import { UstawieniaNav } from "@/components/UstawieniaNav";

export default function UstawieniaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Ustawienia</h1>
        <p className="text-muted text-sm mt-1">Ustawienia ogólne aplikacji</p>
      </div>

      <UstawieniaNav />

      {children}
    </div>
  );
}
