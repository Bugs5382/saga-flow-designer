# Interface: FlowDesignerProps

Defined in: [components/FlowDesigner.tsx:120](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L120)

Props for [FlowDesigner](../functions/FlowDesigner.md). Provide a `gateway` plus either an initial
`definition` or a `definitionId` to load through the gateway.

## Since

1.0.0

## Properties

### catalogOverrides?

> `optional` **catalogOverrides?**: [`CatalogOverrides`](CatalogOverrides.md)

Defined in: [components/FlowDesigner.tsx:125](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L125)

***

### definition?

> `optional` **definition?**: [`WorkflowDefinition`](WorkflowDefinition.md)

Defined in: [components/FlowDesigner.tsx:128](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L128)

***

### definitionId?

> `optional` **definitionId?**: `string`

Defined in: [components/FlowDesigner.tsx:130](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L130)

***

### gateway

> **gateway**: [`WorkflowGateway`](WorkflowGateway.md)

Defined in: [components/FlowDesigner.tsx:132](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L132)

***

### onBack?

> `optional` **onBack?**: () => `void`

Defined in: [components/FlowDesigner.tsx:135](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L135)

#### Returns

`void`

***

### onNotify?

> `optional` **onNotify?**: (`notice`) => `void`

Defined in: [components/FlowDesigner.tsx:137](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L137)

#### Parameters

##### notice

[`DesignerNotice`](DesignerNotice.md)

#### Returns

`void`

***

### onPublish?

> `optional` **onPublish?**: (`workflow`) => `void`

Defined in: [components/FlowDesigner.tsx:139](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L139)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`void`

***

### onSave?

> `optional` **onSave?**: (`workflow`) => `void`

Defined in: [components/FlowDesigner.tsx:141](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L141)

#### Parameters

##### workflow

[`WorkflowDefinition`](WorkflowDefinition.md)

#### Returns

`void`

***

### showThirdParty?

> `optional` **showThirdParty?**: `boolean`

Defined in: [components/FlowDesigner.tsx:145](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowDesigner.tsx#L145)
