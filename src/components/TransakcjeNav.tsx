"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/transakcje/wydatki", label: "Wydatki" },
  { href: "/transakcje/przychody", label: "Przychody" },
  { href: "/transakcje/historia", label: "Historia" },
];

export function TransakcjeNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border pb-4">
      {LINKS.map((link) => {
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
