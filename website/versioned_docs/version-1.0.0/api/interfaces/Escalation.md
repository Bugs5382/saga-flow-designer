# Interface: Escalation

Defined in: [workflowData.ts:1569](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1569)

One pre-breach escalation step. Fires at afterPct (% of dueIn) OR afterAbs
(absolute offset like "24h"); notifies and/or reassigns to `target`.

## Since

1.0.0

## Properties

### action

> **action**: `"notify_reassign"` \| `"notify"` \| `"reassign"`

Defined in: [workflowData.ts:1570](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1570)

***

### afterAbs?

> `optional` **afterAbs?**: `string`

Defined in: [workflowData.ts:1571](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1571)

***

### afterPct?

> `optional` **afterPct?**: `number`

Defined in: [workflowData.ts:1572](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1572)

***

### target?

> `optional` **target?**: [`AssignTarget`](AssignTarget.md)

Defined in: [workflowData.ts:1573](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1573)
