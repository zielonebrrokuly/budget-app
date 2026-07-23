// Jednorazowa migracja danych ze starej apki (budget-app) do nowej (budzet).
// Uruchom raz: `npx tsx scripts/import-from-old.ts`
//
// Czyta transakcje, kategorie, audyt i pozycje "do zapłacenia" ze starej bazy
// przez drugiego klienta Prisma (żeby Prisma poprawnie sparsowała daty), po czym
// wstawia je do nowej bazy. Idempotentne — najpierw czyści nowe tabele.
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const OLD_DB_URL = "file:C:/Users/marek/Desktop/App/budget-app/dev.db";

async function main() {
  const oldPrisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: OLD_DB_URL }),
  });
  const newPrisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
  });

  const [transactions, categories, audits, planned] = await Promise.all([
    oldPrisma.transaction.findMany(),
    oldPrisma.category.findMany(),
    oldPrisma.transactionAudit.findMany(),
    oldPrisma.plannedExpense.findMany(),
  ]);

  // Idempotentnie wyczyść nowe tabele (brak FK/kaskad, więc dowolna kolejność).
  await newPrisma.transactionAudit.deleteMany();
  await newPrisma.plannedExpense.deleteMany();
  await newPrisma.transaction.deleteMany();
  await newPrisma.category.deleteMany();

  if (categories.length) await newPrisma.category.createMany({ data: categories });
  if (transactions.length) await newPrisma.transaction.createMany({ data: transactions });
  if (audits.length) await newPrisma.transactionAudit.createMany({ data: audits });
  if (planned.length) await newPrisma.plannedExpense.createMany({ data: planned });

  console.log(
    `Zaimportowano: ${transactions.length} transakcji, ${categories.length} kategorii, ` +
      `${audits.length} wpisów audytu, ${planned.length} pozycji do zapłacenia.`,
  );

  await oldPrisma.$disconnect();
  await newPrisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
