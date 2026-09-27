# Interface: Step

Defined in: [workflowData.ts:131](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L131)

A single node. `config` is the per-verb inputs bag (maps to engine
Step.Inputs). decision/switch use `branches`; parallel/foreach/while/try_catch
use `children` (each child is a lane = its own step sequence).

## Since

1.0.0

## Properties

### branches?

> `optional` **branches?**: [`Branch`](Branch.md)[]

Defined in: [workflowData.ts:132](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L132)

***

### children?

> `optional` **children?**: [`Branch`](Branch.md)[]

Defined in: [workflowData.ts:133](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L133)

***

### collapsed?

> `optional` **collapsed?**: `boolean`

Defined in: [workflowData.ts:136](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L136)

***

### config

> **config**: `Record`\<`string`, `string`\>

Defined in: [workflowData.ts:137](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L137)

***

### id

> **id**: `string`

Defined in: [workflowData.ts:138](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L138)

***

### label

> **label**: `string`

Defined in: [workflowData.ts:139](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L139)

***

### note?

> `optional` **note?**: `string`

Defined in: [workflowData.ts:142](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L142)

***

### type

> **type**: [`VerbName`](../type-aliases/VerbName.md)

Defined in: [workflowData.ts:143](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L143)
