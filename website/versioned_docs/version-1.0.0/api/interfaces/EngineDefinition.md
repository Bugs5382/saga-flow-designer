# Interface: EngineDefinition

Defined in: [workflowMapper.ts:78](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L78)

The engine-flat definition. `id` is the business workflowId; `workflowId` is
present on the host read path (a distinct field) and preferred for `key` when
available.

## Since

1.0.0

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [workflowMapper.ts:79](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L79)

***

### id

> **id**: `string`

Defined in: [workflowMapper.ts:80](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L80)

***

### name

> **name**: `string`

Defined in: [workflowMapper.ts:81](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L81)

***

### published

> **published**: `boolean`

Defined in: [workflowMapper.ts:82](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L82)

***

### start

> **start**: `string`

Defined in: [workflowMapper.ts:83](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L83)

***

### steps

> **steps**: [`EngineStep`](EngineStep.md)[]

Defined in: [workflowMapper.ts:84](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L84)

***

### version

> **version**: `number`

Defined in: [workflowMapper.ts:85](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L85)

***

### workflowId?

> `optional` **workflowId?**: `string`

Defined in: [workflowMapper.ts:86](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L86)
