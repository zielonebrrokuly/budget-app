// Eksport wszystkich danych z lokalnej bazy SQLite do pliku JSON.
// Uruchom PRZED przełączeniem na Postgres: `npx tsx scripts/export-data.ts`
// Plik data-export.json służy jako backup i źródło do importu na Neon.
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { writeFileSync } from "node:fs";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
  });

  const [transactions, categories, transactionAudits, plannedExpenses, settings] =
    await Promise.all([
      prisma.transaction.findMany(),
      prisma.category.findMany(),
      prisma.transactionAudit.findMany(),
      prisma.plannedExpense.findMany(),
      prisma.setting.findMany(),
    ]);

  writeFileSync(
    "data-export.json",
    JSON.stringify(
      { transactions, categories, transactionAudits, plannedExpenses, settings },
      null,
      2,
    ),
  );

  console.log(
    `Wyeksportowano: ${transactions.length} transakcji, ${categories.length} kategorii, ` +
      `${transactionAudits.length} audyt, ${plannedExpenses.length} planned, ${settings.length} settings`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
