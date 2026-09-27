# Interface: RunOverlay

Defined in: [components/FlowCanvas.tsx:112](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L112)

Read-only run overlay. When supplied, the canvas renders in RUN MODE: no
insert slots, no drag, no context menu, no collapse toggles — every step card
is tinted by its StepRun status. `byStep` maps a Step.id to its StepRun.

## Since

1.0.0

## Properties

### byStep

> **byStep**: `Record`\<`string`, [`StepRun`](StepRun.md)\>

Defined in: [components/FlowCanvas.tsx:113](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L113)
