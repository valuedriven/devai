import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL?.includes('supabase.com') ||
        process.env.DATABASE_URL?.includes('neon.tech') ||
        process.env.DATABASE_URL?.includes('amazonaws.com')
          ? { rejectUnauthorized: false }
          : false,
    });
    const adapter = new PrismaPg(pool);

    super({ adapter } as Prisma.PrismaClientOptions);
  }

  async onModuleInit() {
    this.logger.log('Connecting to database with driver adapter...');
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully.');
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to connect to the database:', err.message);
      if (err.message.toLowerCase().includes('tenant or user not found')) {
        this.logger.error(
          'CRITICAL: Supabase/Neon Pooler error "Tenant or user not found".',
        );
        this.logger.error(
          'HINT 1: Ensure your DATABASE_URL username follows the format "postgres.[project-ref]".',
        );
        this.logger.error(
          'HINT 2: If using the pooler (port 6543), verify the project reference in the Supabase Dashboard.',
        );
        this.logger.error(
          'HINT 3: Check if DATABASE_URL is correctly set in Vercel Environment Variables.',
        );
      }
      throw error;
    }
  }
}
