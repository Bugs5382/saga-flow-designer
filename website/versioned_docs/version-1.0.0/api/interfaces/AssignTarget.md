# Interface: AssignTarget

Defined in: [workflowData.ts:1540](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1540)

Who a human task is assigned to. `ref` meaning by kind:
  user   → a user directory id/handle
  group  → a user directory group id (the context-scoped unit; assignment
           groups are Groups)
  record → a record-relative path (e.g. record.assignment_group.manager)
  cel    → a raw CEL expression resolving to the eligible set
`filter` is an optional CEL condition narrowing the resolved set.

## Since

1.0.0

## Properties

### filter?

> `optional` **filter?**: `string`

Defined in: [workflowData.ts:1541](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1541)

***

### kind

> **kind**: [`AssignTargetKind`](../type-aliases/AssignTargetKind.md)

Defined in: [workflowData.ts:1542](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1542)

***

### ref

> **ref**: `string`

Defined in: [workflowData.ts:1543](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1543)
