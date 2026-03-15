---
applyTo: "apps/api/**/*"
---

# API Instructions

## Architecture

- Keep backend code feature-scoped under `src/modules/<feature>`.
- Preferred flow is controller -> service -> collector/client -> mapper.
- Shared infrastructure belongs under `src/common` only when reused across modules.
- Register new feature modules in `AppModule` and expose public endpoints with Swagger decorators.

## Backend Rules

- Validation lives in shared DTOs from `@npi/contracts` and is enforced by Nest validation pipes.
- Normalize upstream NPPES payloads through the module mappers, especially `providers.mapper.ts`.
- Respect partition-aware search and overflow behavior for broad or state-only queries.
- Bulk collection progress should flow through the existing websocket gateway in `bulk-collection`, not ad hoc channels.
- API responses should keep the established `{ data, meta }` structure with complete metadata.
- Global behavior assumes the setup in `src/main.ts`: transformed and whitelisted validation, CORS, Swagger, and the shared exception filter.

## Testing

- Co-locate `*.spec.ts` files with implementation where that pattern already exists.
- Mock external dependencies; do not make real network calls.
- Use fixtures from `test/fixtures` for NPPES and integration-style coverage.
- When changing search or bulk behavior, update both module specs and relevant e2e coverage in `test/`.

## Common Change Patterns

- New feature modules should include module, service, controller, and any required DTO or mapper files.
- If an endpoint contract changes, update `packages/contracts` first, then API tests, frontend consumers, and docs.
- Prefer `bun --cwd apps/api test` for targeted backend validation.