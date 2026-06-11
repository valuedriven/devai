import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const order = await prisma.orders.findUnique({
    where: { id: 2n },
    include: { customers: true }
  });
  console.log(JSON.stringify(order, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
