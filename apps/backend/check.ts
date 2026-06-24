import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany();
  console.log('Total products:', products.length);
  const categories = await prisma.category.findMany();
  console.log('Total categories:', categories.length);
}
main().finally(() => prisma.$disconnect());
