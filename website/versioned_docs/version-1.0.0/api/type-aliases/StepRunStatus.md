# Type Alias: StepRunStatus

> **StepRunStatus** = `"failed"` \| `"running"` \| `"skipped"` \| `"succeeded"` \| `"waiting"`

Defined in: [runData.ts:109](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/runData.ts#L109)

Per-step execution status. `skipped` marks a step on an UNTAKEN branch (the
path enumeration reached the decision but chose the other lane).

## Since

1.0.0
