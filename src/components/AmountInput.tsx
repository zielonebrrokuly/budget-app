"use client";

import { useState } from "react";
import { evalAmount, looksLikeExpression } from "@/lib/calc";

// Pole „Kwota", które przyjmuje działania (np. 84/2, 40+15,50) i przelicza je.
// Podgląd „= wynik" pokazuje się w trakcie wpisywania; po wyjściu z pola (blur)
// wartość zamienia się na wyliczoną liczbę, którą wysyła formularz.
export function AmountInput({
  defaultValue,
  className,
  placeholder,
  required,
}: {
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="relative">
      <input
        type="text"
        name="amount"
        inputMode="text"
        autoComplete="off"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={className}
        onInput={(e) => {
          const v = e.currentTarget.value;
          if (looksLikeExpression(v)) {
            const r = evalAmount(v);
            setPreview(
              r === null
                ? null
                : `= ${r.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
            );
          } else {
            setPreview(null);
          }
        }}
        onBlur={(e) => {
          const r = evalAmount(e.currentTarget.value);
          if (r !== null) e.currentTarget.value = String(r);
          setPreview(null);
        }}
      />
      {preview && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-accent">
          {preview}
        </span>
      )}
    </div>
  );
}
