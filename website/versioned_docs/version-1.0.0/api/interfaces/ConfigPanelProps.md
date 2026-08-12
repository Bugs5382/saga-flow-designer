# Interface: ConfigPanelProps

Defined in: [components/NodeConfigPanel.tsx:90](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L90)

Props for [NodeConfigPanel](../functions/NodeConfigPanel.md).

## Since

1.0.0

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [components/NodeConfigPanel.tsx:93](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L93)

***

### entryPoints

> **entryPoints**: [`EntryPoint`](EntryPoint.md)[]

Defined in: [components/NodeConfigPanel.tsx:95](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L95)

***

### onAddMapBody

> **onAddMapBody**: (`stepId`) => `void`

Defined in: [components/NodeConfigPanel.tsx:97](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L97)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onConfigChange

> **onConfigChange**: (`key`, `value`) => `void`

Defined in: [components/NodeConfigPanel.tsx:98](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L98)

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`void`

***

### onEnabledChange?

> `optional` **onEnabledChange?**: (`enabled`) => `void`

Defined in: [components/NodeConfigPanel.tsx:99](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L99)

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### onLabelChange

> **onLabelChange**: (`label`) => `void`

Defined in: [components/NodeConfigPanel.tsx:100](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L100)

#### Parameters

##### label

`string`

#### Returns

`void`

***

### onLaneChange

> **onLaneChange**: (`laneId`, `patch`) => `void`

Defined in: [components/NodeConfigPanel.tsx:102](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L102)

#### Parameters

##### laneId

`string`

##### patch

`Partial`\<[`Branch`](Branch.md)\>

#### Returns

`void`

***

### onNoteChange

> **onNoteChange**: (`note`) => `void`

Defined in: [components/NodeConfigPanel.tsx:103](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L103)

#### Parameters

##### note

`string`

#### Returns

`void`

***

### onRemoveMapBody

> **onRemoveMapBody**: (`stepId`) => `void`

Defined in: [components/NodeConfigPanel.tsx:104](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L104)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onStageRename?

> `optional` **onStageRename?**: (`name`) => `void`

Defined in: [components/NodeConfigPanel.tsx:105](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L105)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### onTriggerChange

> **onTriggerChange**: (`patch`) => `void`

Defined in: [components/NodeConfigPanel.tsx:106](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L106)

#### Parameters

##### patch

`Partial`\<[`Trigger`](Trigger.md)\>

#### Returns

`void`

***

### pills

> **pills**: [`Pill`](Pill.md)[]

Defined in: [components/NodeConfigPanel.tsx:107](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L107)

***

### selectedStage?

> `optional` **selectedStage?**: [`Stage`](Stage.md)

Defined in: [components/NodeConfigPanel.tsx:110](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L110)

***

### step

> **step**: [`Step`](Step.md) \| `undefined`

Defined in: [components/NodeConfigPanel.tsx:111](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L111)

***

### trigger

> **trigger**: [`Trigger`](Trigger.md)

Defined in: [components/NodeConfigPanel.tsx:112](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/NodeConfigPanel.tsx#L112)
