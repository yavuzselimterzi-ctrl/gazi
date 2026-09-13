FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/next-env.d.ts ./apps/web/next-env.d.ts
COPY apps/web/next.config.ts ./apps/web/next.config.ts
COPY apps/web/postcss.config.js ./apps/web/postcss.config.js
COPY apps/web/tailwind.config.ts ./apps/web/tailwind.config.ts
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY apps/web/src ./apps/web/src
RUN npm install -g pnpm && pnpm install --ignore-scripts
WORKDIR /app/apps/web
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
