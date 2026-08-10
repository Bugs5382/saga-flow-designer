# 🕸️ @bugs5382/saga-flow-designer

> Utilities and (soon) React components for visualising and editing
> saga-orchestration **workflows** and **runs**.

Built to render and author saga workflows on top of
[`@xyflow/react`](https://reactflow.dev/), shipped as ESM and CommonJS with
first-class TypeScript types.

## ✨ Features

- 🧱 **Domain model** — a strongly-typed `WorkflowDefinition` (stages, steps,
  branches, lanes, triggers) plus the run / execution-history model.
- 📚 **Verb catalog** — the built-in verb specs (`VERB_CATALOG`, `VERB_BY_NAME`)
  with palette metadata and per-verb config fields.
- 🔀 **Flatten / expand mapper** — `flattenDefinition` / `expandDefinition`
  convert losslessly between the engine-flat DAG and the UI-nested tree.
- 🔌 **Gateway seam** — a `WorkflowGateway` port so the same UI runs against any
  adapter (in-process or remote).
- 🫧 **Pill scope + placement** — `pillsInScopeFor`, `referencedPills`, and
  verb-legality helpers for positional reference scoping.
- 📡 **Live run stream** — `foldFrames` accumulates streamed run frames into a
  run, with engine-to-UI enum mappers.
- ✅ **Structural validation** — in-process workflow validation with typed
  issues.

Everything above is **pure TypeScript** — no React, no transport — so it is
usable in a browser, a worker, or on a server. The React canvas components build
on this core and land incrementally.

## 📦 Install

```sh
npm install @bugs5382/saga-flow-designer
```

`react`, `react-dom`, and `@xyflow/react` are peer dependencies and must be
present in the host application:

```sh
npm install react react-dom @xyflow/react
```

## 🚀 Usage

```ts
import {
  VERB_CATALOG,
  expandDefinition,
  flattenDefinition,
  type WorkflowDefinition,
} from "@bugs5382/saga-flow-designer";

// Expand an engine-flat definition into the UI-nested tree, edit it, then
// flatten it back for the engine — the round-trip is lossless.
const ui = expandDefinition(engineDefinition);
const flat = flattenDefinition(ui);

// The verb catalog drives the palette.
console.log(VERB_CATALOG.map((verb) => verb.name));
```

## 🛠 Development

```sh
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (@the-rabbit-hole/eslint-config)
npm test            # vitest run
npm run build       # tsup -> dist/
npm run docs        # typedoc -> docs/api
```

License headers are managed with [golic](https://github.com/Bugs5382/golic) via
[go-task](https://taskfile.dev): `task license` verifies them, `task
license:fix` applies them.

## 📖 API docs

API reference is generated from the source doc-comments with
[TypeDoc](https://typedoc.org):

```sh
npm run docs
```

## 📄 License

[Apache-2.0](./LICENSE)
