FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/nest-cli.json ./apps/api/nest-cli.json
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/src ./apps/api/src
RUN npm install -g pnpm && pnpm install --ignore-scripts
WORKDIR /app/apps/api
RUN pnpm build
EXPOSE 3001
CMD ["pnpm", "start"]
