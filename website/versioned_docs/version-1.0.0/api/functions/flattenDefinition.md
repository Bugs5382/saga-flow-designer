# Function: flattenDefinition()

> **flattenDefinition**(`ui`): [`EngineDefinition`](../interfaces/EngineDefinition.md)

Defined in: [workflowMapper.ts:140](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L140)

UI nested WorkflowDefinition → engine-flat definition JSON (the `definition` Map the
host's save mutation accepts). `id` is the engine business id
(WorkflowDefinition.key); the storage UUID (WorkflowDefinition.id) is the server's concern
and is threaded by the gateway, not embedded here.

## Parameters

### ui

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

## Returns

[`EngineDefinition`](../interfaces/EngineDefinition.md)

## Since

1.0.0
