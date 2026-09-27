# Interface: AssignTarget

Defined in: [workflowData.ts:1615](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1615)

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

Defined in: [workflowData.ts:1616](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1616)

***

### kind

> **kind**: [`AssignTargetKind`](../type-aliases/AssignTargetKind.md)

Defined in: [workflowData.ts:1617](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1617)

***

### ref

> **ref**: `string`

Defined in: [workflowData.ts:1618](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1618)
