# Function: stageOfStep()

> **stageOfStep**(`workflow`, `stepId`): [`Stage`](../interfaces/Stage.md) \| `undefined`

Defined in: [workflowScope.ts:299](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowScope.ts#L299)

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
