"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/ustawienia/kafelki", label: "Kafelki" },
  { href: "/ustawienia/kategorie", label: "Kategorie" },
  { href: "/ustawienia/eksport", label: "Eksport" },
];

// Zakładkę „Konto" pokazujemy tylko gdy działa logowanie — bez hasła nie ma
// sesji, więc nie byłoby tam czego ustawiać.
export function UstawieniaNav({ authEnabled = false }: { authEnabled?: boolean }) {
  const pathname = usePathname();
  const links = authEnabled
    ? [...LINKS, { href: "/ustawienia/konto", label: "Konto" }]
    : LINKS;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-4">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
              active
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground hover:bg-surface-alt"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
