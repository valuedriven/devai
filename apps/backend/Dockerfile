# Stage 1: Base - Install dependencies
FROM node:24-alpine AS base

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace package files
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies (respecting the root lockfile)
RUN npm ci --workspace=backend

# Stage 2: Builder - Build the application
FROM base AS builder

WORKDIR /app

# Copy backend source code
COPY apps/backend/ ./apps/backend/

# Generate Prisma client
# Using npx to ensure the binary is found in the workspace structure
RUN npx prisma generate --schema=apps/backend/src/database/prisma/schema.prisma

# Build the application
RUN npm run build --workspace=backend

# Stage 3: Runner - Production environment
FROM node:24-alpine AS runner

WORKDIR /app

ARG NODE_ENV=production
ARG BACKEND_PORT=3001

ENV NODE_ENV=$NODE_ENV
ENV PORT=$BACKEND_PORT

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files from builder
# We need both root node_modules and backend node_modules due to workspace structure
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

# Use backend as working directory for the application
WORKDIR /app/apps/backend

# Use non-root user
USER nestjs

EXPOSE $PORT

# Start the application
CMD ["node", "dist/main"]
