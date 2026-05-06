import prisma from "./src/lib/prisma.js";

async function main() {
  console.log("Prisma models:", Object.keys(prisma).filter(k => !k.startsWith("_")));
}

main().catch(console.error);
