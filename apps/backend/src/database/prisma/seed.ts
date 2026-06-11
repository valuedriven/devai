import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000000';

  console.log(`Starting seed for tenant: ${tenantId}...`);

  // Ensure we have at least one category
  let category = await prisma.category.findFirst({
    where: { name: 'Eletrônicos' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Eletrônicos',
        tenantId,
      },
    });
  } else {
    category = await prisma.category.update({
      where: { id: category.id },
      data: { tenantId },
    });
  }

  console.log({ category });

  // Create Products
  const products = [
    {
      name: 'Smartphone X',
      description: 'Um smartphone potente com câmera de 108MP.',
      price: 2500.0,
      stock: 50,
      categoryId: category.id,
      tenantId,
    },
    {
      name: 'Laptop Pro',
      description:
        'Notebook de alta performance para trabalho pesado e edição de vídeo.',
      price: 5000.0,
      stock: 20,
      categoryId: category.id,
      tenantId,
    },
    {
      name: 'Fone de Ouvido Bluetooth',
      description:
        'Fone com cancelamento de ruído ativo e 30 horas de bateria.',
      price: 450.0,
      stock: 100,
      categoryId: category.id,
      tenantId,
    },
    {
      name: 'Smartwatch Série 5',
      description:
        'Relógio inteligente com monitoramento cardíaco e GPS integrado.',
      price: 1200.0,
      stock: 35,
      categoryId: category.id,
      tenantId,
    },
    {
      name: 'Câmera Mirrorless',
      description: 'Câmera digital mirrorless 4K com lente intercambiável.',
      price: 4300.0,
      stock: 15,
      categoryId: category.id,
      tenantId,
    },
    {
      name: 'Tablet Ultra',
      description: 'Tablet de 11 polegadas com suporte a caneta stylus.',
      price: 3200.0,
      stock: 40,
      categoryId: category.id,
      tenantId,
    },
  ];

  for (const p of products) {
    // Find or create product to avoid duplicates and identity errors
    const existing = await prisma.product.findFirst({
      where: { name: p.name, tenantId },
    });

    if (!existing) {
      const product = await prisma.product.create({
        data: p,
      });
      console.log(`Created product: ${product.name}`);
    } else {
      console.log(`Product already exists: ${p.name}`);
    }
  }

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
