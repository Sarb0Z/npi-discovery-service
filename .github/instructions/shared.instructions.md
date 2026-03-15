---
applyTo: "apps/api/**/*,apps/frontend/**/*,packages/contracts/**/*"
---

# Shared Monorepo Guidance

- This is a production monorepo with no legacy-user compatibility requirement; ship polished, finished changes.
- Follow the shared contract-first model: when request or response shapes change, update `@npi/contracts` first and then the API and frontend consumers.
- Do not call NPPES directly from the frontend.
- Keep response normalization centralized in the API mappers; do not leak raw upstream payload shapes into the UI.
- Avoid hardcoded limits when a shared constant already exists in `packages/contracts`.
- When behavior changes affect search UX, bulk collection semantics, or deep-pagination mitigation, update the affected code paths, tests, and docs together.

# Validation Expectations

- Prefer targeted validation first.
- If contracts change, verify both API and frontend consumers.
- Remove dead code, unused imports, stale comments, and TODOs introduced by your change.