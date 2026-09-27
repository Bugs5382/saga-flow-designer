# Interface: FlowCanvasRFProps

Defined in: [components/FlowCanvasRf.tsx:709](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvasRf.tsx#L709)

Props for [FlowCanvasRF](../functions/FlowCanvasRF.md).

## Since

1.0.0

## Extends

- [`CanvasCallbacks`](CanvasCallbacks.md)

## Properties

### canPaste

> **canPaste**: `boolean`

Defined in: [components/FlowCanvas.tsx:75](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L75)

#### Inherited from

[`CanvasCallbacks`](CanvasCallbacks.md).[`canPaste`](CanvasCallbacks.md#canpaste)

***

### dropLegal

> **dropLegal**: (`target`, `payload`) => `boolean`

Defined in: [components/FlowCanvas.tsx:77](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L77)

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

Defined in: [components/FlowCanvasRf.tsx:712](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvasRf.tsx#L712)

***

### onAddStage?

> `optional` **onAddStage?**: (`afterStageId?`) => `void`

Defined in: [components/FlowCanvas.tsx:80](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L80)

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

Defined in: [components/FlowCanvas.tsx:81](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L81)

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

Defined in: [components/FlowCanvas.tsx:82](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L82)

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

Defined in: [components/FlowCanvas.tsx:83](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L83)

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

Defined in: [components/FlowCanvas.tsx:84](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L84)

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

Defined in: [components/FlowCanvas.tsx:85](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L85)

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

Defined in: [components/FlowCanvas.tsx:86](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L86)

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

Defined in: [components/FlowCanvas.tsx:87](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L87)

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

Defined in: [components/FlowCanvas.tsx:90](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L90)

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

Defined in: [components/FlowCanvas.tsx:91](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L91)

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

Defined in: [components/FlowCanvas.tsx:92](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvas.tsx#L92)

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

Defined in: [components/FlowCanvasRf.tsx:713](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvasRf.tsx#L713)

***

### selectedId

> **selectedId**: `string` \| `undefined`

Defined in: [components/FlowCanvasRf.tsx:714](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvasRf.tsx#L714)

***

### stages

> **stages**: [`Stage`](Stage.md)[]

Defined in: [components/FlowCanvasRf.tsx:715](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvasRf.tsx#L715)

***

### trigger

> **trigger**: [`Trigger`](Trigger.md)

Defined in: [components/FlowCanvasRf.tsx:716](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/FlowCanvasRf.tsx#L716)
