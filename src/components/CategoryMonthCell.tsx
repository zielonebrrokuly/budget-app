"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { CategoryMonthTransaction } from "@/lib/queries";

export function CategoryMonthCell({
  amount,
  transactions,
  label,
}: {
  amount: number;
  transactions: CategoryMonthTransaction[];
  label: string;
}) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasData = transactions.length > 0;

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function show() {
    if (!hasData) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    const rect = cellRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(rect.left, window.innerWidth - 300);
    setPos({ top: rect.bottom + 6, left: Math.max(8, left) });
  }

  function scheduleHide() {
    hideTimer.current = setTimeout(() => setPos(null), 150);
  }

  return (
    <td
      ref={cellRef}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      className={`px-2 py-1.5 text-right tabular-nums ${
        hasData ? "text-muted cursor-help underline decoration-dotted decoration-muted/50 underline-offset-4" : "text-muted"
      }`}
    >
      {formatNumber(amount)}
      {pos && (
        <div
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="z-50 w-72 rounded-xl border border-border bg-surface shadow-xl p-3 text-left text-xs normal-case tracking-normal"
        >
          <p className="font-medium text-foreground mb-2">{label}</p>
          <ul className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {transactions.map((t) => (
              <li key={t.id} className="border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                <div className="flex justify-between gap-2">
                  <span className="text-muted">{formatDate(t.date)}</span>
                  <span className="text-foreground font-medium tabular-nums">
                    {formatCurrency(t.amount)}
                  </span>
                </div>
                {t.description && (
                  <p className="text-muted truncate">{t.description}</p>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-medium text-foreground">
            <span>Suma</span>
            <span className="tabular-nums">{formatCurrency(amount)}</span>
          </div>
        </div>
      )}
    </td>
  );
}
