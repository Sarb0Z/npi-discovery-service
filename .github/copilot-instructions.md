# NPI Discovery Service Guidelines

## Project Overview

Healthcare provider discovery service built as a monorepo with NestJS API, Next.js frontend, and shared TypeScript contracts. Queries the CMS NPPES API with intelligent partition-based searching to handle broad queries within API limits.

## Context

This is a premium production codebase under active development. No legacy users,
no backward-compatibility constraints. The reviewers are unforgiving — they will
reject temporary hacks, placeholder types, MVP shortcuts, mock-data fallbacks,
and suppression comments on sight. Every feature must be polished, fully typed,
and production-finished. "Good enough" is a death sentence.

## Agent Behavior

1. **Investigate first.** Never speculate; read referenced files before
   proposing changes.
2. **Plan & research.** Before coding, outline the approach and check best
   practices for similar features.
3. **Smallest fix.** Prefer minimal changes that fully solve the request; avoid
   over-engineering.
4. **Persist until complete.** Continue working until the user's task is fully
  complete: iterate, test, and resolve follow-ups without stopping mid-task.
5. **Ask clarifying questions.** When requirements are unclear or follow-up is
  needed, use the ask-questions tooling to request focused clarifications and
  follow-up information so multiple issues can be resolved within the same
  session.
6. **UI quality bar.** Aim for Steve Jobs–level polish: UIs must be highly
  scannable, visually harmonious, and frictionless to use — prioritize
  clarity, typography, spacing, and micro-interactions.
7. **Backend craftsmanship.** Build backend code as if John Carmack would:
  prefer simple, fast, well-measured implementations with minimal abstraction
  layers, clear performance reasoning, and thorough correctness tests.
8. **Rigorous review expectation.** Assume Linus Torvalds will review the PR;
  the submission must be minimal, correct, well-justified, and able to withstand
  strict technical scrutiny.

## Delegation

Hand off cross-domain work immediately:

| Trigger                                  | Agent         |
| ---------------------------------------- | ------------- |
| Linear issue key or tracking request     | `@linear`     |
| Architecture / planning / spec breakdown | `@architect`  |
| Bug investigation / stack trace analysis | `@debugger`   |
| Research / docs / code discovery         | `@researcher` |

**Dense handoffs.** Summarize only essential context: decisions, affected paths,
and the single next step. No raw logs or full issue bodies.

**Linking discipline.** Link to Linear issues and docs instead of copying long
descriptions; include only the minimal snippet required for action.

## Post-Task Validation

**Verify** - Ensure basic validation passes (ESLint, Prettier, TypeScript)

If validation fails, read the error and fix immediately. For non-trivial
failures, dispatch `@debugger`.

**Clean Up:** Remove unused imports/variables, dead code, comments describing
removed behavior, `TODO` markers for code you wrote.

**Behavior Impact Review:** After any feature change, explicitly compare new
behavior to the prior system. Identify affected modules, then update **code
paths and docs** to remove/adjust impacted legacy behavior and update **all
relevant instruction files**, including shared/base docs for the domain.

## Tech Stack

- **Runtime**: Bun (package manager, test runner, monorepo orchestration)
- **Backend**: NestJS with class-validator, axios, Bull for async jobs
- **Frontend**: Next.js 16 (App Router), React 19, TanStack Query v5, Zustand
- **Shared**: TypeScript contracts with class-validator decorators
- **Infrastructure**: Docker Compose for local dev, Redis for caching, GitHub Actions CI/CD
- **UI**: Radix UI primitives, Tailwind CSS, shadcn patterns, Lucide icons, Framer Motion

## Build and Test

```bash
# Install dependencies (run from root)
bun install

# Development (Docker with watch mode)
bun run dev

# Run tests across all workspaces
bun run test

# Coverage tests
bun run test:cov

# Type checking
bun run typecheck

# Linting
bun run lint

# Format code
bun run format

# Build all workspaces
bun run build
```

Individual workspace commands:
```bash
# API workspace
bun --cwd apps/api test
bun --cwd apps/api dev

# Frontend workspace
bun --cwd apps/frontend test
bun --cwd apps/frontend dev

# Contracts package
bun --cwd packages/contracts test
```

## Architecture

### Monorepo Structure

```
apps/
  api/          - NestJS backend with feature modules
  frontend/     - Next.js 16 app router frontend
packages/
  contracts/    - Shared DTOs, interfaces, validators
```

### Backend Patterns

**Module Organization**: Feature-based modules with layered dependencies
- `NppesClientModule` → foundation HTTP client
- `ProvidersModule` → search logic, depends on NppesClient
- `BulkCollectionModule` → async exports, depends on Providers
- `StatisticsModule` → analytics, depends on Providers

**Data Flow**: Controller → Service → Collector → Client → External API

**Key Services**:
- `ProviderSearchCollectorService`: Handles partition-aware broad searches
- `BulkCollectionService`: Async background job processing
- `*Mapper`: Centralized response normalization (e.g., `providers.mapper.ts`)

**Error Handling**: `ApiExceptionFilter` normalizes all exceptions to `ApiErrorCode` enums

**Global Setup** (`main.ts`):
- `ValidationPipe` with `whitelist: true` and `transform: true`
- CORS enabled
- Swagger docs at `/api/docs`
- Custom exception filter

### Frontend Patterns

**Routing**: Next.js App Router with server/client split
- Server components for pages (`/search`, `/bulk`, `/statistics`)
- Client components for interactivity (`SearchExperience`, `BulkPageClient`)
- Layout with global providers (QueryClient, Theme, Toaster)

**State Management**:
- **Client state**: Zustand stores with persistence (search preferences, view mode)
- **Server state**: TanStack Query v5 (60s staleTime, no refetch on focus)
- Store location: `lib/stores/`

**Component Organization**:
- `components/[feature]/`: Domain-specific components
- `components/ui/`: Radix + shadcn primitives (button, card, input, etc.)
- `components/layout/`: Navbar and layout components

**API Integration**: `lib/api/` with custom error classes and toast notifications

### Shared Contracts

Location: `packages/contracts/src/`

**Purpose**: Type-safe contract between frontend and backend

**What's Shared**:
- DTOs with class-validator decorators (`SearchProvidersDto`, `BulkCollectionDto`)
- Interfaces (Provider, ApiError, SearchParams, etc.)
- Enums (`ProviderType`, `ApiErrorCode`)
- Constants (pagination limits, NPPES version)
- Custom validators (`@IsValidSearchCriteria`)

**Validation**: class-validator + class-transformer decorators
- Use `@IsString`, `@Matches`, `@IsInt`, `@Min`, `@Max` for fields
- `@Type(() => Number)` for automatic string→number coercion
- Custom validators for cross-field logic
- `@nestjs/swagger` decorators for API docs

## Testing Conventions

### Backend (NestJS + Jest)

- **Co-location**: `*.spec.ts` files next to implementation
- **Module testing**: `Test.createTestingModule()` with mocked dependencies
- **Fixtures**: Centralized in `test/fixtures/` (e.g., `nppes-response.fixture.ts`)
- **Service isolation**: Mock all dependencies with `jest.Mock`
- **Descriptive blocks**: `describe()` blocks with clear intent
- **E2E tests**: `test/app.e2e-spec.ts` for integration testing

### Frontend (Jest + MSW)

- **Setup**: `jest.setup.ts` initializes MSW server and polyfills
- **Mocks**: `__mocks__/handlers.ts` with MSW request handlers
- **Fixtures**: Response fixtures for search/statistics endpoints
- **Store reset**: Zustand stores cleared after each test
- **Environment**: jsdom with Undici fetch polyfills

### Contracts Package

- **Unit tests**: Validate DTOs with class-validator
- **Test file**: `test/search-providers.spec.ts` for validation logic

## Code Conventions

### TypeScript

- Strict mode enabled across all workspaces
- Path aliases: `@npi/contracts`, `@/components`, `@/lib`
- No implicit any
- Prefer interfaces for data shapes, types for unions/intersections

### Naming

- **Files**: kebab-case (`provider-search.service.ts`, `use-provider-search.ts`)
- **Classes/Interfaces**: PascalCase (`SearchProvidersDto`, `ApiErrorCode`)
- **Functions/Variables**: camelCase (`buildRootQueries`, `mapNppesProviders`)
- **React Hooks**: `use` prefix (`useProviderSearch`, `useSearchStore`)
- **Constants**: SCREAMING_SNAKE_CASE for enums, camelCase for const objects

### File Patterns

```
# Backend
*.service.ts          - Business logic
*.controller.ts       - Request handlers
*.module.ts          - NestJS module definition
*.dto.ts             - Data transfer objects
*.mapper.ts          - Response transformation
*.spec.ts            - Tests

# Frontend
use-*.ts             - React hooks
*-store.ts           - Zustand stores
page.tsx             - Next.js pages (server components)
*-client.tsx         - Client components
```

### Import Order

1. External packages (React, Next.js, etc.)
2. Workspace packages (`@npi/contracts`)
3. Absolute imports (`@/components`, `@/lib`)
4. Relative imports (`./`, `../`)

### Response Patterns

**Backend**: Always include metadata
```typescript
{
  data: T[],
  meta: {
    totalCount: number,
    page: number,
    limit: number,
    executionTime: number,
    // partition-specific fields...
  }
}
```

**Frontend**: Handle errors with toast notifications via `FrontendApiError`

### Validation

- Backend: Use class-validator decorators in DTOs
- Frontend: Zod schemas for form validation with React Hook Form
- Always validate at the entry point (controller/form)
- Share validation logic via `@npi/contracts` when possible

## Docker Development

Default development workflow uses Docker Compose:

```bash
# Start with watch mode
bun run dev

# Check service health
bun run dev:status

# View logs
bun run dev:logs
```

Services:
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Frontend: `http://localhost:3001`
- Redis: `redis://localhost:6379`

Source code mounted at `/workspace` with node_modules in Docker volumes.

## Environment Variables

Copy `.env.example` to `.env` before starting.

Key variables:
- `PORT` - Backend port (default: 3000)
- `API_URL` - Internal API URL for Next.js rewrites
- `NEXT_PUBLIC_API_URL` - Public browser API origin
- `PROVIDERS_OUTPUT_DIR` - Bulk export directory
- `REDIS_URL` - Redis connection string

## Common Patterns

### Adding a New Feature Module

1. Create module folder in `apps/api/src/modules/[feature]/`
2. Include: `*.module.ts`, `*.service.ts`, `*.controller.ts`, `*.dto.ts`
3. Add DTOs to `packages/contracts/src/dtos/`
4. Register in `AppModule`
5. Add Swagger decorators to controller
6. Write unit tests with fixtures

### Adding a New Frontend Page

1. Create route in `apps/frontend/app/[route]/`
2. Server component page.tsx with Suspense
3. Client component in `components/[feature]/`
4. React Query hook in `lib/hooks/`
5. Add to navbar in `components/layout/navbar.tsx`
6. MSW handlers for testing

### Shared Type Changes

1. Update interface/DTO in `packages/contracts/src/`
2. Run `bun --cwd packages/contracts build`
3. Verify types in both API and frontend
4. Update mappers if needed
5. Run full typecheck: `bun run typecheck`

## Pitfalls to Avoid

- **Don't query NPPES directly from frontend**: Always use the API
- **Don't skip validation**: Every public endpoint needs DTO validation
- **Don't hardcode limits**: Use constants from contracts package
- **Don't ignore partition overflow**: Check `meta.overflowCount` in responses
- **Don't bypass the mapper**: Always use `providers.mapper.ts` for NPPES responses
- **Don't create duplicate stores**: Check `lib/stores/` before adding Zustand stores

## Key Files

- [README.md](../README.md) - Infrastructure and deployment
- [apps/api/src/main.ts](../apps/api/src/main.ts) - Global backend setup
- [apps/frontend/app/layout.tsx](../apps/frontend/app/layout.tsx) - Frontend providers
- [packages/contracts/src/index.ts](../packages/contracts/src/index.ts) - Shared exports
- [docker/docker-compose.dev.yml](../docker/docker-compose.dev.yml) - Local dev stack
- [.env.example](../.env.example) - Environment contract

## CI/CD

GitHub Actions workflows:
- `.github/workflows/ci.yml` - Lint, typecheck, test, build
- `.github/workflows/deploy.yml` - Deploy to Render (API) and Vercel (frontend)

Deployment on `main` branch after CI passes.
