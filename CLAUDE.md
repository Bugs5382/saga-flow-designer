# CLAUDE.md - saga-flow-designer

Working agreement for this repository. `@bugs5382/saga-flow-designer` is a
public TypeScript React library: components and utilities for visualising and
editing saga-orchestration workflows and runs. It is built with `tsup` and
tested with `vitest`, and it ships to npm as ESM + CommonJS with types.

## Public package - hygiene rule

This repository is published to the public npm registry and hosted publicly.
No private, company, or internal identifiers may appear anywhere - not in code,
comments, docs, config, file headers, or commit messages. The governance hooks
(see `.claude/hooks/forbidden-text.txt`, "Private-context leak guards") block
the known ones; keep new content clean regardless.

## Enforced by hooks (run `bash .claude/hooks/install.sh` once per clone)

- Conventional Commits on commits, issue titles, and PR titles.
- No AI tells in commits/issues/PRs/comments/source; no emoji in source or
  commit messages (emoji are allowed in Markdown docs and CI workflow files).
- Pre-push: the npm `lint` and `test` scripts must pass before anything is
  pushed (once `node_modules` is installed).

## Conventions

- Branching: never commit to `main`. Work on a feature/working branch; open a PR.
- Commits: Conventional Commits (`type(scope): description`). The operator
  (@Bugs5382) is the author of record on every commit.
- Voice: human-authored. No attribution trailers, no robot glyphs/emoji, no
  session framing.
- Local design notes live in a non-tracked `plan/` folder (gitignored); delete a
  note when its work is done.

## Layout

- `src/index.ts` - package entry / public API surface.
- `src/**/*.test.ts` - `vitest` unit tests.
- `dist/` - build output (gitignored); the only thing shipped to npm (`files`).
- `tsup.config.ts` - build config (ESM + CJS, dts, `react`/`react-dom`/
  `@xyflow/react` are external peers, never bundled).
- `eslint.config.js` - flat config on `typescript-eslint` recommended.

## Scripts

- `npm run build` - bundle to `dist/` with tsup.
- `npm run dev` - tsup in watch mode.
- `npm run typecheck` - `tsc --noEmit`.
- `npm test` - `vitest run`.
- `npm run lint` - eslint.

## Workflow

Issue (from a template; free-form issues are disabled) -> branch
`<type>/<issue#>-<slug>` -> code (comments cite the issue) -> PR with a
Conventional Commit title (the autolabeler sets the category label from the
title), the template body, and a closing summary before merge -> squash merge.
The operator (@Bugs5382) is the assignee.

Nothing tags or publishes automatically. The maintainer publishes a GitHub
Release by hand, which creates the `vX.Y.Z` tag and triggers the npm publish for
that version.

Keep public artifacts (issues, PRs, commit messages) free of references to
local-only design notes.
