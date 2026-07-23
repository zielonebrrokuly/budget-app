import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export async function GET() {
  const [expenses, incomes] = await Promise.all([
    prisma.transaction.findMany({ where: { type: "EXPENSE" }, orderBy: { date: "asc" } }),
    prisma.transaction.findMany({ where: { type: "INCOME" }, orderBy: { date: "asc" } }),
  ]);

  const toRows = (rows: typeof expenses) =>
    rows.map((t) => ({
      Data: formatDate(t.date),
      Kwota: t.amount,
      Kategoria: t.category,
      Opis: t.description ?? "",
    }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(toRows(expenses)), "Wydatki");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(toRows(incomes)), "Przychody");

  const buffer: Buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const dateStr = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="budzet-eksport-${dateStr}.xlsx"`,
    },
  });
}
