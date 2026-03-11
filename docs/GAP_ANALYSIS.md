# Gap Analysis: NPI Discovery Service vs. Specification

> Comprehensive validation of the implemented codebase against the requirements
> defined in `STANDARDS.md`, `TEST_STRATEGY.md`, `README.md`, and `NPPI_API.md`.

---

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Backend Core Modules | ✅ Implemented | All 4 required modules present |
| Partition Algorithm | ✅ Implemented | Postal-wildcard fan-out + provider-type splitting |
| Response Mapping | ✅ Implemented | `providers.mapper.ts` with null fallbacks |
| axios-retry (AC6) | ✅ Implemented | Exponential backoff, retries on 429/502/503 |
| Swagger / OpenAPI | ✅ Implemented | At `/api/docs` with proper decorators |
| TypeScript Strict Mode | ✅ Implemented | All 7 flags enabled in `tsconfig.base.json` |
| ESLint v9 Flat Config | ✅ Implemented | All required rules present |
| Prettier Config | ✅ Implemented | Matches spec exactly |
| Docker Dev Setup | ✅ Implemented | Compose with watch mode, Redis, health checks |
| CI/CD Workflows | ✅ Implemented | `ci.yml` + `deploy.yml` present |
| Frontend Search UI | ✅ Implemented | ZIP / City+State / State-only tabs |
| Skeleton / Empty / Error States | ✅ Implemented | All three states present |
| Table ↔ Card View Toggle | ✅ Implemented | Via view mode store |
| Sortable Table Columns | ✅ Implemented | 5 sortable columns |
| Recharts Statistics | ✅ Implemented | Donut + 2 Bar charts |
| JSON + CSV Export | ✅ Implemented | Both download buttons present |
| Zustand Client State | ✅ Implemented | `search-store.ts` with persistence |
| TanStack Query Server State | ✅ Implemented | Mutations + queries |
| React Hook Form + Zod | ✅ Implemented | `search.schema.ts` + `search-form.tsx` |
| Backend Test Coverage | ⚠️ 97.49% (1 failure) | `main.spec.ts` assertion mismatch |
| Frontend Test Coverage | ❌ 24.5% (target ≥70%) | Only 2 test files, 4 tests |
| Contracts Test Coverage | ✅ 83.22% | 10 tests pass |
| E2E Tests | ✅ 5/5 Pass | `supertest` integration tests |
| WebSocket Gateway | ✅ Implemented | `bulk-collection.gateway.ts` publishes live job progress over Socket.IO |
| Redis Integration | ✅ Implemented | `RedisService` backs broad-search caching and websocket pub/sub with in-memory fallback |
| Expandable Table Rows | ✅ Implemented | Results table includes inline detail expansion with taxonomy and contact info |
| Pagination Size Selector | ✅ Implemented | Results table offers 10 / 25 / 50 rows per page |
| Taxonomy Breakdown Table | ✅ Implemented | Statistics dashboard includes sortable taxonomy breakdown table |
| Taxonomy Code Direct Input | ✅ Implemented | Search form includes raw `taxonomyCode` input alongside description search |
| CLAUDE.md Agent Files | ✅ Implemented | Root, API, frontend, and contracts guides are present |
| Exact NPI Lookup | ✅ Implemented | Public search contract accepts `npi` with checksum validation |
| Leaflet Provider Map | ✅ Implemented | Search results render a ZIP-centroid provider footprint map |
| Playwright E2E | ❌ Missing | No Playwright config or tests |

---

## 1. Critical Gaps (Blocking)

### 1.1 Frontend Test Coverage: 24.5% (Target ≥70%)

**Spec Reference:** STANDARDS.md §6, TEST_STRATEGY.md §3

The frontend has only **2 test files** with **4 tests**:
- `components/search/search-form.test.tsx` — form rendering/validation
- `lib/utils/export.test.ts` — JSON/CSV export

**Missing test files per TEST_STRATEGY.md:**

| Required Test File | Status |
|--------------------|--------|
| `results-table.test.tsx` | ❌ Missing |
| `provider-card.test.tsx` | ❌ Missing |
| `stats-dashboard.test.tsx` | ❌ Missing |
| `use-provider-search.test.ts` | ❌ Missing |
| `search-store.test.ts` | ❌ Missing |
| Loading/Error/Empty state tests | ❌ Missing |

**Impact:** Evaluators run `bun run test:cov` and will see the 24.5% figure immediately. This is the single largest gap.

### 1.2 Backend Test Failure: `main.spec.ts`

**File:** `apps/api/src/main.spec.ts` line 72

```
expect(app.listen).toHaveBeenCalledWith(3000)
```

But `main.ts` calls `app.listen(port, host)` which resolves to `app.listen(3000, '0.0.0.0')`.

**Fix:** Update the assertion to `expect(app.listen).toHaveBeenCalledWith(3000, '0.0.0.0')`.

### 1.3 Implemented Backend Runtime Features

The following items previously marked missing are already present in the codebase:

- Bulk job progress is handled by `BulkCollectionGateway`, which publishes Socket.IO events and bridges them through Redis pub/sub when Redis is available.
- Redis is wired through `RedisService`, which provides JSON caching for broad searches and pub/sub transport for bulk progress updates, with an in-memory fallback for local runs without Redis.
- API throttling is enabled through `@nestjs/throttler` in `AppModule`.
- Request correlation IDs are attached and logged by `CorrelationIdMiddleware`.

---

## 2. Significant Gaps (High Priority)

### 2.1 Agent Instruction Files

**Spec Reference:** STANDARDS.md §7

Required files:
| File | Status |
|------|--------|
| `./CLAUDE.md` (root) | ✅ Present |
| `apps/api/CLAUDE.md` | ✅ Present |
| `apps/frontend/CLAUDE.md` | ✅ Present |
| `packages/contracts/CLAUDE.md` | ✅ Present |

The spec text still references `apps/web/CLAUDE.md`, but the actual frontend workspace path in this repository is `apps/frontend/CLAUDE.md`.

### 2.2 Search And Analytics UI

The following UI items previously marked missing are already implemented:

- `results-table.tsx` supports inline row expansion for address, phone, and taxonomy details.
- `results-table.tsx` exposes a rows-per-page selector with 10 / 25 / 50 options.
- `taxonomy-breakdown-table.tsx` renders a sortable taxonomy table inside the statistics dashboard.
- `search-form.tsx` includes both raw taxonomy code input and taxonomy description input.

### 2.5 Playwright E2E Tests

**Spec Reference:** STANDARDS.md §6, TEST_STRATEGY.md §5

No `playwright.config.ts` or `tests/e2e/` directory exists. The spec defines 10 E2E test cases covering search flow, view toggles, sorting, pagination, exports, and error states via Playwright. While the NestJS `supertest` E2E tests partially cover the API layer, browser-level E2E is completely absent.

### 2.6 Taxonomy Code Direct Input

Resolved in the product UI. `search-form.tsx` includes a dedicated `taxonomyCode` field, so this is no longer a product gap.

---

## 3. Minor Gaps (Low Priority / Bonus Features)

### 3.1 `@nestjs/throttler` — Own API Rate Limiting

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Use `@nestjs/throttler` to protect the backend endpoints."

Implemented in `AppModule` via `ThrottlerModule` and `APP_GUARD` with `ThrottlerGuard`.

### 3.2 Luhn NPI Checksum Validator

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Implement a strict NPI checksum validator utility for incoming requests."

Implemented. The shared contracts package includes `isValidNpi` and `@IsNpi()`, and `SearchProvidersDto` now exposes an `npi` field for exact provider lookup.

### 3.3 `x-correlation-id` Request Logging

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Implement middleware to attach and log a `x-correlation-id` for every request."

Implemented by `CorrelationIdMiddleware`, which propagates or generates `x-correlation-id` and logs it with each completed request.

### 3.4 Redis Cache (Bonus)

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Use Redis via `cache-manager` to cache taxonomy descriptions and state-wide searches."

Implemented through the custom `RedisService` rather than Nest `cache-manager`. Broad state searches are cached, and bulk progress events use Redis pub/sub when available.

### 3.5 Mapbox/Leaflet Provider Map (Bonus)

**Spec Reference:** STANDARDS.md §4 (Bonus)

> "Mapbox/Leaflet provider location map (Bonus)."

Implemented. The search experience now renders a Leaflet map that plots result-set density by ZIP centroid.

### 3.6 Frontend Directory Naming

**Spec Reference:** STANDARDS.md §1

The spec consistently refers to the frontend as `apps/web/` but the actual implementation uses `apps/frontend/`. This is a cosmetic discrepancy — the functionality is present — but documentation references to `apps/web/` would be incorrect.

### 3.7 Recent Searches UI Rendering

The Zustand store has `recentSearches` state with `addRecentSearch` logic, the hook calls `addRecentSearch` on successful search, and `search-form.tsx` reads `recentSearches` and renders a list. This feature appears **implemented** — the coverage report shows the render path exists but isn't adequately tested.

### 3.8 Shared Infrastructure (`apps/api/src/common/`)

**Spec Reference:** STANDARDS.md §3

The spec lists decorators, guards, plugins, scheduler, and pubsub under `common/`. The repository does now use additional shared infrastructure, including `common/http/correlation-id.middleware.ts` and `common/redis/redis.service.ts`. Custom decorators, auth guards, and cron scheduling remain out of scope for the current feature set.

---

## 4. Test Coverage Detail

### 4.1 Backend (97.49% Statements)

| Metric | Coverage |
|--------|----------|
| Statements | 97.49% ✅ |
| Branches | 88.88% |
| Functions | 91.89% |
| Lines | 97.43% |

**Issues:**
- 1 failing test (`main.spec.ts` — assertion mismatch on `listen` args)
- 20 test suites, 59 individual tests

### 4.2 Frontend (24.5% Statements)

| Metric | Coverage |
|--------|----------|
| Statements | 24.5% ❌ |
| Branches | 10.63% |
| Functions | 16.32% |
| Lines | 24.85% |

**0% coverage files (partial list):**
- All statistics components (dashboard, charts, summary cards)
- `results-header.tsx`, `results-table.tsx`, `provider-card.tsx`
- `search-experience.tsx`, `empty-state.tsx`, `error-state.tsx`
- `use-provider-search.ts` (hook)
- `search-store.ts` (store)
- `lib/api/providers.ts` (API client)
- All bulk components
- Navbar

### 4.3 Contracts (83.22% Statements)

| Metric | Coverage |
|--------|----------|
| Statements | 83.22% |
| Branches | 71.42% |
| Functions | 72.72% |
| Lines | 82.35% |

**Low coverage:**
- `utils/provider-type.ts` — 38.46% (utility converters not fully exercised)

---

## 5. Recommended Remediation Priority

### P0 — Must Fix (Evaluator-facing failures)

1. **Fix `main.spec.ts`** — Change `expect(app.listen).toHaveBeenCalledWith(3000)` to `expect(app.listen).toHaveBeenCalledWith(3000, '0.0.0.0')` to match the actual `bootstrap()` call.

2. **Add frontend tests to reach ≥70% coverage** — Create the 6 missing test files specified in TEST_STRATEGY.md §3.3:
   - `results-table.test.tsx` (sorting, pagination, badges, rendering)
   - `provider-card.test.tsx` (field rendering, type badge)
   - `statistics-dashboard.test.tsx` or per-chart tests (summary cards, chart mounting)
   - `use-provider-search.test.ts` (loading/success/error states)
   - `search-store.test.ts` (mode switching, filter persistence)
   - Loading/Error/Empty state component tests

### P1 — Should Fix (Spec-required features)

3. **Update stale documentation references** — Replace `apps/web` references with `apps/frontend` where the spec is documenting this repository layout.

### P2 — Nice to Have (Bonus features)

8. **Add Playwright E2E tests** — Set up `playwright.config.ts` and implement the 10 specified E2E test cases.

9. **Increase contracts coverage** — Add tests for `provider-type.ts` utility functions to reach higher coverage.

---

## 6. Spec-to-Implementation Traceability Matrix

| Spec Requirement | Section | Implemented | Gap |
|-----------------|---------|-------------|-----|
| NppesClientModule with axios-retry | §3 | ✅ | — |
| ProvidersModule with search/filter | §3 | ✅ | — |
| BulkCollectionModule with partitioning | §3 | ✅ | — |
| StatisticsModule | §3 | ✅ | — |
| Deep pagination mitigation | §2.1 | ✅ | — |
| Messy data mapping | §2.2 | ✅ | — |
| Rate limiting backoff | §2.3 | ✅ | — |
| WebSocketGateway for bulk | §3 | ✅ | Implemented via `bulk-collection.gateway.ts` |
| Redis server-side | §1 | ✅ | Broad-search cache plus bulk progress pub/sub |
| Luhn NPI validator | §3 Bonus | ✅ | Wired into `SearchProvidersDto.npi` |
| Redis cache-manager | §3 Bonus | ⚠️ Alternative implementation | Custom `RedisService` is used instead of Nest `cache-manager` |
| @nestjs/throttler | §3 Bonus | ✅ | Configured in `AppModule` |
| x-correlation-id | §3 Bonus | ✅ | Implemented by middleware |
| CLAUDE.md files | §7 | ✅ | Present at root, API, frontend, and contracts |
| Search tabs (ZIP/City/State) | §4.1 | ✅ | — |
| Taxonomy autocomplete | §4.1 | ✅ | Raw taxonomy code input is also implemented |
| Exact NPI search | §4.1 extension | ✅ | Implemented via dedicated `npi` field and UI mode |
| Recent searches (localStorage) | §4.1 Bonus | ✅ | Implemented in store + form |
| Skeleton/Empty/Error states | §4.2 | ✅ | — |
| Table/Card view toggle | §4.2 | ✅ | — |
| Sortable table columns | §4.2 | ✅ | — |
| Expandable table rows | §4.2 | ✅ | Implemented in results table |
| Pagination 10/25/50 | TEST_STRATEGY §3.3 | ✅ | Rows-per-page selector implemented |
| Individual vs Org badges | §4.2 | ✅ | — |
| Recharts donut + bar charts | §4.3 | ✅ | — |
| Taxonomy table sortable | TEST_STRATEGY §3.3 | ✅ | Implemented in statistics dashboard |
| JSON download | §4.4 | ✅ | — |
| CSV download | §4.4 Bonus | ✅ | — |
| Live WebSocket progress bar | §4.4 | ✅ | Bulk status subscribes to Socket.IO progress events |
| Mapbox/Leaflet map | §4.4 Bonus | ✅ | Leaflet provider footprint map is rendered in search results |
| Backend ≥85% coverage | §6 | ✅ 97.49% | 1 failing test |
| Frontend ≥70% coverage | §6 | ❌ 24.5% | 45.5% gap |
| Playwright E2E | §6 Bonus | ❌ | Not implemented |
| Mermaid architecture diagram | §7 | ✅ | In API.md |
| Docker dev docs | §7 | ✅ | — |
| NPPES pagination docs | §7 | ✅ | In API.md |
| .env documentation | §7 | ✅ | .env.example exists |
| Deployment flow docs | §7 | ✅ | In README.md |
| TypeScript strict flags (7/7) | §5.5 | ✅ | — |
| ESLint v9 flat config | §5.5 | ✅ | — |
| Prettier config | §5.5 | ✅ | — |
