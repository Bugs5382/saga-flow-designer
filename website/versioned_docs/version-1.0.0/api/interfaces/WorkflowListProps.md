# Interface: WorkflowListProps

Defined in: [components/WorkflowList.tsx:66](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L66)

Props for [WorkflowList](../functions/WorkflowList.md).

## Since

1.0.0

## Properties

### onCreate?

> `optional` **onCreate?**: () => `void`

Defined in: [components/WorkflowList.tsx:68](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L68)

#### Returns

`void`

***

### onDelete?

> `optional` **onDelete?**: (`workflow`) => `void`

Defined in: [components/WorkflowList.tsx:70](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L70)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`void`

***

### onOpenWorkflow?

> `optional` **onOpenWorkflow?**: (`workflowId`) => `void`

Defined in: [components/WorkflowList.tsx:72](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L72)

#### Parameters

##### workflowId

`string`

#### Returns

`void`

***

### onRestore?

> `optional` **onRestore?**: (`workflow`) => `void`

Defined in: [components/WorkflowList.tsx:74](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L74)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`void`

***

### onToggleEnabled?

> `optional` **onToggleEnabled?**: (`workflow`, `enabled`) => `void`

Defined in: [components/WorkflowList.tsx:76](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L76)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

##### enabled

`boolean`

#### Returns

`void`

***

### workflows

> **workflows**: [`WorkflowDefinition`](WorkflowDefinition.md)[]

Defined in: [components/WorkflowList.tsx:78](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/WorkflowList.tsx#L78)
