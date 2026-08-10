---
sidebar_position: 3
title: Data model
---

# 🧱 The data model

There are two domain shapes: the **definition** (what an author builds) and the
**run** (one concrete execution of a definition). Both are pure data — plain
TypeScript objects — and both are read through the same
[gateway seam](./gateway.md).

## 📐 The workflow definition

A `WorkflowDefinition` is the **authored** shape. It carries identity and
lifecycle metadata plus an ordered list of **stages**.

```ts
interface WorkflowDefinition {
  id: string;
  key: string;
  label: string;
  description?: string;
  version: number;
  status: "draft" | "published" | "archived";
  enabled?: boolean;
  trigger: Trigger;
  stages: Stage[];
  system?: boolean; // system flows can be modified/restored but never deleted
  systemSource?: string;
}
```

### 🎬 Stages

A workflow is an ordered list of stages, of three kinds:

- **`pre-stage`** — exactly one, always at the top; holds the trigger and
  accepts only data-shaping steps (set a variable, transform, merge, filter,
  map).
- **`stage`** — the numbered/named work stages, `1..N`.
- **`end-stage`** — exactly one, always at the bottom; holds the End terminal
  and any trailing nodes.

Each stage holds an ordered `steps` sequence.

### 🔧 Steps, branches, and lanes

A `Step` is a single node. Its `type` is a `VerbName` (from the verb catalog),
and its `config` is a per-verb bag of inputs.

```ts
interface Step {
  id: string;
  type: VerbName;
  label: string;
  config: Record<string, string>;
  branches?: Branch[]; // decision / switch / human-gate outcome lanes
  children?: Branch[]; // parallel / foreach / while / map / try_catch lanes
  note?: string;
  collapsed?: boolean;
}
```

A `Branch` is a **lane** — its own ordered `steps` sequence. Two families of
verb hold lanes:

- **Branching verbs** (`decision`, `switch`, and the human gates) keep their
  outcome lanes under `branches`.
- **Fan-out / loop verbs** (`parallel`, `foreach`, `while`, `map`, `try_catch`)
  keep their child lanes under `children`.

#### Termination and merge

The control-flow model is **explicit**: every lane defaults to **End**
(terminal) — there is no implicit fall-through or auto-rejoin. Rejoining the
main flow is always a deliberate choice, expressed as a `MergeTarget` on the
lane that names an **entry point** (an `entry` verb's step id) and supplies the
data contract that entry declares.

Loops are the exception: a `foreach` / `while` body lane and a `try_catch` TRY
lane default to **loop back** (continue) rather than end; a `try_catch` CATCH
lane is **always** terminal. The core exposes `laneSemantics`,
`laneIsTerminal`, and `laneRoleFor` so the canvas and the validator agree on how
any given lane behaves.

### 🫧 Pills and positional scope

A **pill** is a reference token an author drops into an expression or value
field: a record field (`record.<field>`), a trigger input (`trigger.<x>`), or a
variable produced by an upstream node (`vars.<name>` / an item binding). Scope
is **positional** — a node only sees pills produced at or above it on its trail.
`pillsInScopeFor` computes the in-scope set for any node, `stepOutputPills`
reports what a node produces, and `referencedPills` extracts what a node's
config refers to — which is how the validator catches an out-of-scope
reference.

## 🏃 The run model

Where a definition is the authored shape, a `Run` is **one concrete execution**
of it: a single resolved path through the branches.

```ts
interface Run {
  id: string;
  workflowId: string; // FK -> WorkflowDefinition.id
  workflowKey: string; // denormalised for display
  status: "running" | "paused" | "succeeded" | "failed" | "cancelled";
  trigger: "manual" | "event" | "cron" | "record" | "replay";
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  path: string[]; // ordered ids of the steps that actually executed
  stepRuns: StepRun[]; // per-step execution, incl. skipped steps
  events: RunEvent[]; // the audit trail
}
```

- **`path`** is the taken trail — the ordered ids of the steps that actually
  executed. Skipped steps are **not** on the path; they appear in `stepRuns`
  with a `skipped` status.
- **`StepRun`** is one executed (or skipped) step. Its `stepId` ties back to the
  definition's `Step.id`, so a canvas overlay can colour the matching card by
  status (`waiting`, `running`, `succeeded`, `failed`, `skipped`).
- **`RunEvent`** is an audit-log entry — who did what, when — emitted for every
  state transition (started, step completed, human decision, error, and so on).

### 📡 Folding a live stream

A live run arrives as a sequence of frames: a snapshot frame, then event frames.
The core folds them for you. `seedRun(runId)` produces an empty `Run`;
`foldFrame(run, frame)` returns a **new immutable** `Run` with that frame
applied — run frames set status and linkage; event frames append a `RunEvent`,
upsert the matching `StepRun`, extend the taken path, advance the run-level
status, and stamp `finishedAt` / `durationMs` on terminal events.
`foldFrames(run, frames)` folds a batch left-to-right. Engine-to-UI enum mappers
(`mapRunState`, `mapEventKind`, `mapStepStatus`) translate the engine's
vocabulary into the UI's.

## 🔀 The flatten / expand mapper

This is the conceptual crux. The engine and the designer represent a workflow
differently, and the mapper translates losslessly between them.

### Two representations

**Engine-flat** — a flat step list forming a DAG:

- A non-branching step chains to its single successor via a `next` pointer (a
  step id).
- A branching step carries a `branches` **map** from a case label to a pointer
  at the first step of that lane; it has no `next` — all outflow travels through
  the branch map.
- Terminal steps have no `next`.
- The graph **converges**: several paths may point at the same downstream step
  (in-degree ≥ 2). Each such convergence step appears exactly once.

**UI-nested** — the `WorkflowDefinition` above: ordered stages, each a `Step[]`,
with branching steps holding `branches` and fan-out/loop steps holding
`children`, each lane its own `Step[]`.

### 🌳 Expand: flat DAG → nested tree

`expandDefinition(engine, storageId?)` walks the graph from its `start` step,
claiming each fresh step into the tree as it goes:

- It follows `next` pointers to build a linear trail.
- At a branching step it recurses into each lane.
- It stops a trail at a terminal, at a step with no `next`, or at an
  **already-claimed** step.

That last case is **convergence**: when a walk reaches a step another path
already claimed, the lane ends with a `merge` pointing at that step id, so every
step still appears exactly once. Finally, steps are regrouped into stages by
their stage annotation, bracketed by a synthesised pre-stage and end-stage.

### 🍂 Flatten: nested tree → flat DAG

`flattenDefinition(ui)` is the inverse. It emits every step into one flat list,
`next`-links each lane's internal trail (skipping terminals and branch owners),
and builds the branch map from the lane entry points. A lane that ends in a
`merge` re-links its last real step's `next` to the merge's `entryId` — which is
exactly how the **first** incoming edge of a convergence step became a linear
`next` and each **later** incoming edge became a merge that flatten turns back
into an edge. The full edge set is rebuilt.

### ⚖️ Known, intentional losses

The engine contract has no field for a few UI concerns, so a **flatten →
expand** round-trip normalises them:

- **Trigger** — expand synthesises a default `manual` trigger.
- **System / source** — dropped; every expanded definition is a user flow.
- **Status / enabled** — collapsed onto the engine's single `published` boolean.

Everything else — non-empty stages, all step config, branch/child lane nesting,
merge targets, and terminal flags — round-trips exactly; empty pre/end stages
are re-synthesised.
