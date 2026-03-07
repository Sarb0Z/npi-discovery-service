# Frontend Agent Guide

## Architecture

- App Router pages stay thin; domain behavior belongs in `components` and `lib`.
- Server state uses TanStack Query. Client UI state uses Zustand.
- Reuse `@npi/contracts` types directly for API payloads.

## Frontend Rules

- Search, results, and analytics components should handle loading, error, and empty states explicitly.
- Do not duplicate backend business logic in the UI.
- Prefer existing UI primitives in `components/ui` and preserve the current visual language.
- Bulk collection live status should subscribe to the backend websocket channel instead of simulating progress locally.

## Testing

- Mock API boundaries with MSW or module mocks.
- Cover sorting, pagination, expansion, and statistics rendering when touching search or analytics UI.