# NPI Discovery Service

NestJS + Next.js monorepo for searching, filtering, and bulk-exporting US healthcare providers from the public NPPES registry.

## What it does

Wraps the CMS NPPES API with an intelligent partition-based collection strategy that handles broad geographic queries beyond the upstream result ceiling. Results are cached in Redis, streamed over WebSockets during bulk jobs, and visualised on a Leaflet map rendered from ZIP-code centroids. An NPI checksum validator rejects invalid identifiers before they reach the upstream API.

## Features

- Provider search by NPI, ZIP code, city, state, taxonomy description, or raw taxonomy code (e.g. `1223G0001X`)
- Partition-aware bulk collector: splits by provider type then recursively narrows by postal prefix until each leaf query fits within upstream limits; reports incomplete partitions explicitly in response metadata rather than silently truncating
- Redis-backed caching for broad searches (10-minute TTL) with in-memory fallback for local runs
- WebSocket gateway for real-time bulk-job progress across multiple API instances
- Correlation-ID middleware on every request for end-to-end traceability
- Swagger docs served at `/api/docs`
- Statistics endpoint with specialty, city, and provider-type breakdowns
- CSV/JSON bulk export to a configurable output directory

## Tech stack

- **API:** NestJS (TypeScript), Redis, class-validator, Swagger
- **Frontend:** Next.js 14 (App Router), React, Leaflet, Recharts, Tailwind CSS
- **Shared:** `@npi/contracts` — DTOs, validators, interfaces shared across apps
- **Infra:** Docker Compose (API + frontend + Redis), Terraform (Render + Vercel), GitHub Actions CI/CD

## How to run

```bash
cp .env.example .env
cd docker && docker compose up --build
```

Services start at:
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Frontend: `http://localhost:3001`
- Redis: `redis://localhost:6379`

For live-reload development with source bind-mounts:

```bash
bun run docker:dev
```

See `.env.example` for all configurable variables (`PORT`, `REDIS_URL`, `THROTTLE_LIMIT`, etc.).

## Status

Active personal project — built to explore partition-aware API pagination, Redis pub/sub for WebSocket fan-out, and monorepo architecture with shared TypeScript contracts.
