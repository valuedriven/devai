import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        super({ adapter } as any);
    }

    async onModuleInit() {
        console.log('Connecting to database with driver adapter...');
        try {
            await this.$connect();
            console.log('Database connection established successfully.');
        } catch (error) {
            console.error('Failed to connect to the database:', error.message);
            if (error.message.includes('tenant or user not found')) {
                console.error('HINT: Check if your DATABASE_URL uses the correct database password (not the Anon Key).');
            }
            throw error;
        }
    }
}
