import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("JournalLine delegate:", (prisma as any).journalLine ? "Exists" : "MISSING");
  console.log("JournalEntry delegate:", (prisma as any).journalEntry ? "Exists" : "MISSING");
}

main().catch(console.error);
