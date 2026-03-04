# Stage 1: Base - Install dependencies
FROM node:24-alpine AS base

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy backend package file
COPY backend/package.json ./backend/

# Install dependencies (respecting the root lockfile)
RUN npm ci --workspace=backend

# Stage 2: Builder - Build the application
FROM base AS builder

WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Build the application
RUN npm run build --workspace=backend

# Stage 3: Runner - Production environment
FROM node:24-alpine AS runner

WORKDIR /app

ARG NODE_ENV=production
ARG PORT=3001

ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files from builder
# We need the root node_modules because of the workspace structure
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

# Use non-root user
USER nestjs

EXPOSE $PORT

# Start the application
CMD ["node", "backend/dist/main"]
