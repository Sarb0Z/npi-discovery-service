---
applyTo: "README.md,docs/**/*,docker/**/*,infra/**/*,scripts/**/*,.github/workflows/**/*,package.json,tsconfig.base.json,.env.example"
---

# Repository Meta Instructions

## Project Context

- This repository is a Bun-managed monorepo for healthcare provider discovery.
- Main workspaces are `apps/api`, `apps/frontend`, and `packages/contracts`.
- Local development is centered on Docker Compose with API, frontend, and Redis services.

## Tooling And Validation

- Root commands include `bun run lint`, `bun run typecheck`, `bun run test`, `bun run build`, and `bun run format`.
- Use workspace-specific Bun commands when validating a focused change.
- Keep CI assumptions aligned with `.github/workflows/ci.yml` and deployment assumptions aligned with `.github/workflows/deploy.yml`.

## Documentation And Infra Rules

- Keep docs aligned with actual behavior, ports, environment variables, and deployment flow.
- Update `.env.example` whenever required environment variables change.
- Preserve the existing Docker and Terraform structure unless the task requires broader infrastructure changes.
- When documenting frontend behavior, note that browser clients talk to the API layer, not directly to NPPES.