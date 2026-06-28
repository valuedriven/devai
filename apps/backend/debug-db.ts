import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Cleaning AuditLog...');
    await prisma.auditLog.deleteMany({});
    console.log('Cleaning Payment...');
    await prisma.payment.deleteMany({});
    console.log('Cleaning OrderItem...');
    await prisma.orderItem.deleteMany({});
    console.log('Cleaning Order...');
    await prisma.order.deleteMany({});
    console.log('Cleaning Product...');
    await prisma.product.deleteMany({});
    console.log('Cleaning Customer...');
    await prisma.customer.deleteMany({});
    console.log('Done!');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
