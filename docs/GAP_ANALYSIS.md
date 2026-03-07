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
| WebSocket Gateway | ❌ Missing | Spec requires for bulk progress |
| Redis Integration | ❌ Missing | No caching/pub-sub/rate-limiting |
| Expandable Table Rows | ❌ Missing | Spec requires detail expansion |
| Pagination Size Selector | ❌ Missing | Hardcoded to 10 |
| Taxonomy Breakdown Table | ❌ Missing | Stats page lacks sortable taxonomy table |
| Taxonomy Code Direct Input | ❌ Missing | Only autocomplete, no raw code entry |
| CLAUDE.md Agent Files | ❌ Missing | None of the 4 required files exist |
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

### 1.3 WebSocket Gateway for Bulk Progress

**Spec Reference:** STANDARDS.md §3 (BulkCollectionModule)

> "Implement a WebSocketGateway to emit `{ total, collected, remaining }` events to the frontend."

The current `BulkCollectionService` runs fire-and-forget async with UUID job tracking, but has no WebSocket Gateway. The frontend's `bulk-status.tsx` shows a static animated progress bar, not live WebSocket-driven updates.

**Test Reference:** TEST_STRATEGY.md §2.3 (Bulk Collection Tests)

> "should emit WebSocket progress events — `gateway.emit()` called with `{ total, collected, remaining }`"

### 1.4 Redis Integration

**Spec Reference:** STANDARDS.md §1

> "Caching: TanStack Query (client-side), Redis (server-side pub/sub, rate-limiting, cache)"

Redis is listed in `docker-compose.dev.yml` and the `.env.example` has `REDIS_URL`, but no application code references Redis. The backend does not use:
- `cache-manager` with Redis store
- Redis pub/sub for WebSocket events
- Redis-backed rate limiting

---

## 2. Significant Gaps (High Priority)

### 2.1 Missing Agent Instruction Files (CLAUDE.md)

**Spec Reference:** STANDARDS.md §7

Required files:
| File | Status |
|------|--------|
| `./CLAUDE.md` (root) | ❌ Missing |
| `apps/api/CLAUDE.md` | ❌ Missing |
| `apps/web/CLAUDE.md` | ❌ Missing |
| `packages/contracts/CLAUDE.md` | ❌ Missing |

The spec also mentions `.claude/` and `.agent/` directories at root — neither exists. Note: `.github/copilot-instructions.md` exists as a VS Code Copilot context file but does not fulfill the CLAUDE.md requirement.

### 2.2 Expandable Table Rows

**Spec Reference:** TEST_STRATEGY.md §3.3 (ResultsTable tests)

> "expands row to show full details — Click row → expanded panel"

The current `results-table.tsx` renders flat rows with no expand/collapse mechanism. No detail panel is shown when clicking a row.

### 2.3 Pagination Size Selector (10/25/50)

**Spec Reference:** TEST_STRATEGY.md §3.3

> "paginates correctly (10/25/50 per page) — Page controls change visible rows"

The current `results-table.tsx` hardcodes `const pageSize = 10` with no user-selectable page-size control.

### 2.4 Taxonomy Breakdown Table (Statistics)

**Spec Reference:** TEST_STRATEGY.md §3.3 (StatsDashboard tests)

> "taxonomy table is sortable by count — Click header → sorted"

The statistics dashboard has 5 summary cards + 3 charts (donut, cities bar, specialties bar) but no sortable taxonomy breakdown table.

### 2.5 Playwright E2E Tests

**Spec Reference:** STANDARDS.md §6, TEST_STRATEGY.md §5

No `playwright.config.ts` or `tests/e2e/` directory exists. The spec defines 10 E2E test cases covering search flow, view toggles, sorting, pagination, exports, and error states via Playwright. While the NestJS `supertest` E2E tests partially cover the API layer, browser-level E2E is completely absent.

### 2.6 Taxonomy Code Direct Input

**Spec Reference:** Not explicitly in STANDARDS.md but implied by the search modes. The search form supports debounced autocomplete for taxonomy selection but does not allow entering a raw taxonomy code (e.g., `207Q00000X`) directly.

---

## 3. Minor Gaps (Low Priority / Bonus Features)

### 3.1 `@nestjs/throttler` — Own API Rate Limiting

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Use `@nestjs/throttler` to protect the backend endpoints."

Not implemented. The external NPPES rate-limiting is handled via `axios-retry`, but there's no throttling on the service's own endpoints.

### 3.2 Luhn NPI Checksum Validator

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Implement a strict NPI checksum validator utility for incoming requests."

Not implemented. NPI numbers in search params are accepted without Luhn checksum validation.

### 3.3 `x-correlation-id` Request Logging

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Implement middleware to attach and log a `x-correlation-id` for every request."

No correlation-ID middleware exists.

### 3.4 Redis Cache (Bonus)

**Spec Reference:** STANDARDS.md §3 (Bonus)

> "Use Redis via `cache-manager` to cache taxonomy descriptions and state-wide searches."

Redis is provisioned in Docker but not used in the application layer.

### 3.5 Mapbox/Leaflet Provider Map (Bonus)

**Spec Reference:** STANDARDS.md §4 (Bonus)

> "Mapbox/Leaflet provider location map (Bonus)."

Not implemented.

### 3.6 Frontend Directory Naming

**Spec Reference:** STANDARDS.md §1

The spec consistently refers to the frontend as `apps/web/` but the actual implementation uses `apps/frontend/`. This is a cosmetic discrepancy — the functionality is present — but documentation references to `apps/web/` would be incorrect.

### 3.7 Recent Searches UI Rendering

The Zustand store has `recentSearches` state with `addRecentSearch` logic, the hook calls `addRecentSearch` on successful search, and `search-form.tsx` reads `recentSearches` and renders a list. This feature appears **implemented** — the coverage report shows the render path exists but isn't adequately tested.

### 3.8 Shared Infrastructure (`apps/api/src/common/`)

**Spec Reference:** STANDARDS.md §3

The spec lists decorators, guards, plugins, scheduler, and pubsub under `common/`. Currently only `errors/` and `filters/` exist. The project doesn't use auth guards, custom decorators, cron scheduling, or Redis pub/sub.

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

3. **Implement WebSocket Gateway** — Add a `BulkCollectionGateway` using `@nestjs/websockets` that emits progress events (`{ total, collected, remaining }`) during bulk collection jobs.

4. **Add expandable table rows** — Modify `results-table.tsx` to support click-to-expand for full provider details (all taxonomies, full address, phone).

5. **Add pagination size selector** — Replace the hardcoded `pageSize = 10` with a `<Select>` component offering 10/25/50 options.

6. **Add taxonomy breakdown table** — Create a `taxonomy-table.tsx` component for the statistics dashboard showing taxonomy description, code, count, and percentage with sortable columns.

7. **Create CLAUDE.md files** — Generate the 4 required agent instruction files at root, `apps/api/`, `apps/frontend/`, and `packages/contracts/`.

### P2 — Nice to Have (Bonus features)

8. **Add Playwright E2E tests** — Set up `playwright.config.ts` and implement the 10 specified E2E test cases.

9. **Integrate Redis** — Connect `cache-manager` with Redis store for caching taxonomy descriptions and broad search results. Wire it to the `BulkCollectionGateway` via pub/sub.

10. **Add `@nestjs/throttler`** — Protect public endpoints from abuse.

11. **Implement Luhn NPI validator** — Custom `class-validator` decorator that validates NPI checksum.

12. **Add `x-correlation-id` middleware** — Generate/propagate correlation IDs for request tracing.

13. **Add taxonomy code direct input** — Allow users to enter a taxonomy code string directly alongside the autocomplete.

14. **Increase contracts coverage** — Add tests for `provider-type.ts` utility functions to reach higher coverage.

---

## 6. Spec-to-Implementation Traceability Matrix

| Spec Requirement | Section | Implemented | Gap |
|-----------------|---------|-------------|-----|
| NppesClientModule with axios-retry | §3 | ✅ | — |
| ProvidersModule with search/filter | §3 | ✅ | — |
| BulkCollectionModule with partitioning | §3 | ✅ | Missing WebSocket |
| StatisticsModule | §3 | ✅ | Missing taxonomy table |
| Deep pagination mitigation | §2.1 | ✅ | — |
| Messy data mapping | §2.2 | ✅ | — |
| Rate limiting backoff | §2.3 | ✅ | — |
| WebSocketGateway for bulk | §3 | ❌ | Not implemented |
| Redis server-side | §1 | ❌ | Provisioned but unused |
| Luhn NPI validator | §3 Bonus | ❌ | Not implemented |
| Redis cache-manager | §3 Bonus | ❌ | Not implemented |
| @nestjs/throttler | §3 Bonus | ❌ | Not implemented |
| x-correlation-id | §3 Bonus | ❌ | Not implemented |
| CLAUDE.md files | §7 | ❌ | None exist |
| Search tabs (ZIP/City/State) | §4.1 | ✅ | — |
| Taxonomy autocomplete | §4.1 | ✅ | No raw code input |
| Recent searches (localStorage) | §4.1 Bonus | ✅ | Implemented in store + form |
| Skeleton/Empty/Error states | §4.2 | ✅ | — |
| Table/Card view toggle | §4.2 | ✅ | — |
| Sortable table columns | §4.2 | ✅ | — |
| Expandable table rows | §4.2 | ❌ | Not implemented |
| Pagination 10/25/50 | TEST_STRATEGY §3.3 | ❌ | Hardcoded 10 |
| Individual vs Org badges | §4.2 | ✅ | — |
| Recharts donut + bar charts | §4.3 | ✅ | — |
| Taxonomy table sortable | TEST_STRATEGY §3.3 | ❌ | Not implemented |
| JSON download | §4.4 | ✅ | — |
| CSV download | §4.4 Bonus | ✅ | — |
| Live WebSocket progress bar | §4.4 | ❌ | Static bar only |
| Mapbox/Leaflet map | §4.4 Bonus | ❌ | Not implemented |
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
