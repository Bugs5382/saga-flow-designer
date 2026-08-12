# Interface: RunEvent

Defined in: [runData.ts:54](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runData.ts#L54)

An audit-log entry: who did what, when. The engine emits these for every
state transition (started, step completed, human decision, error, …).

## Since

1.0.0

## Properties

### actor?

> `optional` **actor?**: `string`

Defined in: [runData.ts:55](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runData.ts#L55)

***

### at

> **at**: `string`

Defined in: [runData.ts:56](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runData.ts#L56)

***

### kind

> **kind**: `"cancelled"` \| `"paused"` \| `"completed"` \| `"decision"` \| `"error"` \| `"human_action"` \| `"resumed"` \| `"started"` \| `"step"`

Defined in: [runData.ts:57](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runData.ts#L57)

***

### message

> **message**: `string`

Defined in: [runData.ts:67](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runData.ts#L67)
