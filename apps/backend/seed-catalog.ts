import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname'
});

async function runSeed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Limpando dados antigos...');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');

    console.log('Populando categorias...');
    const catEletronicosId = 9001;
    const catCasaId = 9002;
    const tenantId = '00000000-0000-0000-0000-000000000000'; // Default UUID for tenantId since it's type Uuid in schema

    await client.query(`
      INSERT INTO categories (id, name, active, tenant_id, created_at, updated_at)
      VALUES 
      ($1, 'Eletrônicos Novos', true, $3, NOW(), NOW()),
      ($2, 'Casa & Decoração Nova', true, $3, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `, [catEletronicosId, catCasaId, tenantId]);

    console.log('Populando produtos...');
    const products = [
      {
        id: 90001,
        name: 'Smartphone X',
        description: 'Um smartphone potente com câmera de 108MP.',
        price: 2500.00,
        stock: 50,
        categoryId: catEletronicosId,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 90002,
        name: 'Laptop Pro',
        description: 'Notebook de alta performance para trabalho pesado e edição de vídeo.',
        price: 5000.00,
        stock: 20,
        categoryId: catEletronicosId,
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 90003,
        name: 'Fone de Ouvido Bluetooth',
        description: 'Fone com cancelamento de ruído ativo e 30 horas de bateria.',
        price: 450.00,
        stock: 100,
        categoryId: catEletronicosId,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 90004,
        name: 'Smartwatch Série 5',
        description: 'Relógio inteligente com monitoramento cardíaco e GPS integrado.',
        price: 1200.00,
        stock: 35,
        categoryId: catEletronicosId,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 90005,
        name: 'Aspirador Robô Inteligente',
        description: 'Aspirador de pó robô com mapeamento a laser e controle por app.',
        price: 1800.00,
        stock: 15,
        categoryId: catCasaId,
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 90006,
        name: 'Cafeteira Expresso',
        description: 'Cafeteira expresso automática com vaporizador de leite.',
        price: 850.00,
        stock: 40,
        categoryId: catCasaId,
        imageUrl: 'https://images.unsplash.com/photo-1517246281140-5e3fc00388d0?q=80&w=800&auto=format&fit=crop',
      }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (id, name, description, price, stock, active, category_id, image_url, tenant_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [p.id, p.name, p.description, p.price, p.stock, p.categoryId, p.imageUrl, tenantId]);
      console.log(`Inserido produto: ${p.name}`);
    }

    await client.query('COMMIT');
    console.log('Catálogo populado com sucesso!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro ao popular catálogo:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
