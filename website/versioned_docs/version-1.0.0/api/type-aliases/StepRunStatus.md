# Type Alias: StepRunStatus

> **StepRunStatus** = `"failed"` \| `"running"` \| `"skipped"` \| `"succeeded"` \| `"waiting"`

Defined in: [runData.ts:109](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runData.ts#L109)

Per-step execution status. `skipped` marks a step on an UNTAKEN branch (the
path enumeration reached the decision but chose the other lane).

## Since

1.0.0
