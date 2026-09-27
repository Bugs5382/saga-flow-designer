# Interface: RunOverlay

Defined in: [components/FlowCanvas.tsx:112](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L112)

Read-only run overlay. When supplied, the canvas renders in RUN MODE: no
insert slots, no drag, no context menu, no collapse toggles — every step card
is tinted by its StepRun status. `byStep` maps a Step.id to its StepRun.

## Since

1.0.0

## Properties

### byStep

> **byStep**: `Record`\<`string`, [`StepRun`](StepRun.md)\>

Defined in: [components/FlowCanvas.tsx:113](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L113)
