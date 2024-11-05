FROM oven/bun:alpine AS base

FROM base AS builder

WORKDIR /app

# Cache packages
COPY turbo.json turbo.json
COPY package.json package.json
COPY bun.lockb bun.lockb

COPY /apps/server/package.json ./apps/server/package.json
COPY /apps/admin/package.json ./apps/admin/package.json
COPY /packages/database/package.json ./packages/database/package.json
COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/email/package.json ./packages/email/package.json
COPY /packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN bun install

COPY /apps/server ./apps/server
COPY /apps/admin ./apps/admin
COPY /packages/database ./packages/database
COPY /packages/api ./packages/api
COPY /packages/email ./packages/email
COPY /packages/tsconfig ./packages/tsconfig

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN bun run build --filter=@mesalista/admin

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/apps/admin/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:bun .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:bun /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENV HOSTNAME "0.0.0.0"
CMD ["bun", "apps/admin/server.js"]