# Interface: WorkflowGateway

Defined in: [workflowGateway.ts:49](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L49)

Data-source port the UI talks to for definitions and runs.

## Since

1.0.0

## Properties

### createWorkflow

> **createWorkflow**: () => `Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

Defined in: [workflowGateway.ts:53](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L53)

#### Returns

`Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

***

### deleteWorkflow

> **deleteWorkflow**: (`id`) => `Promise`\<`void`\>

Defined in: [workflowGateway.ts:56](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L56)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### getRun

> **getRun**: (`runId`) => `Promise`\<[`Run`](Run.md) \| `undefined`\>

Defined in: [workflowGateway.ts:57](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L57)

#### Parameters

##### runId

`string`

#### Returns

`Promise`\<[`Run`](Run.md) \| `undefined`\>

***

### getWorkflow

> **getWorkflow**: (`id`) => `Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md) \| `undefined`\>

Defined in: [workflowGateway.ts:58](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L58)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md) \| `undefined`\>

***

### listAllRuns

> **listAllRuns**: () => `Promise`\<[`Run`](Run.md)[]\>

Defined in: [workflowGateway.ts:61](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L61)

#### Returns

`Promise`\<[`Run`](Run.md)[]\>

***

### listRuns

> **listRuns**: (`workflowId`) => `Promise`\<[`Run`](Run.md)[]\>

Defined in: [workflowGateway.ts:64](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L64)

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<[`Run`](Run.md)[]\>

***

### listWorkflows

> **listWorkflows**: () => `Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)[]\>

Defined in: [workflowGateway.ts:65](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L65)

#### Returns

`Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)[]\>

***

### restoreWorkflow

> **restoreWorkflow**: (`id`) => `Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

Defined in: [workflowGateway.ts:68](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L68)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

***

### saveWorkflow

> **saveWorkflow**: (`workflow`) => `Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

Defined in: [workflowGateway.ts:71](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L71)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

***

### setWorkflowEnabled

> **setWorkflowEnabled**: (`id`, `enabled`) => `Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

Defined in: [workflowGateway.ts:74](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L74)

#### Parameters

##### id

`string`

##### enabled

`boolean`

#### Returns

`Promise`\<[`WorkflowDefinition`](WorkflowDefinition.md)\>

***

### subscribeRun

> **subscribeRun**: (`runId`, `onUpdate`) => () => `void`

Defined in: [workflowGateway.ts:79](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L79)

#### Parameters

##### runId

`string`

##### onUpdate

(`run`) => `void`

#### Returns

() => `void`

***

### validateWorkflow

> **validateWorkflow**: (`workflow`) => `Promise`\<[`ValidationResult`](ValidationResult.md)\>

Defined in: [workflowGateway.ts:81](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowGateway.ts#L81)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`Promise`\<[`ValidationResult`](ValidationResult.md)\>
