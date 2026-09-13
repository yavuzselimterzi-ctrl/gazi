# GAZİ Meclis-i Mebusan Dijital Osmanlı Devlet Portalı

Bu proje, Osmanlı devlet yapısına ait belge, etkinlik, içerik ve kurumsal iş akışlarını dijitalleştiren profesyonel bir SaaS platformu olarak tasarlanmıştır.

## Mimari

- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: NestJS + Prisma + PostgreSQL + Redis + Socket.IO
- Auth: JWT, refresh token, OAuth, two-factor authentication
- Deployment: Docker, Docker Compose, Nginx

## Kurulum

1. `pnpm install`
2. `docker compose up -d postgres redis minio`
3. `pnpm --filter @gazimeclis/api prisma generate`
4. `pnpm --filter @gazimeclis/api prisma migrate dev`
5. `pnpm dev`

## Proje Yapısı

- `apps/web` – Next.js web uygulaması
- `apps/api` – NestJS API hizmeti
- `docker-compose.yml` – Yerel ortam altyapısı
