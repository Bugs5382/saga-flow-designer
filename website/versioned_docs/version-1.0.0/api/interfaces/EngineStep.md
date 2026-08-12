# Interface: EngineStep

Defined in: [workflowMapper.ts:96](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L96)

The engine's flat step. Engine-meaningful keys: id, type, action, next,
branches (a MAP), inputs. Designer metadata (label, note, collapsed, stage)
rides along untouched by the engine.

## Since

1.0.0

## Properties

### action?

> `optional` **action?**: `string`

Defined in: [workflowMapper.ts:97](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L97)

***

### branches?

> `optional` **branches?**: `Record`\<`string`, [`EngineBranchPointer`](EngineBranchPointer.md)\>

Defined in: [workflowMapper.ts:98](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L98)

***

### collapsed?

> `optional` **collapsed?**: `boolean`

Defined in: [workflowMapper.ts:99](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L99)

***

### id

> **id**: `string`

Defined in: [workflowMapper.ts:100](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L100)

***

### inputs?

> `optional` **inputs?**: `Record`\<`string`, `string`\>

Defined in: [workflowMapper.ts:101](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L101)

***

### label?

> `optional` **label?**: `string`

Defined in: [workflowMapper.ts:102](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L102)

***

### next?

> `optional` **next?**: `string`

Defined in: [workflowMapper.ts:103](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L103)

***

### note?

> `optional` **note?**: `string`

Defined in: [workflowMapper.ts:104](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L104)

***

### stage?

> `optional` **stage?**: `object`

Defined in: [workflowMapper.ts:105](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L105)

#### id

> **id**: `string`

#### kind

> **kind**: [`StageKind`](../type-aliases/StageKind.md)

#### name

> **name**: `string`

***

### type

> **type**: [`VerbName`](../type-aliases/VerbName.md)

Defined in: [workflowMapper.ts:106](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowMapper.ts#L106)
