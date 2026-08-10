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

The components are styled with **Tailwind CSS utility classes**, and every colour
they use resolves to a `--sfd-*` CSS variable for which the package ships its own
default value — so the palette is swappable without touching the components and
depends on no external design system. Two files ship for this:

- `@bugs5382/saga-flow-designer/theme.css` — a `:root` block with the default
  value of every `--sfd-*` variable.
- `@bugs5382/saga-flow-designer/tailwind-preset` — a Tailwind preset mapping each
  colour name (`slate`, `coral`, `teal`, `indigo`, …) to its variable in channel
  form, so opacity modifiers keep working.

A consuming app imports `theme.css` once, adds the preset, and includes the
package in its Tailwind `content` scan so the utilities are generated:

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

To rebrand, override any `--sfd-*` variables (globally or scoped to a subtree).
Any variable left alone keeps the package default. See the **Guides → Theming**
Storybook page for the full guide and a live default-vs-alternate demo.

The React Flow canvas additionally pulls in `@xyflow/react/dist/style.css`
(imported by `FlowCanvasRF`), so consumers must be able to import CSS from
dependencies (standard in Vite/Next/webpack setups).

## Peer dependencies

`react`, `react-dom`, and `@xyflow/react` are peer dependencies — the consumer
provides them. They are not bundled.
