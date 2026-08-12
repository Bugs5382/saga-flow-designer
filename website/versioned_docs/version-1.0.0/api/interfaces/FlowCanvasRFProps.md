# Interface: FlowCanvasRFProps

Defined in: [components/FlowCanvasRF.tsx:707](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvasRF.tsx#L707)

Props for [FlowCanvasRF](../functions/FlowCanvasRF.md).

## Since

1.0.0

## Extends

- [`CanvasCallbacks`](CanvasCallbacks.md)

## Properties

### canPaste

> **canPaste**: `boolean`

Defined in: [components/FlowCanvas.tsx:79](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L79)

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`canPaste`](CanvasCallbacks.md#canpaste)

***

### dropLegal

> **dropLegal**: (`target`, `payload`) => `boolean`

Defined in: [components/FlowCanvas.tsx:81](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L81)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

##### payload

`string`

#### Returns

`boolean`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`dropLegal`](CanvasCallbacks.md#droplegal)

***

### flowId

> **flowId**: `string`

Defined in: [components/FlowCanvasRF.tsx:710](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvasRF.tsx#L710)

***

### onAddStage?

> `optional` **onAddStage?**: (`afterStageId?`) => `void`

Defined in: [components/FlowCanvas.tsx:84](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L84)

#### Parameters

##### afterStageId?

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onAddStage`](CanvasCallbacks.md#onaddstage)

***

### onCopy

> **onCopy**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:85](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L85)

#### Parameters

##### stepId

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onCopy`](CanvasCallbacks.md#oncopy)

***

### onDelete

> **onDelete**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:86](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L86)

#### Parameters

##### stepId

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onDelete`](CanvasCallbacks.md#ondelete)

***

### onDeleteCascade

> **onDeleteCascade**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:87](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L87)

#### Parameters

##### stepId

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onDeleteCascade`](CanvasCallbacks.md#ondeletecascade)

***

### onDropVerb

> **onDropVerb**: (`target`, `payload`) => `void`

Defined in: [components/FlowCanvas.tsx:88](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L88)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

##### payload

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onDropVerb`](CanvasCallbacks.md#ondropverb)

***

### onInsert

> **onInsert**: (`target`) => `void`

Defined in: [components/FlowCanvas.tsx:89](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L89)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onInsert`](CanvasCallbacks.md#oninsert)

***

### onInsertRelative

> **onInsertRelative**: (`stepId`, `where`) => `void`

Defined in: [components/FlowCanvas.tsx:90](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L90)

#### Parameters

##### stepId

`string`

##### where

`"above"` \| `"below"`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onInsertRelative`](CanvasCallbacks.md#oninsertrelative)

***

### onPasteRelative

> **onPasteRelative**: (`stepId`, `where`) => `void`

Defined in: [components/FlowCanvas.tsx:91](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L91)

#### Parameters

##### stepId

`string`

##### where

`"above"` \| `"below"`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onPasteRelative`](CanvasCallbacks.md#onpasterelative)

***

### onRemoveStage?

> `optional` **onRemoveStage?**: (`stageId`) => `void`

Defined in: [components/FlowCanvas.tsx:94](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L94)

#### Parameters

##### stageId

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onRemoveStage`](CanvasCallbacks.md#onremovestage)

***

### onSelect

> **onSelect**: (`id`) => `void`

Defined in: [components/FlowCanvas.tsx:95](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L95)

#### Parameters

##### id

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onSelect`](CanvasCallbacks.md#onselect)

***

### onToggleCollapse

> **onToggleCollapse**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:96](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L96)

#### Parameters

##### stepId

`string`

#### Returns

`void`

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`onToggleCollapse`](CanvasCallbacks.md#ontogglecollapse)

***

### runOverlay?

> `optional` **runOverlay?**: [`RunOverlay`](RunOverlay.md)

Defined in: [components/FlowCanvasRF.tsx:711](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvasRF.tsx#L711)

***

### selectedId

> **selectedId**: `string` \| `undefined`

Defined in: [components/FlowCanvasRF.tsx:712](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvasRF.tsx#L712)

***

### stages

> **stages**: [`Stage`](Stage.md)[]

Defined in: [components/FlowCanvasRF.tsx:713](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvasRF.tsx#L713)

***

### trigger

> **trigger**: [`Trigger`](Trigger.md)

Defined in: [components/FlowCanvasRF.tsx:714](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvasRF.tsx#L714)
