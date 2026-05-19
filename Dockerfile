FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY . .
RUN pnpm install --frozen-lockfile
RUN cd packages/shared && npx tsc
RUN cd packages/db && npx tsc
RUN cd apps/api && npx tsc
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "apps/api/dist/main.js"]
