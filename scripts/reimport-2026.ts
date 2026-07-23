// Reimport transakcji 2026 z pliku Excela do bazy Neon.
// Kasuje transakcje z roku 2026 + całą Historię (audyt), wczytuje od nowa z arkusza Wydatki_2k26.
// Uruchom: npx tsx scripts/reimport-2026.ts
import "dotenv/config";
import path from "node:path";
import * as XLSX from "xlsx";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const MONTHS: Record<string, number> = {
  "STYCZEŃ": 0, "LUTY": 1, "MARZEC": 2, "KWIECIEŃ": 3, "MAJ": 4, "CZERWIEC": 5,
  "LIPIEC": 6, "SIERPIEŃ": 7, "WRZESIEŃ": 8, "PAŹDZIERNIK": 9, "LISTOPAD": 10, "GRUDZIEŃ": 11,
};

function parseMonthYear(value: unknown): { year: number; monthIndex: number } | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\S+)\s+(\d{4})/);
  if (!match) return null;
  const monthIndex = MONTHS[match[1].toUpperCase()];
  if (monthIndex === undefined) return null;
  return { year: Number(match[2]), monthIndex };
}
function round2(n: number) { return Math.round(n * 100) / 100; }

type Txn = { type: string; date: Date; amount: number; description: string | null; category: string };

async function main() {
  const filePath = path.resolve(__dirname, "../2k26-plik aktualne 12.07.xlsx");
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheet = workbook.Sheets["Wydatki_2k26"];
  if (!sheet) throw new Error("Nie znaleziono arkusza 'Wydatki_2k26'");

  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });

  const expenses: Txn[] = [];
  const incomes: Txn[] = [];

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const expMonth = parseMonthYear(row[1]);
    if (expMonth && typeof row[2] === "number" && typeof row[3] === "number" && row[5]) {
      expenses.push({
        type: "EXPENSE",
        date: new Date(Date.UTC(expMonth.year, expMonth.monthIndex, row[2] as number)),
        amount: round2(row[3] as number),
        description: typeof row[4] === "string" && row[4].trim() ? (row[4] as string).trim() : null,
        category: String(row[5]).trim(),
      });
    }

    const incMonth = parseMonthYear(row[8]);
    if (incMonth && typeof row[9] === "number" && typeof row[10] === "number" && row[12]) {
      incomes.push({
        type: "INCOME",
        date: new Date(Date.UTC(incMonth.year, incMonth.monthIndex, row[9] as number)),
        amount: round2(row[10] as number),
        description: typeof row[11] === "string" && row[11].trim() ? (row[11] as string).trim() : null,
        category: String(row[12]).trim(),
      });
    }
  }

  const all = [...expenses, ...incomes];
  // Bezpiecznik: wszystkie wczytane transakcje muszą być z 2026.
  const nonExpected = all.filter((t) => t.date.getFullYear() !== 2026);
  if (nonExpected.length) {
    throw new Error(`Przerwano: ${nonExpected.length} transakcji spoza 2026 w pliku.`);
  }
  console.log(`Z pliku: ${expenses.length} wydatków + ${incomes.length} przychodów = ${all.length}.`);

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

  const start = new Date(2026, 0, 1);
  const end = new Date(2027, 0, 1);

  const result = await prisma.$transaction([
    // Kasujemy CAŁĄ Historię (decyzja użytkownika: czysty start).
    prisma.transactionAudit.deleteMany({}),
    // Kasujemy tylko transakcje z roku 2026.
    prisma.transaction.deleteMany({ where: { date: { gte: start, lt: end } } }),
    prisma.transaction.createMany({ data: all }),
  ]);

  console.log(
    `Skasowano audyt: ${result[0].count}, skasowano transakcje 2026: ${result[1].count}, ` +
      `wczytano: ${result[2].count}.`,
  );

  // Kontrola: kategorie z pliku, których nie ma w tabeli Category (nie blokuje, tylko info).
  const cats = await prisma.category.findMany();
  const known = new Set(cats.map((c) => `${c.type}:${c.name}`));
  const missing = new Set<string>();
  for (const t of all) if (!known.has(`${t.type}:${t.category}`)) missing.add(`${t.type} / ${t.category}`);
  if (missing.size) console.log(`\nUwaga — kategorie w pliku spoza tabeli Category: ${[...missing].join(", ")}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
