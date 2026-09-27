# Function: expandDefinition()

> **expandDefinition**(`engine`, `storageId?`): [`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

Defined in: [workflowMapper.ts:282](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowMapper.ts#L282)

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
