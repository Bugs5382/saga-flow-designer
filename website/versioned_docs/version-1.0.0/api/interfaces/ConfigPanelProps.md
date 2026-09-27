# Interface: ConfigPanelProps

Defined in: [components/NodeConfigPanel.tsx:89](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L89)

Props for [NodeConfigPanel](../functions/NodeConfigPanel.md).

## Since

1.0.0

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [components/NodeConfigPanel.tsx:92](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L92)

***

### entryPoints

> **entryPoints**: [`EntryPoint`](EntryPoint.md)[]

Defined in: [components/NodeConfigPanel.tsx:94](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L94)

***

### onAddMapBody

> **onAddMapBody**: (`stepId`) => `void`

Defined in: [components/NodeConfigPanel.tsx:96](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L96)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onConfigChange

> **onConfigChange**: (`key`, `value`) => `void`

Defined in: [components/NodeConfigPanel.tsx:97](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L97)

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

Defined in: [components/NodeConfigPanel.tsx:98](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L98)

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### onLabelChange

> **onLabelChange**: (`label`) => `void`

Defined in: [components/NodeConfigPanel.tsx:99](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L99)

#### Parameters

##### label

`string`

#### Returns

`void`

***

### onLaneChange

> **onLaneChange**: (`laneId`, `patch`) => `void`

Defined in: [components/NodeConfigPanel.tsx:101](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L101)

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

Defined in: [components/NodeConfigPanel.tsx:102](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L102)

#### Parameters

##### note

`string`

#### Returns

`void`

***

### onRemoveMapBody

> **onRemoveMapBody**: (`stepId`) => `void`

Defined in: [components/NodeConfigPanel.tsx:103](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L103)

#### Parameters

##### stepId

`string`

#### Returns

`void`

***

### onStageRename?

> `optional` **onStageRename?**: (`name`) => `void`

Defined in: [components/NodeConfigPanel.tsx:104](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L104)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### onTriggerChange

> **onTriggerChange**: (`patch`) => `void`

Defined in: [components/NodeConfigPanel.tsx:105](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L105)

#### Parameters

##### patch

`Partial`\<[`Trigger`](Trigger.md)\>

#### Returns

`void`

***

### pills

> **pills**: [`Pill`](Pill.md)[]

Defined in: [components/NodeConfigPanel.tsx:106](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L106)

***

### selectedStage?

> `optional` **selectedStage?**: [`Stage`](Stage.md)

Defined in: [components/NodeConfigPanel.tsx:109](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L109)

***

### step

> **step**: [`Step`](Step.md) \| `undefined`

Defined in: [components/NodeConfigPanel.tsx:110](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L110)

***

### trigger

> **trigger**: [`Trigger`](Trigger.md)

Defined in: [components/NodeConfigPanel.tsx:111](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/components/NodeConfigPanel.tsx#L111)
