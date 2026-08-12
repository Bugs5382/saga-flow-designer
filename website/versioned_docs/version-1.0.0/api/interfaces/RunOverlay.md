# Interface: RunOverlay

Defined in: [components/FlowCanvas.tsx:116](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L116)

Read-only run overlay. When supplied, the canvas renders in RUN MODE: no
insert slots, no drag, no context menu, no collapse toggles — every step card
is tinted by its StepRun status. `byStep` maps a Step.id to its StepRun.

## Since

1.0.0

## Properties

### byStep

> **byStep**: `Record`\<`string`, [`StepRun`](StepRun.md)\>

Defined in: [components/FlowCanvas.tsx:117](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L117)
