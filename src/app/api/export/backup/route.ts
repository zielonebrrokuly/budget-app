import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [transactions, categories, transactionAudits, plannedExpenses, settings] =
    await Promise.all([
      prisma.transaction.findMany(),
      prisma.category.findMany(),
      prisma.transactionAudit.findMany(),
      prisma.plannedExpense.findMany(),
      prisma.setting.findMany(),
    ]);

  const dump = { transactions, categories, transactionAudits, plannedExpenses, settings };
  const dateStr = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(dump, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="budzet-backup-${dateStr}.json"`,
    },
  });
}
