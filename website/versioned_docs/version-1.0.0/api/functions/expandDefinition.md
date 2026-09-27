# Function: expandDefinition()

> **expandDefinition**(`engine`, `storageId?`): [`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

Defined in: [workflowMapper.ts:282](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowMapper.ts#L282)

Engine-flat definition → UI nested WorkflowDefinition.
  - `key`  ← engine.workflowId (business id), falling back to engine.id.
  - `id`   ← storageId (the host's storage UUID) when supplied, else the
             business id. The gateway always passes the storage UUID so
             getWorkflow(id)/run linkage resolves against it.

## Parameters

### engine

[`EngineDefinition`](../interfaces/EngineDefinition.md)

### storageId?

`string`

## Returns

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

## Since

1.0.0
