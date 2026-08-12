# Interface: Step

Defined in: [workflowData.ts:113](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L113)

A single node. `config` is the per-verb inputs bag (maps to engine
Step.Inputs). decision/switch use `branches`; parallel/foreach/while/try_catch
use `children` (each child is a lane = its own step sequence).

## Since

1.0.0

## Properties

### branches?

> `optional` **branches?**: [`Branch`](Branch.md)[]

Defined in: [workflowData.ts:114](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L114)

***

### children?

> `optional` **children?**: [`Branch`](Branch.md)[]

Defined in: [workflowData.ts:115](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L115)

***

### collapsed?

> `optional` **collapsed?**: `boolean`

Defined in: [workflowData.ts:118](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L118)

***

### config

> **config**: `Record`\<`string`, `string`\>

Defined in: [workflowData.ts:119](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L119)

***

### id

> **id**: `string`

Defined in: [workflowData.ts:120](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L120)

***

### label

> **label**: `string`

Defined in: [workflowData.ts:121](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L121)

***

### note?

> `optional` **note?**: `string`

Defined in: [workflowData.ts:124](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L124)

***

### type

> **type**: [`VerbName`](../type-aliases/VerbName.md)

Defined in: [workflowData.ts:125](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L125)
