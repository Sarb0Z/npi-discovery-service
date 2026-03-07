# Contracts Agent Guide

## Ownership

- `packages/contracts` is the source of truth for shared DTOs, interfaces, constants, and validators.
- If a backend response or frontend request shape changes, update contracts first.

## Rules

- Keep types strict and additive where possible.
- Validation decorators belong on DTO classes, not frontend form schemas.
- Utility helpers in this package should stay framework-agnostic.

## Change Discipline

- Any contract change requires corresponding updates in API tests, frontend mocks/tests, and affected docs.
- Avoid introducing frontend-only or backend-only shadow types when a shared contract is appropriate.