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