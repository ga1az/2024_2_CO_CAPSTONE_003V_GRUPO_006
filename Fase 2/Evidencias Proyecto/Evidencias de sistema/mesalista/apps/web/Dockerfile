FROM oven/bun:1.1.25 AS base

FROM base AS builder

WORKDIR /app

# Cache packages
COPY turbo.json turbo.json
COPY package.json package.json
COPY bun.lockb bun.lockb

COPY /apps/web/package.json ./apps/web/package.json
COPY /apps/server/package.json ./apps/server/package.json
COPY /packages/database/package.json ./packages/database/package.json
COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/email/package.json ./packages/email/package.json
COPY /packages/tsconfig/package.json ./packages/tsconfig/package.json

RUN bun install

COPY /apps/web ./apps/web
COPY /apps/server ./apps/server
COPY /packages/database ./packages/database
COPY /packages/api ./packages/api
COPY /packages/email ./packages/email
COPY /packages/tsconfig ./packages/tsconfig

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN bun run build --filter=@mesalista/web

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY --from=build /app/apps/web/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:bun .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:bun /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENV HOSTNAME "0.0.0.0"
CMD ["bun", "apps/admin/server.js"]
