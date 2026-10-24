# 1. AI Studio Migration, Environment Normalization, and SSR Hydration Fix

Date: 2026-10-15
Status: Accepted

## Context

Dreadveil Adventures was imported from a GitHub repository configured with Bun (`bun.lock`, `bunfig.toml`) and Vite TanStack Start running React 19. Upon migration to Google AI Studio:

1. AI Studio uses a standard Node.js 22 runtime with npm and restricts network access exclusively to port 3000 on host 0.0.0.0.
2. In the AI Studio preview environment, iframe wrappers and browser extensions inject attributes into root elements before React 19 hydrates. Additionally, browser CSSOM engines reformat inline style strings (such as `url(...)` quotes and percentage coordinates), causing React 19 hydration mismatch errors.
3. TypeScript type errors in `src/game/combat-rules.test.ts` blocked `tsc --noEmit` due to a missing re-export of `CharacterId` and an overly restrictive `number[]` type on `Action` payloads that rejected `readonly [6, 6, 6]`.

## Decision

1. **Package Manager Normalization**: Removed `bun.lock` and `bunfig.toml`. Standardized all scripts on npm and set the dev script to `vite dev --host 0.0.0.0 --port 3000`.
2. **SSR Hydration Strategy**: Added `suppressHydrationWarning` on `<html>`, `<body>`, and `<main>` in `src/routes/__root.tsx`, and on elements with dynamic inline styles (`species-art`, `entry-portrait`, `player-portrait`, `health-fill`). Corrected bare `aria-hidden` attributes to `aria-hidden="true"`.
3. **Engine Type Generalization**: Re-exported `CharacterId` and `Character` from `src/game/engine.ts` and updated `Action` to accept `readonly number[]`.
4. **Project Continuity**: Established the `ProjectState/` directory structure with `implementation_checkpoint`, `project_context.md`, and `AI_handoff.md` to guarantee autonomous continuity across AI agent sessions.

## Consequences

- The application boots cleanly in AI Studio on port 3000 without SSR hydration warnings.
- The TypeScript compiler passes with 0 errors across both production code and test suites.
- Deterministic game rules and architecture remain completely untouched and preserved.
