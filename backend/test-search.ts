
import { PrismaClient } from '@prisma/client';

async function test() {
    const prisma = new PrismaClient();
    const tenantId = '00000000-0000-0000-0000-000000000000';
    const search = 'camisa';

    console.log('Testing search for:', search);

    const products = await prisma.product.findMany({
        where: {
            tenantId,
            name: { contains: search, mode: 'insensitive' },
        },
    });

    console.log('Found products:', JSON.stringify(products, null, 2));

    await prisma.$disconnect();
}

test();
