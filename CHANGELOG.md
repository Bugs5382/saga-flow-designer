# Saga Flow Designer

## v1.0.0 - 2026-08-12

First stable release. 🎉

- 🧩 **Components** — `FlowDesigner` (canvas, verb palette, node-config,
  condition builder), `RunsList`, `RunDetail` (live run streaming),
  `WorkflowList`, and the composable pieces beneath them. All props-driven —
  a host injects a gateway and callbacks.
- 🔌 **`WorkflowGateway` seam** — the single interface a host implements to
  connect the UI to a backend (definitions, runs, live subscribe, validate).
- 🧱 **Domain model** — a strongly-typed `WorkflowDefinition` (stages, steps,
  branches, lanes, triggers) plus the run / execution-history model.
- 🔀 **Flatten / expand mapper** — `flattenDefinition` / `expandDefinition`
  convert losslessly between an engine-flat DAG and the UI-nested tree.
- 📡 **Live run stream** — `seedRun` / `foldFrame` accumulate streamed run
  frames into a `Run`, with engine-to-UI enum mappers.
- ✅ **Structural validation** — `validateWorkflow` with typed issues.
- 🧪 **`createMockGateway()`** — a fully in-memory gateway with example data,
  so the designer runs with no backend (drives Storybook and the demo).
- 🎨 **Swappable theming** — every colour resolves to a `--sfd-*` CSS
  variable with the package's own default; a host rebrands by overriding the
  variables.

The domain model, mapper, run-stream fold, and validation are pure
TypeScript (no React) — usable in a browser, a worker, or on a server.

Also included: a revamped documentation site (a go-saga-style landing page,
versioned docs, and a published shared theme in place of a vendored copy).
