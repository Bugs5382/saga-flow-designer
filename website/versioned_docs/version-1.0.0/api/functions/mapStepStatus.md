# Function: mapStepStatus()

> **mapStepStatus**(`eventType`): [`StepRunStatus`](../type-aliases/StepRunStatus.md) \| `undefined`

Defined in: [runStream.ts:154](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/runStream.ts#L154)

Engine EventType → UI StepRunStatus, for events that carry a step_id. Returns
undefined for events that do not move a step's status.

## Parameters

### eventType

`string`

## Returns

[`StepRunStatus`](../type-aliases/StepRunStatus.md) \| `undefined`

## Since

1.0.0
