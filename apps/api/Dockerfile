FROM node:22-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm@9
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN pnpm --filter @pala-dre/shared build && pnpm --filter @pala-dre/db build && pnpm --filter @pala-dre/api build

FROM node:22-alpine
WORKDIR /app
RUN npm i -g pnpm@9
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "apps/api/dist/main.js"]
