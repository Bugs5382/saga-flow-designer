# AGENTS.md - saga-flow-designer

Guide for AI agents working in this repository. Pair with `CLAUDE.md` (the working agreement and
hook-enforced rules). Keep this file current when the build, layout, or public API changes.

## What this is

`@bugs5382/saga-flow-designer` is a public React library: components and utilities for visualising
and editing saga-orchestration workflows and runs. It ships as ESM + CommonJS with types, built with
`tsup`. It is **engine-agnostic** — it never talks to a backend directly; a host implements one
`WorkflowGateway` and injects it. Two things to understand before changing it:

1. The **`WorkflowGateway` seam** (`src/workflowGateway.ts`) is the entire integration contract.
   Components take a gateway + callbacks as props and own no routing, shell, or transport.
2. The **flatten/expand mapper** (`src/workflowMapper.ts`) converts between an engine-flat DAG
   (`branches` as a `{case -> {next}}` map, convergent merges) and the UI-nested stage/branch tree.
   It round-trips real engine definitions; keep the round-trip tests in `tests/` green.

## Using saga-flow-designer

Consumers implement `WorkflowGateway` and mount the components. Respect these:

- The public surface is what `src/index.ts` re-exports. Do not export internals (`src/components/primitives/`, `src/components/internal/`).
- `react`, `react-dom`, and `@xyflow/react` are **peer** dependencies — never bundle them.
- Colours resolve to `--sfd-*` CSS variables; the package ships defaults via `theme.css` + a Tailwind
  preset (`./tailwind-preset`). Do not hardcode brand colours or introduce a dependency on any host
  design system.
- `createMockGateway()` is for demos/tests only — never a real backend.

See `docs/USING_WITH_GO_SAGA.md` and `docs/INTEGRATION.md` for worked integrations, and
`examples/httpGateway.ts` for a runnable real-engine adapter.

## Layout

- `src/` - library source; `src/index.ts` is the public API barrel.
- `src/components/` - React components; `primitives/` (hand-rolled UI) and `internal/` are NOT public.
- `src/mock/` - `createMockGateway()` + example data (public).
- `src/styles/theme.css` - default `--sfd-*` token values.
- `tests/` - `vitest` unit tests + fixtures.
- `stories/` - Storybook stories (`*.stories.tsx`) + MDX guides (`*.mdx`).
- `examples/` - standalone Vite demo (mock, or a real go-saga engine via `VITE_GS_BASE`).
- `tailwind.preset.ts` - the shipped Tailwind preset (colour names -> CSS variables).

## Build, test, lint

- Build: `npm run build` (tsup -> `dist/`; ships `index`, `tailwind.preset`, `theme.css`)
- Test: `npm test` (vitest; the mapper round-trips fixtures under `tests/`)
- Typecheck: `npm run typecheck` (tsc over `src`, `tests`, `stories`)
- Lint: `npm run lint` (eslint, `@the-rabbit-hole/eslint-config`)
- Storybook: `npm run storybook` / `npm run build-storybook`
- Demo: `npm run demo` (add `VITE_GS_BASE=/gs` for a real go-saga backend)
- License headers: `task license` (verify) / `task license:fix` (apply) — golic

## Conventions and gotchas

- See `CLAUDE.md` for branch/commit/PR rules; they are enforced by the git hooks in `.claude/hooks`
  (run `bash .claude/hooks/install.sh` once per clone). PUBLIC repo: no company/internal identifiers
  anywhere; emoji only in Markdown/MDX.
- Components author in Tailwind utilities; the library ships no compiled component CSS — a consumer
  needs Tailwind + the preset. The verb-catalog `icon:` glyphs in `src/components/workflowData.ts`
  are functional palette data (the one place emoji live in source).
- Tests and stories live outside `src/` (in `tests/`/`stories/`) but are typechecked via
  `tsconfig.json`'s `include`.
