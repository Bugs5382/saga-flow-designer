# Interface: Escalation

Defined in: [workflowData.ts:1644](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1644)

One pre-breach escalation step. Fires at afterPct (% of dueIn) OR afterAbs
(absolute offset like "24h"); notifies and/or reassigns to `target`.

## Since

1.0.0

## Properties

### action

> **action**: `"notify_reassign"` \| `"notify"` \| `"reassign"`

Defined in: [workflowData.ts:1645](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1645)

***

### afterAbs?

> `optional` **afterAbs?**: `string`

Defined in: [workflowData.ts:1646](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1646)

***

### afterPct?

> `optional` **afterPct?**: `number`

Defined in: [workflowData.ts:1647](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1647)

***

### target?

> `optional` **target?**: [`AssignTarget`](AssignTarget.md)

Defined in: [workflowData.ts:1648](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1648)
