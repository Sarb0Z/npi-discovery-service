# 🚀 AGENT DIRECTIVE: Healthcare Provider Discovery Service

**Role:** You are a Staff-Level Full-Stack Engineer. Your task is to implement a production-grade Healthcare Provider Discovery Service.
**Quality Bar:** Zero-shortcuts, strict TypeScript (no `any`, no `@ts-ignore`), 100% test pass rate, perfect separation of concerns, and full Dockerized reproducibility.

## 🏗️ 1. Architecture & Tech Stack
**Pattern:** Contract-Driven Monorepo (Turborepo with Bun workspaces).
*   **Backend (`apps/api/`):** Bun 1.0+, TypeScript 5+, NestJS (built-in DI, class-validator, Swagger, WebSockets).
*   **Frontend (`apps/web/`):** Next.js 14+ (App Router), TypeScript 5+, TailwindCSS + CVA + Radix UI (shadcn-style), TanStack Query (server state), Zustand (client state), React Hook Form (forms), Recharts.
*   **Shared Contract (`packages/contracts/`):** `@npi/contracts` — central schema ownership. OpenAPI (Swagger) generation from NestJS DTOs → automatically typed hooks. No manual `fetch` writing on the frontend.
*   **Package Manager:** Bun with Turbo workspaces.
*   **Caching:** TanStack Query (client-side), Redis (server-side pub/sub, rate-limiting, cache).
*   **CI/CD:** GitHub Actions → Render (API deploy) + Vercel (Web deploy). `develop` → staging, `main` → production.

### Repo Structure
```
npi-discovery-service/
├── apps/
│   ├── api/                      # NestJS backend
│   │   └── src/
│   │       ├── modules/<feature>/  # Feature-bounded modules
│   │       └── common/             # Decorators, guards, plugins, scheduler, pubsub
│   └── web/                      # Next.js frontend
│       └── src/
│           ├── app/               # App Router route structure
│           ├── components/
│           │   ├── ui/            # Radix/shadcn primitives
│           │   └── <domain>/      # Feature component slices
│           └── lib/
│               ├── auth/
│               ├── hooks/
│               └── stores/        # Zustand stores
├── packages/
│   └── contracts/                # @npi/contracts — shared TS types & schemas
├── docker/                       # Docker Compose & infra config
├── infra/                        # Terraform deployment
├── scripts/                      # Root automation scripts
├── .claude/ .agent/              # Agent instruction metadata
├── .github/                      # GitHub Actions workflows
├── turbo.json                    # Task graph (env-sensitive builds, cached inputs)
└── CLAUDE.md                     # Root agent instructions
```

---

## ⚠️ 2. CRITICAL PITFALLS & EVALUATOR TRAPS (RESEARCH BACKED)

Evaluators of this specific NPPES assignment look for how you handle the following known API quirks. **You must implement these mitigations:**

1.  **The Deep Pagination Limit (CMS Limit):** The NPPES API strictly caps `skip + limit` (usually around 1,200 records). *If a user searches by "State: TX", it will return hundreds of thousands of providers and the standard pagination will crash.*
    *   **Mandatory Strategy:** For the "Bulk Collection" requirement, implement a **Partitioning Algorithm**. If `total > 1000`, the backend must automatically sub-divide the query (e.g., iterating through a predefined list of major cities or taxonomy sub-codes) to extract all records without hitting the skip limit.
2.  **Messy/Missing Data:** NPPES JSON responses are notoriously nested and inconsistent. 
    *   **Mandatory Strategy:** The NestJS service *must* map the raw NPPES response into a clean, canonical `Provider` DTO before returning it to the frontend. Handle missing `addresses`, `taxonomies`, and `basic` fields with strict `null` fallbacks.
3.  **Rate Limiting (AC6):** The API will return `429 Too Many Requests` during bulk fetches.
    *   **Mandatory Strategy:** Wrap the Axios HTTP client in `axios-retry` using an **exponential backoff**.

---

## 🛠️ 3. BACKEND EXECUTION PLAN (NestJS)

### Core Modules to Generate:
All modules live under `apps/api/src/modules/<feature>/`. Shared infrastructure lives under `apps/api/src/common/`.

1.  **NppesClientModule (`modules/nppes-client/`):** An isolated wrapper around Axios. Handles URL construction, exponential backoff (AC6), and error parsing (AC5).
2.  **ProvidersModule (`modules/providers/`):** Contains the `ProvidersController`, input validation (`SearchProvidersDto` from `@npi/contracts`), and standard search logic.
3.  **BulkCollectionModule (`modules/bulk-collection/`):** Handles the background/streaming task.
    *   *File I/O:* Must save strictly to `providers_{location}_{taxonomy}_{timestamp}.json` in an `/output` dir.
    *   *Bonus Implementation:* Implement a `WebSocketGateway` to emit `{ total, collected, remaining }` events to the frontend.
4.  **StatisticsModule (`modules/statistics/`):** Processes the saved JSONs or API results to calculate counts (Type 1 vs Type 2, Top 10 Specialties, Multi-taxonomy count).

### Shared Infrastructure (`apps/api/src/common/`):
*   **Decorators:** Custom route/param decorators.
*   **Guards:** Auth guards, role guards.
*   **Plugins:** Fastify/NestJS plugins.
*   **Scheduler:** Cron/task scheduling.
*   **PubSub:** Redis-backed pub/sub for WebSocket events.

### Strict Compliance & Bonuses:
*   **Validation (AC4):** Use `@nestjs/swagger` and `class-validator` decorators on all DTOs (defined in `@npi/contracts`).
*   **Luhn Algorithm (Bonus):** Implement a strict NPI checksum validator utility for incoming requests.
*   **Caching (Bonus):** Use Redis via `cache-manager` to cache taxonomy descriptions and state-wide searches.
*   **Rate Limiting Own API (Bonus):** Use `@nestjs/throttler` to protect the backend endpoints.
*   **Request Logging (Bonus):** Implement middleware to attach and log a `x-correlation-id` for every request.
*   **Agent File:** Maintain `apps/api/CLAUDE.md` with module-specific instructions.

---

## 🖥️ 4. FRONTEND EXECUTION PLAN (Next.js — `apps/web/`)

### Data Access (Strict Rule):
*   Generate the API client using the Backend's Swagger JSON.
*   Use **TanStack Query** for server state caching, loading states, and pagination handling.
*   Use **Zustand** for client-side state (search filters, UI toggles, etc.) under `src/lib/stores/`.
*   Use **React Hook Form** for all form state management.
*   Leverage Next.js **App Router** for file-based routing and Server Components where beneficial.
*   URL state managed via App Router search params.

### Styling (Strict Rule):
*   **TailwindCSS** as base utility layer with `prettier-plugin-tailwindcss`.
*   **CVA (class-variance-authority)** for component variant definitions.
*   **Radix UI** primitives composed shadcn-style under `src/components/ui/`.
*   Feature components live under `src/components/<domain>/`.

### UI/UX Requirements (AC7, AC8, AC9, AC10):
1.  **Search Interface:**
    *   Tabs/Toggles for (ZIP vs City/State vs State-only).
    *   Debounced autocomplete for Taxonomy selection.
    *   Local Storage persistence for recent searches (Bonus).
2.  **Results View:**
    *   *State:* Must have Skeleton Loaders (Loading), Empty State (Helpful message), Error State (User-friendly).
    *   *Display:* Toggle between Table View (sortable columns) and Card View.
    *   *Visuals:* Badges for Individual vs. Organization.
3.  **Statistics Dashboard:**
    *   Use `Recharts`. Include a Donut Chart (Provider Types) and Bar Charts (Top 10 Specialties/Cities).
4.  **Bulk & Export (AC11):**
    *   "Download JSON" button.
    *   "Download CSV" button (Bonus).
    *   Live progress bar listening to WebSockets (Redis pub/sub backed) for Bulk Collection.
    *   Mapbox/Leaflet provider location map (Bonus).
*   **Agent File:** Maintain `apps/web/CLAUDE.md` with component/routing conventions.

---

## 💠 5.5. TypeScript & Code Quality Standards

### TypeScript Configuration (Root Base):
*   `strict: true`
*   `noImplicitAny: true`
*   `strictNullChecks: true`
*   `strictFunctionTypes: true`
*   `noImplicitReturns: true`
*   `noUncheckedIndexedAccess: true`
*   `noImplicitOverride: true`
*   `incremental: true` (incremental builds)
*   `experimentalDecorators: true` (for NestJS)

### ESLint (v9 Flat Config):
*   `@eslint/js` + `typescript-eslint` (recommended type-checked + stylistic)
*   `eslint-plugin-import` + `eslint-config-prettier`
*   **Key rules:** no unused vars, prefer nullish/optional chaining, no floating promises, consistent type imports, interfaces over type aliases, no var / prefer const / eqeqeq / curly

### Prettier:
*   `semi: false`
*   `singleQuote: true`
*   `trailingComma: 'all'`
*   `printWidth: 100`
*   `prettier-plugin-tailwindcss`

### Typing Patterns:
*   Interface preference (enforced by ESLint)
*   Type-only imports (`import type { ... }`)
*   Strong aversion to `any` and weak mutation typing
*   All DTOs/contracts owned by `@npi/contracts` in `packages/contracts/`

---

## 🧪 6. TEST HARNESS & QUALITY ASSURANCE

Evaluators will run `bun run test` and `bun run test:cov`. **You must achieve >85% Backend and >70% Frontend coverage.**

### Backend Testing (Jest - Do NOT use real network calls)
Mock the `HttpService` and implement the exact test cases from Page 7:
*   **Controller:** valid ZIP, city/state, filter by type, 400 invalid ZIP, empty result handling, stats generation, taxonomy list.
*   **Service:** pagination handling, rate limit 429 backoff, taxonomy filter logic, statistics calculations, specialty breakdown.
*   **NPPES Client:** query param URL construction, response parsing, network errors, retry logic.

### Frontend Testing (React Testing Library + MSW)
Use **Mock Service Worker (MSW)** to mock API boundaries. Implement the exact test cases from Page 7 & 8:
*   **Components:** SearchForm renders inputs, validates ZIP, submits valid data. ResultsTable renders data, sorts, paginates. StatsDashboard displays metrics, charts render. Loading spinner, Error state, Empty state displays.
*   **Hooks/Server Actions:** `useProviderSearch` returns loading state, returns data on success, returns error on failure.

### E2E Testing (Bonus)
*   Include a basic **Playwright** configuration (`tests/e2e/search.spec.ts`) that boots the Next.js app, mocks the API, and asserts the search flow from ZIP entry to Results rendering.

---

## 📂 7. DELIVERY & REPO STANDARDS

Generate the required `package.json` scripts EXACTLY as requested:
*   **Backend:** `"dev": "nest start --watch"`, `"build": "nest build"`, `"test:cov": "jest --coverage"`.
*   **Frontend:** `"dev": "next dev"`, `"build": "next build"`, `"test:cov": "jest --coverage"`.

**Documentation (docs/API.md & README.md):**
*   Create a Mermaid.js architecture diagram in the docs.
*   Document how to start the app via `docker-compose up --build` (config lives in `docker/`).
*   Document that `bun install` is used for dependency management across the Turbo workspace.
*   Document exactly how the **NPPES Deep Pagination mitigation** was implemented (evaluators will look specifically for this explanation).
*   Document the `.env` requirements (root `.env.example`, Docker Compose `env_file`, container-specific overrides).
*   Document the deployment flow: GitHub Actions → Render (API) + Vercel (Web), with `develop` → staging and `main` → production.

### Agent Instruction Files:
Maintain `CLAUDE.md` files at:
*   Root (`./CLAUDE.md`) — global repo conventions
*   `apps/api/CLAUDE.md` — backend module patterns, NestJS specifics
*   `apps/web/CLAUDE.md` — Next.js routing, component conventions
*   `packages/contracts/CLAUDE.md` — schema/DTO ownership rules

Additional agent metadata in `.claude/` and `.agent/` directories at root.

---

### 🧠 Agent Auto-Correction Prompt:
*"Before finalizing any code block, ask yourself: Is this strictly typed? Are there any hidden `any` types? Is this code handling a potential 429 or 500 error from the external NPPES API gracefully? If I run the required coverage command, will this feature be covered? If no, correct it before outputting."*