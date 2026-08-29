const { prisma } = require('@kuafor-art/database');

async function main() {
  console.log("prisma keys:", Object.keys(prisma));
  console.log("has globalSettings?", !!prisma.globalSettings);
}

main().catch(console.error);
