import { PrismaService } from '../../../src/database/prisma.service';

export async function truncateAll(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "audit_logs", "payments", "order_items", "orders", "products", "categories", "customers" CASCADE',
  );
}
