---
sidebar_position: 1
title: Introduction
---

# 🕸️ saga-flow-designer

> React components and utilities for **visualising and editing
> saga-orchestration workflows and runs**.

`saga-flow-designer` renders and authors saga workflows on top of
[`@xyflow/react`](https://reactflow.dev/). It ships as ESM and CommonJS with
first-class TypeScript types.

## ✨ What's in the box

At its heart is a **dependency-free logic core** — pure TypeScript, no React,
no transport — so it runs in a browser, a worker, or on a server:

- 🧱 **Domain model** — a strongly-typed `WorkflowDefinition` (stages, steps,
  branches, lanes, triggers) plus the run / execution-history model
  (`Run`, `RunEvent`, `StepRun`).
- 📚 **Verb catalog** — the built-in verb specs (`VERB_CATALOG`,
  `VERB_BY_NAME`) with palette metadata and per-verb config fields.
- 🔀 **Flatten / expand mapper** — `flattenDefinition` / `expandDefinition`
  convert losslessly between the engine-flat DAG and the UI-nested tree.
- 🔌 **Gateway seam** — a `WorkflowGateway` port so the same UI runs against any
  adapter, in-process or remote.
- 🫧 **Pill scope + placement** — `pillsInScopeFor`, `referencedPills`, and
  verb-legality helpers for positional reference scoping.
- 📡 **Live run stream** — `foldFrames` accumulates streamed run frames into a
  `Run`, with engine-to-UI enum mappers.
- ✅ **Structural validation** — in-process workflow validation with typed
  issues.

## 👥 The two faces

The package has two faces, and they land incrementally:

1. **The library** (available today) — the logic core above, imported into a
   host application. This is the reusable, engine-agnostic substrate the rest of
   the documentation covers.
2. **The standalone demo** (upcoming) — a self-contained designer app that wires
   the React canvas components to an in-process gateway, so you can try the
   designer without a host. It builds on the same core.

This documentation is written **as the library develops**: it covers the logic
core that exists today. Later slices add their own pages.

## 📦 Install

```sh
npm install @bugs5382/saga-flow-designer
```

`react`, `react-dom`, and `@xyflow/react` are **peer dependencies** and must be
present in the host application:

```sh
npm install react react-dom @xyflow/react
```

## 🚀 A first taste

```ts
import {
  VERB_CATALOG,
  expandDefinition,
  flattenDefinition,
  type WorkflowDefinition,
} from "@bugs5382/saga-flow-designer";

// Expand an engine-flat definition into the UI-nested tree, edit it, then
// flatten it back for the engine — the round-trip is lossless.
const ui: WorkflowDefinition = expandDefinition(engineDefinition);
const flat = flattenDefinition(ui);

// The verb catalog drives the palette.
console.log(VERB_CATALOG.map((verb) => verb.name));
```

## 🧭 Where to next

- **[The gateway seam](./gateway.md)** — the one port a host implements to feed
  the designer definitions and runs. Start here if you are integrating the
  library.
- **[The data model](./model.md)** — the definition and run shapes, and the
  flat-DAG ↔ nested-tree mapper, at a conceptual level.
- **[API reference](./api/index.md)** — the generated reference for every
  exported symbol, with its "Since" version.
