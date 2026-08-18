"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useSyncExternalStore, type ReactElement } from "react";

// Stan zwinięcia menu trzymamy w localStorage (preferencja per urządzenie, nie
// per konto) i dublujemy na <html data-sidebar-collapsed>, bo to atrybut steruje
// CSS-em — dzięki temu skrypt w layoucie ustawia wygląd przed pierwszym malowaniem.
const SIDEBAR_STORAGE_KEY = "sidebar_collapsed";
const sidebarListeners = new Set<() => void>();

function subscribeSidebar(onChange: () => void) {
  sidebarListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    sidebarListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setSidebarCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {}
  if (collapsed) {
    document.documentElement.dataset.sidebarCollapsed = "1";
  } else {
    delete document.documentElement.dataset.sidebarCollapsed;
  }
  sidebarListeners.forEach((listener) => listener());
}

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

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg {...iconProps} width={20} height={20} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9" y1="4" x2="9" y2="20" />
      {collapsed ? (
        <polyline points="13.5 9.5 16.5 12 13.5 14.5" />
      ) : (
        <polyline points="16.5 9.5 13.5 12 16.5 14.5" />
      )}
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

// Kolejność zakładek dolnego paska. Liczba pozycji musi się zgadzać z dzielnikiem
// w .tabbar-thumb (globals.css), bo z niego wynika szerokość suwaka.
const TAB_LINKS = [...MAIN_LINKS, SETTINGS_LINK];

// Zakładka dolnego paska (telefon): ikona nad podpisem, aktywna w pigułce.
function TabBarLink({
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
      aria-current={active ? "page" : undefined}
      className={`relative z-10 flex flex-1 min-w-0 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 transition-colors ${
        active ? "text-accent" : "text-muted"
      }`}
    >
      <Icon />
      <span className="text-[10px] font-medium leading-tight truncate max-w-full">{label}</span>
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
      title={label}
      aria-label={label}
      className={`sidebar-row flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-accent/15 text-foreground"
          : "text-muted hover:text-foreground hover:bg-surface-alt"
      }`}
    >
      <Icon />
      <span className="sidebar-label">{label}</span>
    </Link>
  );
}

export function Nav({ authEnabled = false }: { authEnabled?: boolean }) {
  const pathname = usePathname();
  // Serwer nie zna localStorage — na serwerze zawsze "rozwinięte"; o wygląd
  // przed hydracją dba skrypt + CSS, więc nie ma mrugnięcia.
  const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarCollapsed, () => false);

  if (pathname === "/login") return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const activeTabIndex = TAB_LINKS.findIndex(({ href }) => isActive(href));

  return (
    <>
      {/* Telefon/tablet: samo wylogowanie. Celowo BEZ sticky — pasek przewija
          się razem z treścią, więc ikona znika przy przewijaniu w dół i wraca
          dopiero na samej górze. Nawigacja jest na dolnym pasku. */}
      {authEnabled && (
        <header className="lg:hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 flex justify-end">
            <form action={logout}>
              <button
                type="submit"
                aria-label="Wyloguj"
                title="Wyloguj"
                className="flex p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              >
                <LogoutIcon />
              </button>
            </form>
          </div>
        </header>
      )}

      {/* Telefon/tablet: pasek zakładek na dole. pb uwzględnia pasek gestów
          iPhone'a, żeby zakładki nie chowały się pod nim. */}
      <nav
        aria-label="Nawigacja główna"
        className="lg:hidden fixed inset-x-0 bottom-0 z-20 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {/* Siatka bez odstępów — suwak ma szerokość dokładnie jednej zakładki. */}
        <div
          className="tabbar-track relative flex items-center rounded-3xl border border-border bg-surface/95 backdrop-blur px-2 py-2 shadow-lg shadow-black/30"
          style={{ ["--tab" as string]: Math.max(activeTabIndex, 0) }}
        >
          {activeTabIndex >= 0 && (
            <span
              aria-hidden="true"
              className="tabbar-thumb pointer-events-none absolute top-2 left-2 rounded-2xl bg-accent/15"
            />
          )}
          {TAB_LINKS.map(({ href, label, Icon }) => (
            <TabBarLink key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
          ))}
        </div>
      </nav>

      {/* Desktop: boczna nawigacja. */}
      <aside
        style={{ width: "var(--sidebar-w)" }}
        className="hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen border-r border-border bg-surface/60 backdrop-blur px-3 py-4 gap-1"
      >
        <div className="sidebar-row flex items-center justify-between mb-2">
          <span className="sidebar-label font-semibold text-foreground tracking-tight px-3">
            Budżet
          </span>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!collapsed)}
            title={collapsed ? "Rozwiń menu" : "Zwiń menu"}
            aria-label={collapsed ? "Rozwiń menu" : "Zwiń menu"}
            aria-expanded={!collapsed}
            className="shrink-0 p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>
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
                title="Wyloguj"
                className="sidebar-row w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              >
                <LogoutIcon />
                <span className="sidebar-label">Wyloguj</span>
              </button>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
