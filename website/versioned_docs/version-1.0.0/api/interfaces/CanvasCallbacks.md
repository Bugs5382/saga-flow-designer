# Interface: CanvasCallbacks

Defined in: [components/FlowCanvas.tsx:78](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L78)

The interaction callbacks the canvas invokes for edit/insert/select actions.

## Since

1.0.0

## Extended by

- [`FlowCanvasRFProps`](FlowCanvasRFProps.md)

## Properties

### canPaste

> **canPaste**: `boolean`

Defined in: [components/FlowCanvas.tsx:79](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L79)

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

***

### onAddStage?

> `optional` **onAddStage?**: (`afterStageId?`) => `void`

Defined in: [components/FlowCanvas.tsx:84](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L84)

#### Parameters

##### afterStageId?

`string`

#### Returns

`void`

***

### onCopy

> **onCopy**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:85](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L85)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onDelete

> **onDelete**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:86](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L86)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onDeleteCascade

> **onDeleteCascade**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:87](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L87)

#### Parameters

##### stepId

`string`

#### Returns

`void`

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

***

### onInsert

> **onInsert**: (`target`) => `void`

Defined in: [components/FlowCanvas.tsx:89](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L89)

#### Parameters

##### target

[`InsertTarget`](InsertTarget.md)

#### Returns

`void`

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

***

### onRemoveStage?

> `optional` **onRemoveStage?**: (`stageId`) => `void`

Defined in: [components/FlowCanvas.tsx:94](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L94)

#### Parameters

##### stageId

`string`

#### Returns

`void`

***

### onSelect

> **onSelect**: (`id`) => `void`

Defined in: [components/FlowCanvas.tsx:95](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L95)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### onToggleCollapse

> **onToggleCollapse**: (`stepId`) => `void`

Defined in: [components/FlowCanvas.tsx:96](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/FlowCanvas.tsx#L96)

#### Parameters

##### stepId

`string`

#### Returns

`void`
