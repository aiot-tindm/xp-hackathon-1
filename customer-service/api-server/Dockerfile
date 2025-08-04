# Multi-stage build for better optimization
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 xp

# Create necessary directories
RUN mkdir -p logs

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=xp:nodejs /app/dist ./dist
COPY --from=builder --chown=xp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=xp:nodejs /app/prisma ./prisma
COPY --from=builder --chown=xp:nodejs /app/package.json ./package.json

# Create logs directory with proper permissions
RUN mkdir -p logs && chown xp:nodejs logs

USER xp

EXPOSE 4001

# Environment variables
ENV NODE_ENV=production
ENV PORT=4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/health || exit 1

# Start the application
CMD ["npm", "start"]
