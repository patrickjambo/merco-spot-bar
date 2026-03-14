const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
  console.log(cats);
}
main();
