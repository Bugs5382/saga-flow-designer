# Function: stageOfStep()

> **stageOfStep**(`workflow`, `stepId`): [`Stage`](../interfaces/Stage.md) \| `undefined`

Defined in: [workflowScope.ts:299](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowScope.ts#L299)

Find the stage a step id lives in (top level only — nodes in lanes report
their owning stage).

## Parameters

### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

### stepId

`string`

## Returns

[`Stage`](../interfaces/Stage.md) \| `undefined`

## Since

1.0.0
