# Class: MockWorkflowGateway

Defined in: [mock/gateway.ts:91](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L91)

A fully in-memory [WorkflowGateway](../interfaces/WorkflowGateway.md) seeded with generic example
workflows and runs. Instantiate one per designer session; it doubles as the
Storybook and standalone-demo data source.

## Since

1.0.0

## Implements

- [`WorkflowGateway`](../interfaces/WorkflowGateway.md)

## Constructors

### Constructor

> **new MockWorkflowGateway**(): `MockWorkflowGateway`

#### Returns

`MockWorkflowGateway`

## Methods

### createWorkflow()

> **createWorkflow**(): `Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

Defined in: [mock/gateway.ts:95](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L95)

#### Returns

`Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`createWorkflow`](../interfaces/WorkflowGateway.md#createworkflow)

***

### deleteWorkflow()

> **deleteWorkflow**(`id`): `Promise`\<`void`\>

Defined in: [mock/gateway.ts:118](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L118)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`deleteWorkflow`](../interfaces/WorkflowGateway.md#deleteworkflow)

***

### getRun()

> **getRun**(`runId`): `Promise`\<[`Run`](../interfaces/Run.md) \| `undefined`\>

Defined in: [mock/gateway.ts:129](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L129)

#### Parameters

##### runId

`string`

#### Returns

`Promise`\<[`Run`](../interfaces/Run.md) \| `undefined`\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`getRun`](../interfaces/WorkflowGateway.md#getrun)

***

### getWorkflow()

> **getWorkflow**(`id`): `Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md) \| `undefined`\>

Defined in: [mock/gateway.ts:134](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L134)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md) \| `undefined`\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`getWorkflow`](../interfaces/WorkflowGateway.md#getworkflow)

***

### listAllRuns()

> **listAllRuns**(): `Promise`\<[`Run`](../interfaces/Run.md)[]\>

Defined in: [mock/gateway.ts:139](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L139)

#### Returns

`Promise`\<[`Run`](../interfaces/Run.md)[]\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`listAllRuns`](../interfaces/WorkflowGateway.md#listallruns)

***

### listRuns()

> **listRuns**(`workflowId`): `Promise`\<[`Run`](../interfaces/Run.md)[]\>

Defined in: [mock/gateway.ts:142](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L142)

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<[`Run`](../interfaces/Run.md)[]\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`listRuns`](../interfaces/WorkflowGateway.md#listruns)

***

### listWorkflows()

> **listWorkflows**(): `Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)[]\>

Defined in: [mock/gateway.ts:150](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L150)

#### Returns

`Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)[]\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`listWorkflows`](../interfaces/WorkflowGateway.md#listworkflows)

***

### restoreWorkflow()

> **restoreWorkflow**(`id`): `Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

Defined in: [mock/gateway.ts:153](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L153)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`restoreWorkflow`](../interfaces/WorkflowGateway.md#restoreworkflow)

***

### saveWorkflow()

> **saveWorkflow**(`workflow`): `Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

Defined in: [mock/gateway.ts:167](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L167)

#### Parameters

##### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

#### Returns

`Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`saveWorkflow`](../interfaces/WorkflowGateway.md#saveworkflow)

***

### setWorkflowEnabled()

> **setWorkflowEnabled**(`id`, `enabled`): `Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

Defined in: [mock/gateway.ts:174](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L174)

#### Parameters

##### id

`string`

##### enabled

`boolean`

#### Returns

`Promise`\<[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`setWorkflowEnabled`](../interfaces/WorkflowGateway.md#setworkflowenabled)

***

### subscribeRun()

> **subscribeRun**(`runId`, `onUpdate`): () => `void`

Defined in: [mock/gateway.ts:181](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L181)

#### Parameters

##### runId

`string`

##### onUpdate

(`run`) => `void`

#### Returns

() => `void`

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`subscribeRun`](../interfaces/WorkflowGateway.md#subscriberun)

***

### validateWorkflow()

> **validateWorkflow**(`workflow`): `Promise`\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Defined in: [mock/gateway.ts:187](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/mock/gateway.ts#L187)

#### Parameters

##### workflow

[`WorkflowDefinition`](../interfaces/WorkflowDefinition.md)

#### Returns

`Promise`\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

#### Implementation of

[`WorkflowGateway`](../interfaces/WorkflowGateway.md).[`validateWorkflow`](../interfaces/WorkflowGateway.md#validateworkflow)
