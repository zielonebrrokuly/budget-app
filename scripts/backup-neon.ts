// Kopia zapasowa CAŁEJ bazy Neon do pliku z datą (backups/neon-backup-<ts>.json).
// Uruchom: npx tsx scripts/backup-neon.ts
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

  const [transactions, categories, transactionAudits, plannedExpenses, settings] =
    await Promise.all([
      prisma.transaction.findMany(),
      prisma.category.findMany(),
      prisma.transactionAudit.findMany(),
      prisma.plannedExpense.findMany(),
      prisma.setting.findMany(),
    ]);

  const dump = { transactions, categories, transactionAudits, plannedExpenses, settings };
  mkdirSync("backups", { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const file = `backups/neon-backup-${ts}.json`;
  writeFileSync(file, JSON.stringify(dump, null, 2), "utf-8");

  console.log(
    `Kopia zapasowa: ${file}\n` +
      `  ${transactions.length} transakcji, ${categories.length} kategorii, ` +
      `${transactionAudits.length} audyt, ${plannedExpenses.length} planned, ${settings.length} settings`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
