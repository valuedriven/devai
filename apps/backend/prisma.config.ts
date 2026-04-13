import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'src/database/prisma/schema.prisma',
  datasource: {
    // env() throws if DATABASE_URL is absent (breaks Docker build stage).
    // Use process.env with fallback — the real URL is injected at runtime via docker-compose.
    url: process.env.DATABASE_URL ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
});
