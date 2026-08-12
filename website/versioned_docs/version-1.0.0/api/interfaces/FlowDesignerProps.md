# Interface: FlowDesignerProps

Defined in: [components/FlowDesigner.tsx:120](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L120)

Props for [FlowDesigner](../functions/FlowDesigner.md). Provide a `gateway` plus either an initial
`definition` or a `definitionId` to load through the gateway.

## Since

1.0.0

## Properties

### definition?

> `optional` **definition?**: [`WorkflowDefinition`](WorkflowDefinition.md)

Defined in: [components/FlowDesigner.tsx:123](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L123)

***

### definitionId?

> `optional` **definitionId?**: `string`

Defined in: [components/FlowDesigner.tsx:125](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L125)

***

### gateway

> **gateway**: [`WorkflowGateway`](WorkflowGateway.md)

Defined in: [components/FlowDesigner.tsx:127](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L127)

***

### onBack?

> `optional` **onBack?**: () => `void`

Defined in: [components/FlowDesigner.tsx:130](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L130)

#### Returns

`void`

***

### onNotify?

> `optional` **onNotify?**: (`notice`) => `void`

Defined in: [components/FlowDesigner.tsx:132](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L132)

#### Parameters

##### notice

[`DesignerNotice`](DesignerNotice.md)

#### Returns

`void`

***

### onPublish?

> `optional` **onPublish?**: (`workflow`) => `void`

Defined in: [components/FlowDesigner.tsx:134](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L134)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`void`

***

### onSave?

> `optional` **onSave?**: (`workflow`) => `void`

Defined in: [components/FlowDesigner.tsx:136](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowDesigner.tsx#L136)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`void`
