---
applyTo: "packages/contracts/**/*"
---

# Contracts Instructions

## Ownership

- `packages/contracts` is the source of truth for shared DTOs, interfaces, constants, and validators.
- Backend request validation and shared API payload types belong here before local API or frontend adaptations.

## Rules

- Keep types strict and framework-agnostic where possible.
- Prefer interfaces for shared data shapes and type aliases for unions or intersections.
- Validation decorators belong on DTO classes in this package, not in frontend form schemas.
- Use `class-transformer` and `class-validator` patterns already established in the package for coercion and validation.

## Change Discipline

- Any contract change requires corresponding updates in API tests, frontend mocks/tests, and affected docs.
- Avoid frontend-only or backend-only shadow types when a shared contract is appropriate.
- Preserve the package export surface through `src/index.ts` and related barrel files.
- Prefer `bun --cwd packages/contracts test` and broader type validation when changing shared contracts.