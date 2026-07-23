// Kontrola: sumy per miesiąc z bazy Neon (do porównania z plikiem).
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

if (typeof WebSocket === "undefined") neonConfig.webSocketConstructor = ws;
const MN = ["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"];
const r2 = (n: number) => Math.round(n * 100) / 100;

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });
  const txns = await prisma.transaction.findMany({
    where: { date: { gte: new Date(2026, 0, 1), lt: new Date(2027, 0, 1) } },
  });
  console.log(`W bazie (2026): ${txns.length} transakcji.\n`);
  console.log("Mies |   Przychody |    Wydatki |  Oszczędn. | Saldo narast.");
  let running = 0;
  for (let m = 0; m < 12; m++) {
    const inMonth = txns.filter((t) => t.date.getMonth() === m);
    const inc = r2(inMonth.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0));
    const exp = r2(inMonth.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0));
    const sav = r2(inc - exp);
    running = r2(running + sav);
    if (inc === 0 && exp === 0) continue;
    console.log(`${MN[m]}  | ${inc.toFixed(2).padStart(11)} | ${exp.toFixed(2).padStart(10)} | ${sav.toFixed(2).padStart(10)} | ${running.toFixed(2).padStart(12)}`);
  }
  const ti = r2(txns.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0));
  const te = r2(txns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0));
  console.log(`\nRAZEM przychody: ${ti.toFixed(2)} zł, wydatki: ${te.toFixed(2)} zł, oszczędności łącznie: ${r2(ti - te).toFixed(2)} zł`);
  const audit = await prisma.transactionAudit.count();
  console.log(`Historia (audyt): ${audit} wpisów.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
