FROM node:22-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm@9
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY packages/ packages/
COPY apps/web/ apps/web/
RUN pnpm --filter @pala-dre/shared build && pnpm --filter @pala-dre/web build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
