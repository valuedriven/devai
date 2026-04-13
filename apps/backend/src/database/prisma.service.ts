import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL?.includes('supabase.com') ||
        process.env.DATABASE_URL?.includes('neon.tech')
          ? { rejectUnauthorized: false }
          : false,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter } as any);
  }

  async onModuleInit() {
    console.log('Connecting to database with driver adapter...');
    try {
      await this.$connect();
      console.log('Database connection established successfully.');
    } catch (error) {
      const err = error as Error;
      console.error('Failed to connect to the database:', err.message);
      if (err.message.toLowerCase().includes('tenant or user not found')) {
        console.error(
          'CRITICAL: Supabase/Neon Pooler error "Tenant or user not found".',
        );
        console.error(
          'HINT 1: Ensure your DATABASE_URL username follows the format "postgres.[project-ref]".',
        );
        console.error(
          'HINT 2: If using the pooler (port 6543), verify the project reference in the Supabase Dashboard.',
        );
        console.error(
          'HINT 3: Check if DATABASE_URL is correctly set in Vercel Environment Variables.',
        );
      }
      throw error;
    }
  }
}
