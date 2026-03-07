# API Agent Guide

## Architecture

- Keep backend code feature-scoped under `src/modules/<feature>`.
- Preferred flow: controller -> service -> mapper/client.
- Shared infrastructure belongs under `src/common` only when it is reused across modules.

## Backend Rules

- DTO validation lives in `@npi/contracts` and is enforced by Nest validation pipes.
- Normalize upstream NPPES payloads through `providers.mapper.ts`; do not leak raw upstream fields.
- Respect the partition-aware collection behavior for state-only and oversized searches.
- Bulk collection progress should be emitted through the websocket gateway in `bulk-collection` rather than custom ad hoc channels.

## Testing

- Unit tests should mock external dependencies and exercise real service logic.
- No real network calls.
- When changing search or bulk behavior, update the module specs and e2e fixtures in `test/`.