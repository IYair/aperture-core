FROM node:18-alpine AS base

# Install production dependencies
FROM base AS deps-prod
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production --frozen-lockfile

# Install all dependencies (for build)
FROM base AS deps-build
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Build the application
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy all dependencies (including devDependencies for build)
COPY --from=deps-build /app/node_modules ./node_modules
COPY . .

# Build the app
ENV NODE_ENV=production
RUN npm run build

# Production image, copy all the files and run astro
FROM base AS runner
RUN apk add --no-cache dumb-init curl
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Create necessary directories
RUN mkdir -p /app/dist && chown -R astro:nodejs /app

# Copy built application and only production dependencies
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=deps-prod --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Switch to non-root user
USER astro

# Expose port
EXPOSE 4321

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4321/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "dist/server/entry.mjs"]