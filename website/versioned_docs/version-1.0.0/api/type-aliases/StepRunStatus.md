# Type Alias: StepRunStatus

> **StepRunStatus** = `"failed"` \| `"running"` \| `"skipped"` \| `"succeeded"` \| `"waiting"`

Defined in: [runData.ts:109](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/runData.ts#L109)

Per-step execution status. `skipped` marks a step on an UNTAKEN branch (the
path enumeration reached the decision but chose the other lane).

## Since

1.0.0
