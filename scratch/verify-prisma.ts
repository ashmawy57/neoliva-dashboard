import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking prisma.inventoryItem...");
  if (prisma.inventoryItem) {
    console.log("SUCCESS: prisma.inventoryItem is defined.");
    try {
      const count = await prisma.inventoryItem.count();
      console.log("Count:", count);
    } catch (e: any) {
      console.log("ERROR while calling inventoryItem:", e.message);
    }
  } else {
    console.log("FAILURE: prisma.inventoryItem is UNDEFINED.");
  }
}

main().catch(console.error);
