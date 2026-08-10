# Flow Designer components

Embeddable, props-driven React components for visualising and editing
saga-orchestration workflows and runs. They import the package's own logic core
for the domain model and carry **no dependency on any external UI library** — the
design-system components the original source used are replaced by the small,
hand-rolled primitives in [`./primitives`](./primitives).

## What's exported

- `FlowDesigner` — the full editor (verb palette + React Flow canvas + node
  config panel). Props-driven: pass a `gateway` plus either a `definition` or a
  `definitionId`, and optional `onBack` / `onSave` / `onPublish` / `onNotify`
  callbacks. It owns its working copy (undo/redo + debounced autosave); the host
  owns navigation and how notices are surfaced.
- `RunsList` — a global execution-history table. Pass `runs` (and optional
  `workflowsById`); row/workflow activation go through `onOpenRun` /
  `onOpenWorkflow`.
- `RunDetail` — a single run with a read-only status overlay on the flow, a step
  timeline, and the event log. Pass `runId` + `gateway`; it subscribes to the
  gateway's live run stream.
- `WorkflowList` — a definitions table with a lifecycle menu. Lifecycle actions
  are delegated to host callbacks.
- Composable subcomponents: `FlowCanvas`, `FlowCanvasRF`, `VerbPalette`,
  `NodeConfigPanel`, `ConditionBuilder`.

None of the components use router hooks or an application shell — the host wires
routing and layout around them.

## Styling contract (Tailwind — read this)

The components are styled with **Tailwind CSS utility classes**. For this slice
the package **does not ship its own compiled CSS**; a consuming app is expected
to run Tailwind and include these files in its `content` scan so the utilities
are generated, for example:

```js
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@bugs5382/saga-flow-designer/dist/**/*.{js,cjs}",
  ],
};
```

Some utilities reference project-defined palette tokens (`coral`, `teal`,
`slate`, `indigo`, …). `slate`/`indigo`/`emerald`/`rose`/`amber`/`sky`/`zinc`
are Tailwind defaults; **`coral` is a custom colour** the consumer must define in
their Tailwind theme (any accent colour works). A shipped-CSS / design-token
strategy that removes the Tailwind assumption is a planned follow-up.

The React Flow canvas additionally pulls in `@xyflow/react/dist/style.css`
(imported by `FlowCanvasRF`), so consumers must be able to import CSS from
dependencies (standard in Vite/Next/webpack setups).

## Peer dependencies

`react`, `react-dom`, and `@xyflow/react` are peer dependencies — the consumer
provides them. They are not bundled.
