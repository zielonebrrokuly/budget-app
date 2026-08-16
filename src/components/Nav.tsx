"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { SIDEBAR_WIDTH_REM } from "@/lib/layout";
import type { ReactElement } from "react";

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4h4v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

// Dwie osobne skośne strzałki w przeciwległych rogach (bez wspólnych linii, żeby nie
// zlewały się w zygzak) — góra-lewo: w dół-prawo (wydatek), dół-prawo: w górę-prawo
// (przychód) — razem reprezentują Transakcje.
function TransactionsIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <line x1="2" y1="2" x2="10" y2="10" />
      <polyline points="10 2 10 10 2 10" />
      <line x1="14" y1="22" x2="22" y2="14" />
      <polyline points="14 14 22 14 22 22" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <line x1="5" y1="20" x2="5" y2="12" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="19" y1="20" x2="19" y2="15" />
    </svg>
  );
}

// 6 krótkich, szerokich zębów zachodzących na obręcz (nie cienkich promieni jak u słońca).
const GEAR_TEETH_ANGLES = [0, 60, 120, 180, 240, 300];

function GearIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.3" />
      {GEAR_TEETH_ANGLES.map((angle) => (
        <rect
          key={angle}
          x="9.5"
          y="3.7"
          width="5"
          height="3"
          rx="0.8"
          fill="currentColor"
          stroke="none"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const MAIN_LINKS = [
  { href: "/", label: "Dashboard", Icon: HomeIcon },
  { href: "/transakcje", label: "Transakcje", Icon: TransactionsIcon },
  { href: "/podsumowanie", label: "Podsumowanie", Icon: BarChartIcon },
];

const SETTINGS_LINK = { href: "/ustawienia", label: "Ustawienia", Icon: GearIcon };

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: () => ReactElement;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex items-center gap-1.5 h-full px-0.5 translate-y-px text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      <Icon />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function SidebarLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: () => ReactElement;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-accent/15 text-foreground"
          : "text-muted hover:text-foreground hover:bg-surface-alt"
      }`}
    >
      <Icon />
      {label}
    </Link>
  );
}

export function Nav({ authEnabled = false }: { authEnabled?: boolean }) {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Telefon/tablet: pasek na górze. */}
      <header className="lg:hidden border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-6">
          <span className="font-semibold text-foreground tracking-tight mr-2 shrink-0">
            Budżet
          </span>
          <nav className="flex gap-5 overflow-x-auto self-stretch no-scrollbar">
            {MAIN_LINKS.map(({ href, label, Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 shrink-0 self-stretch">
            <NavLink
              href={SETTINGS_LINK.href}
              label={SETTINGS_LINK.label}
              Icon={SETTINGS_LINK.Icon}
              active={isActive(SETTINGS_LINK.href)}
            />
            {authEnabled && (
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
                >
                  Wyloguj
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Desktop: boczna nawigacja. */}
      <aside
        style={{ width: `${SIDEBAR_WIDTH_REM}rem` }}
        className="hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen border-r border-border bg-surface/60 backdrop-blur px-3 py-4 gap-1"
      >
        <span className="font-semibold text-foreground tracking-tight px-3 py-2 mb-2">
          Budżet
        </span>
        <nav className="flex flex-col gap-1">
          {MAIN_LINKS.map(({ href, label, Icon }) => (
            <SidebarLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <SidebarLink
            href={SETTINGS_LINK.href}
            label={SETTINGS_LINK.label}
            Icon={SETTINGS_LINK.Icon}
            active={isActive(SETTINGS_LINK.href)}
          />
          {authEnabled && (
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              >
                <LogoutIcon />
                Wyloguj
              </button>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
