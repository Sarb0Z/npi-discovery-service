# NPI Discovery Service Agent Guide

## Scope

- Monorepo root conventions for `apps/api`, `apps/frontend`, and `packages/contracts`.
- Follow the shared contract-first model: API and frontend changes should flow through `@npi/contracts` before local implementation.

## Workflow

- Read the relevant module files before editing.
- Prefer the smallest complete change that satisfies the acceptance criteria.
- Preserve strict TypeScript and existing import ordering.
- Run targeted tests for touched areas, then broader type validation if contracts changed.

## Cross-Cutting Rules

- Do not call NPPES directly from the frontend.
- Keep response mapping centralized in the API mappers.
- Document any behavior change that affects the deep-pagination mitigation, bulk collection semantics, or search UX.
- Update tests when changing DTOs, response interfaces, or shared utility behavior.

## Repo Map

- `apps/api`: NestJS API, feature modules under `src/modules`.
- `apps/frontend`: Next.js app router UI, domain components under `components`.
- `packages/contracts`: shared DTOs, interfaces, constants, validators, and utility helpers.