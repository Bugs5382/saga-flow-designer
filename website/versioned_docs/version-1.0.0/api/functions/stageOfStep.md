# Function: stageOfStep()

> **stageOfStep**(`workflow`, `stepId`): [`Stage`](../interfaces/Stage.md) \| `undefined`

Defined in: [workflowScope.ts:297](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowScope.ts#L297)

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
