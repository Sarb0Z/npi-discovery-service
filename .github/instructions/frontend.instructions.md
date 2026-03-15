---
applyTo: "apps/frontend/**/*"
---

# Frontend Instructions

## Architecture

- Use Next.js App Router patterns already established in this repo.
- Keep pages thin; place domain behavior in `components` and `lib`.
- Server state uses TanStack Query and client UI state uses Zustand.
- Reuse `@npi/contracts` types directly for API payloads rather than introducing shadow types.

## Frontend Rules

- Do not duplicate backend business logic in the UI.
- API access belongs in `lib/api`; keep error handling aligned with the existing frontend API error flow and toast behavior.
- Search, results, bulk, and statistics experiences must handle loading, error, and empty states explicitly.
- Prefer existing primitives in `components/ui` and preserve the current visual language unless the task explicitly changes the design system.
- Bulk collection live status should subscribe to the backend websocket channel rather than simulating progress locally.
- Check `lib/stores/` before adding a new Zustand store to avoid duplicate state containers.

## Frontend Patterns

- App routes live under `app/`.
- Domain-specific UI belongs under `components/<feature>/`.
- Hooks belong under `lib/hooks/` and stores under `lib/stores/`.
- New pages should usually pair a server `page.tsx` with a client component when interactivity is required.

## Testing

- Mock API boundaries with MSW or module mocks.
- Reset stores and preserve the existing test setup patterns in `jest.setup.ts` and `__mocks__/`.
- When touching search or analytics UI, cover sorting, pagination, expansion, filters, and rendering states that the changed component affects.
- Prefer `bun --cwd apps/frontend test` for targeted frontend validation.