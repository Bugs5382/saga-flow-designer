# CLAUDE.md - saga-flow-designer

Working agreement for this repository. `saga-flow-designer` is a
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

## CI and Actions minutes

GitHub bills every job for at least one full minute, and a private org's included minutes run out
fast during a wave of PRs. The shipped workflows are shaped around that:

- **Drafts run nothing.** PR workflows skip draft PRs and run on `ready_for_review`, `opened`,
  `synchronize` and `reopened`. Open a PR as a draft, run the full checks locally, push once they
  pass, and mark it ready when the work is finished. That starts one CI run. After it is ready,
  push only real fixes, batched into one push.
- **One job for the small checks.** PR Title, PR Body, PR Hygiene and the gitleaks secret scan are
  steps of one `✅ PR Checks` job (`job-pr-checks.yaml`). Every step runs even when an earlier one
  fails, so the log shows every failure. This job and the label checker are the only workflows
  that react to `edited`: a title or body fix reruns them, not the build.
- **Pull requests only.** Node CI, Storybook Build, Docs Build, GoLic, YamlLint and the npm
  licence check run on pull requests, not on push to `main`. The squash merge lands the tree the
  PR run already tested. Only the release workflows run on `main`: Release Manager
  (`job-version-bump.yaml`) and Release Drafter on push, and Release and Publish
  (`action-deploy.yaml`) and Docs Publish (`docs-publish.yaml`) when a release is published.
- **Keep the PR run honest:** the PR run covers the merged code only when the branch is up to date
  with `main` before it merges. In the branch ruleset, add **Require status checks to pass** with
  the repo's check names and turn on **Require branches to be up to date before merging** (API:
  the `required_status_checks` rule with `strict_required_status_checks_policy: true`; classic
  branch protection: `required_status_checks.strict: true`). The setting only exists alongside
  required checks. Use GitHub's "Update branch" when a PR falls behind.
- **No no-op jobs.** The licence check is npm only (`job-license-check-npm.yaml`); the repo has
  no root `go.mod`, so there is no Go licence job.
- **Every job has a `timeout-minutes`** (10 for small checks, 15 to 30 for builds, scans and
  releases), so a hung job stops long before GitHub's 360-minute default. Jobs that call a reusable
  workflow (`uses:`) cannot take one; the called workflow's jobs carry it.
- **Required checks:** if the ruleset or branch protection lists required checks, use the job
  names: `✅ PR Checks` replaces `PR Title`, `PR Body`, `PR Hygiene` and `Gitleaks (secret scan)`.

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
