FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY . .
RUN pnpm install --frozen-lockfile
ENV NODE_ENV=production
EXPOSE 3003
CMD ["npx", "tsx", "apps/api/src/main.ts"]
