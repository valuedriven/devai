import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const order = await prisma.orders.findFirst({
    where: { id: 3n },
    include: {
      customers: true,
      order_items: true,
    },
  });
  console.log('ORDER:', JSON.stringify(order, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
