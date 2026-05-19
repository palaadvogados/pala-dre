FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm add -w @swc/core @swc/register
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "--require", "@swc/register", "apps/api/src/main.ts"]
