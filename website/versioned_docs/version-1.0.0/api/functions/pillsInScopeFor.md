# Function: pillsInScopeFor()

> **pillsInScopeFor**(`workflow`, `targetId?`): [`Pill`](../interfaces/Pill.md)[]

Defined in: [workflowScope.ts:167](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowScope.ts#L167)

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
