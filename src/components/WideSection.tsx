import type { ReactNode } from "react";

// Sekcja „na całą szerokość" — wychodzi poza kontener strony, ale zostawia
// miejsce na boczne menu. Szerokość menu czytamy ze zmiennej CSS, więc sekcja
// automatycznie się poszerza, gdy menu zostanie zwinięte.
export function WideSection({ children }: { children: ReactNode }) {
  return (
    <div className="lg:relative lg:left-1/2 lg:-translate-x-1/2 lg:[width:calc(100vw-var(--sidebar-w))]">
      <div className="lg:max-w-[1600px] lg:mx-auto lg:px-6">{children}</div>
    </div>
  );
}
