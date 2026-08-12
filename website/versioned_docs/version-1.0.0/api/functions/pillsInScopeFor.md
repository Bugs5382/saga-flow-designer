# Function: pillsInScopeFor()

> **pillsInScopeFor**(`workflow`, `targetId?`): [`Pill`](../interfaces/Pill.md)[]

Defined in: [workflowScope.ts:167](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowScope.ts#L167)

Compute the pills in scope for a target node id: trigger pills + the outputs
of every node that lies at or above it on its enclosing trail(s). Walks the
stage/step tree and accumulates outputs along the path to the target.

## Parameters

### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

### targetId?

`string`

## Returns

[`Pill`](../interfaces/Pill.md)[]

## Since

1.0.0
