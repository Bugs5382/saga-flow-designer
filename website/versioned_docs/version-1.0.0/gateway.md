---
sidebar_position: 2
title: The gateway seam
---

# 🔌 The gateway seam

The `WorkflowGateway` is the **one seam** every host implements. It is the
reusable crux of the library: the designer talks only to this port, never to a
data source directly, so the same UI runs against whichever adapter the host
wires in — an in-process fixture, a local store, or a remote engine over the
network.

> One adapter per run. The seam is a single interface; there is no per-call
> fallback between adapters.

## 🧩 The contract

```ts
import type {
  Run,
  ValidationResult,
  WorkflowDefinition,
  WorkflowGateway,
} from "@bugs5382/saga-flow-designer";

interface WorkflowGateway {
  // --- Definitions ---------------------------------------------------------
  listWorkflows(): Promise<WorkflowDefinition[]>;
  getWorkflow(id: string): Promise<WorkflowDefinition | undefined>;
  createWorkflow(): Promise<WorkflowDefinition>;
  saveWorkflow(workflow: WorkflowDefinition): Promise<WorkflowDefinition>;
  deleteWorkflow(id: string): Promise<void>;
  setWorkflowEnabled(id: string, enabled: boolean): Promise<WorkflowDefinition>;
  restoreWorkflow(id: string): Promise<WorkflowDefinition>;

  // --- Runs ----------------------------------------------------------------
  listAllRuns(): Promise<Run[]>;
  listRuns(workflowId: string): Promise<Run[]>;
  getRun(runId: string): Promise<Run | undefined>;
  subscribeRun(runId: string, onUpdate: (run: Run) => void): () => void;

  // --- Validation ----------------------------------------------------------
  validateWorkflow(workflow: WorkflowDefinition): Promise<ValidationResult>;
}
```

### 📋 Definitions

- **`listWorkflows`** returns every definition for the workflow list.
- **`getWorkflow`** resolves one by id (returns `undefined` when it is missing).
- **`createWorkflow`** mints a fresh draft — a skeleton with an empty first
  stage, or a create call to the engine — and returns it so the caller can
  navigate straight into the designer.
- **`saveWorkflow`** persists the whole definition (typically after validation)
  and returns the stored result.
- **`deleteWorkflow`** hard-deletes a **user** flow. It rejects for a *system*
  flow — those are restored to their shipped default, never deleted.
- **`setWorkflowEnabled`** toggles a flow at its trigger. A disabled flow keeps
  its definition but never fires.
- **`restoreWorkflow`** returns a **system** flow to its shipped default; it
  rejects for a user flow.

### 🏃 Runs

- **`listAllRuns`** is the global execution history across every workflow,
  newest-first — it powers the top-level Runs surface.
- **`listRuns`** is the history for one workflow. Newest-first ordering is the
  gateway's responsibility.
- **`getRun`** resolves one run (with its `stepRuns` and `events`).
- **`subscribeRun`** opens a **live** stream for one run: it pushes a snapshot
  first, then live updates, and returns an unsubscribe function that closes the
  transport. This is the seam where the host owns the transport (a WebSocket,
  Server-Sent Events, polling — anything that yields frames).

### ✅ Validation

- **`validateWorkflow`** returns a `ValidationResult` — an `ok` boolean plus a
  list of typed `ValidationIssue`s (each an `error` or `warning`, optionally
  tied to a `stepId`). The **structural** checks are shipped in the core (see
  `validateWorkflow` in the API reference); an adapter should run those so every
  adapter validates identically and can never drift, and may add its own
  engine-side checks on top.

## 🛠 A worked adapter sketch

The two hard parts of any adapter are (a) translating between the engine's
representation and the UI's, and (b) folding a live stream into a `Run`. The
core hands you both — the [flatten/expand mapper](./model.md) and the run-stream
fold — so an adapter is mostly plumbing.

```ts
import {
  expandDefinition,
  flattenDefinition,
  foldFrame,
  seedRun,
  validateWorkflow,
  type EngineDefinition,
  type Run,
  type StreamFrame,
  type WorkflowDefinition,
  type WorkflowGateway,
} from "@bugs5382/saga-flow-designer";

// `transport` is whatever the host uses to reach the engine — a REST client, a
// GraphQL client, an in-process store. The library does not care.
export function createGateway(transport: EngineTransport): WorkflowGateway {
  return {
    async listWorkflows() {
      const defs = await transport.fetchDefinitions(); // EngineDefinition[]
      // Expand each engine-flat definition into the UI-nested tree. The host's
      // storage id is threaded in so getWorkflow(id) and run linkage resolve.
      return defs.map((d) => expandDefinition(d, d.storageId));
    },

    async getWorkflow(id) {
      const d = await transport.fetchDefinition(id);
      return d ? expandDefinition(d, id) : undefined;
    },

    async saveWorkflow(workflow: WorkflowDefinition) {
      // Flatten the edited tree back to the engine-flat shape before saving.
      const flat: EngineDefinition = flattenDefinition(workflow);
      const saved = await transport.putDefinition(workflow.id, flat);
      return expandDefinition(saved, workflow.id);
    },

    subscribeRun(runId, onUpdate) {
      // Seed an empty Run, then fold each parsed frame into a new immutable Run
      // and push it. The transport just parses bytes into StreamFrame objects.
      let run: Run = seedRun(runId);
      const socket = transport.openRunStream(runId, (frame: StreamFrame) => {
        run = foldFrame(run, frame);
        onUpdate(run);
      });
      return () => socket.close();
    },

    async validateWorkflow(workflow) {
      // Reuse the core's structural checks so every adapter agrees.
      return validateWorkflow(workflow);
    },

    // ...listAllRuns / listRuns / getRun / createWorkflow / deleteWorkflow /
    // setWorkflowEnabled / restoreWorkflow follow the same pattern.
  } as WorkflowGateway;
}
```

The takeaways:

- **The UI only ever sees the nested `WorkflowDefinition`.** Expand on the way
  in, flatten on the way out — the mapper guarantees the round-trip is lossless
  for everything the engine can represent.
- **`subscribeRun` is a fold, not a bespoke reducer.** `seedRun` +
  `foldFrame` (or `foldFrames` for a batch) turn a stream of frames into a
  live `Run`. Your transport code stays tiny.
- **Validation lives in the core.** Call `validateWorkflow` from your adapter so
  the same rules run no matter which data source is selected.
