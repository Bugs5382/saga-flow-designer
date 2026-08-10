# 🕸️ @bugs5382/saga-flow-designer

> React components and utilities for visualising and editing saga-orchestration
> **workflows** and **runs**.

An embeddable **Flow Designer**, run views, and the framework-agnostic logic
that powers them — built on [`@xyflow/react`](https://reactflow.dev/) and shipped
as ESM + CommonJS with first-class TypeScript types. The package is
**engine-agnostic**: it makes no assumption about how your data is fetched or how
your app is shelled. You implement one gateway; it renders the rest.

## ✨ Features

- 🧩 **Components** — `FlowDesigner` (canvas, verb palette, node-config, condition
  builder), `RunsList`, `RunDetail` (live run streaming), `WorkflowList`, plus the
  composable pieces. All props-driven — you inject a gateway and callbacks.
- 🔌 **`WorkflowGateway` seam** — the single interface a host implements to
  connect the UI to a backend (definitions, runs, live subscribe, validate).
- 🧱 **Domain model** — a strongly-typed `WorkflowDefinition` (stages, steps,
  branches, lanes, triggers) plus the run / execution-history model.
- 🔀 **Flatten / expand mapper** — `flattenDefinition` / `expandDefinition`
  convert losslessly between an engine-flat DAG and the UI-nested tree.
- 📡 **Live run stream** — `seedRun` / `foldFrame` accumulate streamed run frames
  into a `Run`, with engine-to-UI enum mappers.
- 🧪 **`createMockGateway()`** — a fully in-memory gateway with example data, so
  you can run the designer with **no backend** (it drives the Storybook + demo).
- 🎨 **Swappable theming** — every colour resolves to a `--sfd-*` CSS variable
  with the package's own default; a host rebrands by overriding the variables.
- ✅ **Structural validation** — `validateWorkflow` with typed issues.

The domain model, mapper, run-stream fold, and validation are **pure TypeScript**
(no React) — usable in a browser, a worker, or on a server.

## 📦 Install

```sh
npm install @bugs5382/saga-flow-designer
```

`react`, `react-dom`, and `@xyflow/react` are peer dependencies:

```sh
npm install react react-dom @xyflow/react
```

## 🚀 Quick start

```tsx
import { FlowDesigner, createMockGateway } from "@bugs5382/saga-flow-designer";
import "@bugs5382/saga-flow-designer/theme.css";
import "@xyflow/react/dist/style.css";

const gateway = createMockGateway();

export const Designer = () => (
  <FlowDesigner gateway={gateway} definitionId="order.fulfillment" />
);
```

The components use Tailwind utilities and the shipped token defaults — add the
Tailwind preset and scan the package in your `content` (see **Theming** below).

## 🔌 Connecting a backend

Implement `WorkflowGateway` against your API and inject it — that is the only
integration point:

```ts
const gateway: WorkflowGateway = {
  listWorkflows, getWorkflow, saveWorkflow, /* … */ subscribeRun, validateWorkflow,
};
```

- **[INTEGRATION.md](./INTEGRATION.md)** — mount the components inside your own
  app shell + router (the package provides no shell).
- **[USING_WITH_GO_SAGA.md](./USING_WITH_GO_SAGA.md)** — run a real
  [go-saga](https://github.com/Bugs5382/go-saga-orchestration) engine standalone
  and adapt it, with the runnable example in [`demo/httpGateway.ts`](./demo/httpGateway.ts).
- Storybook **Guides → Gateway Contract** — the interface, live.

## 🎨 Theming

The package ships its **own** palette as `--sfd-*` CSS variables — independent of
any brand. Import the defaults and add the Tailwind preset:

```ts
import "@bugs5382/saga-flow-designer/theme.css";
```

```js
// tailwind.config.js
module.exports = {
  presets: [require("@bugs5382/saga-flow-designer/tailwind-preset")],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@bugs5382/saga-flow-designer/dist/**/*.{js,cjs}",
  ],
};
```

To rebrand, override any `--sfd-*` variables in your own CSS — no dependency on
the package's design system. The Storybook **Guides → Theming** page has a live
brand-swap.

## 🛠 Development

```sh
npm install
npm run typecheck        # tsc --noEmit
npm run lint             # eslint (@the-rabbit-hole/eslint-config)
npm test                 # vitest run (tests in tests/)
npm run build            # tsup -> dist/
npm run docs             # typedoc -> docs/api
npm run storybook        # component gallery + guides
npm run demo             # standalone FlowDesigner (mock; or VITE_GS_BASE for go-saga)
```

Source lives in `src/`, tests in `tests/`, Storybook stories + MDX guides in
`stories/`, and the standalone demo in `demo/`. License headers are managed with
[golic](https://github.com/Bugs5382/golic) via [go-task](https://taskfile.dev):
`task license` verifies, `task license:fix` applies.

## 📖 Docs

- **Storybook** — component gallery, autodocs (props tables), and the guides
  (Introduction, Getting Started, Gateway Contract, Theming): `npm run storybook`.
- **API reference** — generated from the source doc-comments with
  [TypeDoc](https://typedoc.org): `npm run docs`.

## 📄 License

[Apache-2.0](./LICENSE)
