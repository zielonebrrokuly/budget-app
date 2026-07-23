// Import danych z data-export.json do bazy Neon (Postgres).
// Uruchom PO `prisma db push`: `npx tsx scripts/import-data.ts`
// Idempotentne — najpierw czyści tabele.
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

type Raw = Record<string, unknown>;
const dt = (v: unknown): Date | null => (v ? new Date(String(v)) : null);

async function main() {
  const data = JSON.parse(readFileSync("data-export.json", "utf-8"));
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

  await prisma.transactionAudit.deleteMany();
  await prisma.plannedExpense.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.setting.deleteMany();

  const categories = (data.categories as Raw[]).map((c) => ({
    id: c.id as string,
    type: c.type as string,
    name: c.name as string,
    createdAt: new Date(String(c.createdAt)),
  }));
  const transactions = (data.transactions as Raw[]).map((t) => ({
    id: t.id as string,
    type: t.type as string,
    date: new Date(String(t.date)),
    amount: t.amount as number,
    description: (t.description as string | null) ?? null,
    category: t.category as string,
    createdAt: new Date(String(t.createdAt)),
  }));
  const audits = (data.transactionAudits as Raw[]).map((a) => ({
    id: a.id as string,
    transactionId: a.transactionId as string,
    action: a.action as string,
    type: a.type as string,
    oldDate: new Date(String(a.oldDate)),
    oldAmount: a.oldAmount as number,
    oldCategory: a.oldCategory as string,
    oldDescription: (a.oldDescription as string | null) ?? null,
    newDate: dt(a.newDate),
    newAmount: (a.newAmount as number | null) ?? null,
    newCategory: (a.newCategory as string | null) ?? null,
    newDescription: (a.newDescription as string | null) ?? null,
    changedAt: new Date(String(a.changedAt)),
  }));
  const planned = (data.plannedExpenses as Raw[]).map((p) => ({
    id: p.id as string,
    year: p.year as number,
    month: p.month as number,
    name: p.name as string,
    amount: p.amount as number,
    isPaid: p.isPaid as boolean,
    createdAt: new Date(String(p.createdAt)),
  }));
  const settings = (data.settings as Raw[]).map((s) => ({
    key: s.key as string,
    value: s.value as string,
  }));

  if (categories.length) await prisma.category.createMany({ data: categories });
  if (transactions.length) await prisma.transaction.createMany({ data: transactions });
  if (audits.length) await prisma.transactionAudit.createMany({ data: audits });
  if (planned.length) await prisma.plannedExpense.createMany({ data: planned });
  if (settings.length) await prisma.setting.createMany({ data: settings });

  console.log(
    `Zaimportowano do Neon: ${transactions.length} transakcji, ${categories.length} kategorii, ` +
      `${audits.length} audyt, ${planned.length} planned, ${settings.length} settings`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
