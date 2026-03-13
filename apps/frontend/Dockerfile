# Stage 1: Install dependencies
FROM node:24-alpine AS deps
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace package files
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN npm ci --workspace=frontend

# Stage 2: Builder - Build the application
FROM deps AS builder
WORKDIR /app

# Copy frontend source
COPY apps/frontend/ ./apps/frontend/

# Environment variables for build time (Next.js public variables)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ARG NODE_ENV=production
ARG FRONTEND_PORT=3000

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
RUN npm run build --workspace=frontend

# Stage 3: Runner - Final production image
FROM node:24-alpine AS runner
WORKDIR /app

ARG NODE_ENV=production
ARG FRONTEND_PORT=3000

ENV NODE_ENV=$NODE_ENV
ENV PORT=$FRONTEND_PORT

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set permissions for standalone output
# standalone output is created in frontend/.next/standalone
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE $PORT

ENV HOSTNAME="0.0.0.0"

# The standalone output includes the server.js in the folder of the package
CMD ["node", "apps/frontend/server.js"]
