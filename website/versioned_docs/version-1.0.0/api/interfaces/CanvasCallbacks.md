# Interface: CanvasCallbacks

Defined in: [components/FlowCanvas.tsx:74](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L74)

The interaction callbacks the canvas invokes for edit/insert/select actions.

## Since

1.0.0

## Extended by

- [`FlowCanvasRFProps`](FlowCanvasRFProps.md)

## Properties

### canPaste

> **canPaste**: `boolean`

Defined in: [components/FlowCanvas.tsx:75](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L75)

***

### dropLegal

> **dropLegal**: (`target`, `payload`) => `boolean`

Defined in: [components/FlowCanvas.tsx:77](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L77)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

##### payload

`string`

#### Returns

`boolean`

***

### onAddStage?

> `optional` **onAddStage?**: (`afterStageId?`) => `void`

Defined in: [components/FlowCanvas.tsx:80](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L80)

#### Parameters

##### afterStageId?

`string`

#### Returns

`void`

***

### onCopy

> **onCopy**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:81](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L81)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onDelete

> **onDelete**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:82](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L82)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onDeleteCascade

> **onDeleteCascade**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:83](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L83)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onDropVerb

> **onDropVerb**: (`target`, `payload`) => `void`

Defined in: [components/FlowCanvas.tsx:84](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L84)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

##### payload

`string`

#### Returns

`void`

***

### onInsert

> **onInsert**: (`target`) => `void`

Defined in: [components/FlowCanvas.tsx:85](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L85)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

#### Returns

`void`

***

### onInsertRelative

> **onInsertRelative**: (`stepId`, `where`) => `void`

Defined in: [components/FlowCanvas.tsx:86](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L86)

#### Parameters

##### stepId

`string`

##### where

`"above"` \| `"below"`

#### Returns

`void`

***

### onPasteRelative

> **onPasteRelative**: (`stepId`, `where`) => `void`

Defined in: [components/FlowCanvas.tsx:87](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L87)

#### Parameters

##### stepId

`string`

##### where

`"above"` \| `"below"`

#### Returns

`void`

***

### onRemoveStage?

> `optional` **onRemoveStage?**: (`stageId`) => `void`

Defined in: [components/FlowCanvas.tsx:90](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L90)

#### Parameters

##### stageId

`string`

#### Returns

`void`

***

### onSelect

> **onSelect**: (`id`) => `void`

Defined in: [components/FlowCanvas.tsx:91](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L91)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### onToggleCollapse

> **onToggleCollapse**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:92](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowCanvas.tsx#L92)

#### Parameters

##### stepId

`string`

#### Returns

`void`
