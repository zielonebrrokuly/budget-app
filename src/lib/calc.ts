// Bezpieczny kalkulator wyrażeń arytmetycznych: + − × ÷ oraz nawiasy.
// Bez eval — własny tokenizer + parser (rekursywne zejście). Client-safe (zero importów).
// Zwraca liczbę zaokrągloną do 2 miejsc albo null, gdy wejście jest niepoprawne.

type Tok = { t: "num"; v: number } | { t: "op"; v: string };

function tokenize(s: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      i++;
      continue;
    }
    if ("+-*/()".includes(c)) {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    let j = i;
    while (j < s.length && /[0-9.]/.test(s[j])) j++;
    const numStr = s.slice(i, j);
    if (numStr === "" || numStr === "." || (numStr.match(/\./g)?.length ?? 0) > 1) {
      throw new Error("bad number");
    }
    toks.push({ t: "num", v: Number(numStr) });
    i = j;
  }
  return toks;
}

function parse(toks: Tok[]): number {
  let pos = 0;
  const peek = () => toks[pos];
  const eat = () => toks[pos++];

  function expr(): number {
    let v = term();
    while (peek()?.t === "op" && (peek().v === "+" || peek().v === "-")) {
      const op = eat().v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = factor();
    while (peek()?.t === "op" && (peek().v === "*" || peek().v === "/")) {
      const op = eat().v;
      const r = factor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function factor(): number {
    const tk = peek();
    if (!tk) throw new Error("unexpected end");
    if (tk.t === "op" && (tk.v === "-" || tk.v === "+")) {
      eat();
      const f = factor();
      return tk.v === "-" ? -f : f;
    }
    if (tk.t === "op" && tk.v === "(") {
      eat();
      const v = expr();
      if (peek()?.v !== ")") throw new Error("missing )");
      eat();
      return v;
    }
    if (tk.t === "num") {
      eat();
      return tk.v;
    }
    throw new Error("bad token");
  }

  const result = expr();
  if (pos !== toks.length) throw new Error("trailing tokens");
  return result;
}

export function evalAmount(input: string): number | null {
  const raw = input.replace(/,/g, ".").trim();
  if (!raw) return null;
  if (!/^[0-9+\-*/().\s]+$/.test(raw)) return null;
  try {
    const val = parse(tokenize(raw));
    if (!Number.isFinite(val)) return null;
    return Math.round(val * 100) / 100;
  } catch {
    return null;
  }
}

// Czy wejście wygląda na działanie (zawiera operator/nawias) — do pokazania podglądu „= wynik".
export function looksLikeExpression(input: string): boolean {
  const raw = input.replace(/,/g, ".").trim();
  return /[+*/()]/.test(raw) || /\d\s*-/.test(raw);
}
