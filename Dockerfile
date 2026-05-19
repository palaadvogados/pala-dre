FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pala-dre/shared run build
RUN pnpm --filter @pala-dre/db run build
RUN pnpm --filter @pala-dre/api run build
COPY apps/api/.env apps/api/.env 2>/dev/null || true
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "apps/api/dist/main.js"]
