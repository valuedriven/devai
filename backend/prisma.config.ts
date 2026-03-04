import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '../.env') });

import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: 'src/database/prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL,
    },
    migrations: {
        seed: 'ts-node --transpile-only src/database/prisma/seed.ts',
    },
});
