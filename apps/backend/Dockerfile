# -----------------------------
# Stage 1 — Dependencies
# -----------------------------
FROM node:24-alpine AS deps

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy backend workspace manifest
COPY apps/backend/package.json ./apps/backend/

# Install only backend dependencies
RUN npm ci --workspace=backend


# -----------------------------
# Stage 2 — Builder
# -----------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy backend source
COPY apps/backend ./apps/backend

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/src/database/prisma/schema.prisma

# Build backend
RUN npm run build --workspace=backend


# -----------------------------
# Stage 3 — Runtime
# -----------------------------
FROM node:24-alpine AS runner

WORKDIR /app

ARG DATABASE_URL=postgresql://user:password@db:5432/dbname
ARG NODE_ENV=production
ARG BACKEND_PORT=3001
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG CLERK_JWT_KEY
ARG JWT_SECRET

ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=$NODE_ENV
ENV PORT=$BACKEND_PORT
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV CLERK_JWT_KEY=$CLERK_JWT_KEY
ENV JWT_SECRET=$JWT_SECRET


# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Copy production files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/src/database/prisma ./apps/backend/src/database/prisma
# Copy prisma.config.ts so Prisma 7 can resolve datasource.url at runtime
COPY --from=builder /app/apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts

WORKDIR /app/apps/backend

USER nestjs

EXPOSE $PORT

# Run migrations then start app
# Prisma 7 automatically picks up prisma.config.ts from the working directory
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]