import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(process.cwd(), '../../.env') });
dotenv.config({ path: join(__dirname, '../../../../.env') });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Ensure we have at least one category
  let category = await prisma.category.findFirst({
    where: { name: 'Eletrônicos' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Eletrônicos',
        nameNormalized: normalizeName('Eletrônicos'),
        slug: slugify('Eletrônicos'),
        active: true,
      },
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
    },
    {
      name: 'Laptop Pro',
      description:
        'Notebook de alta performance para trabalho pesado e edição de vídeo.',
      price: 5000.0,
      stock: 20,
      categoryId: category.id,
    },
    {
      name: 'Fone de Ouvido Bluetooth',
      description:
        'Fone com cancelamento de ruído ativo e 30 horas de bateria.',
      price: 450.0,
      stock: 100,
      categoryId: category.id,
    },
    {
      name: 'Smartwatch Série 5',
      description:
        'Relógio inteligente com monitoramento cardíaco e GPS integrado.',
      price: 1200.0,
      stock: 35,
      categoryId: category.id,
    },
    {
      name: 'Câmera Mirrorless',
      description: 'Câmera digital mirrorless 4K com lente intercambiável.',
      price: 4300.0,
      stock: 15,
      categoryId: category.id,
    },
    {
      name: 'Tablet Ultra',
      description: 'Tablet de 11 polegadas com suporte a caneta stylus.',
      price: 3200.0,
      stock: 40,
      categoryId: category.id,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
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
