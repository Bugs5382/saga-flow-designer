# Interface: Branch

Defined in: [workflowData.ts:53](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L53)

A branch lane inside a decision/switch step, or a child lane inside
parallel/foreach/while/try_catch. `caseLabel` is the human label (e.g. "TRUE"
/ "P1"), `cond` a CEL-ish expression (empty = default/else).

TERMINATION MODEL (control-flow redesign):
  Every lane DEFAULTS TO END (terminal). There is NO implicit fall-through or
  auto-rejoin — merging back is always an explicit choice, even for parallel.
  * `terminal` — undefined = use the owner-type default (laneDefaultsTerminal).
    A terminal lane truly ENDS on its own end-cap; control does not flow out
    of it into a sibling, a join, or the main flow.
  * `merge` — set on a NON-terminal decision/switch/parallel/join lane: the
    explicit sub-entry point it rejoins to + the data contract it supplies.
    Required whenever such a lane is non-terminal (validated).
  EXCEPTIONS (loops): a foreach/while body lane and a try_catch TRY lane
  default to REJOIN (loop back / continue) rather than end — see
  laneDefaultsTerminal / laneSemantics. A try_catch CATCH lane is ALWAYS
  terminal (forced, non-configurable).

## Since

1.0.0

## Properties

### caseLabel

> **caseLabel**: `string`

Defined in: [workflowData.ts:54](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L54)

***

### cond?

> `optional` **cond?**: `string`

Defined in: [workflowData.ts:55](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L55)

***

### id

> **id**: `string`

Defined in: [workflowData.ts:56](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L56)

***

### merge?

> `optional` **merge?**: [`MergeTarget`](MergeTarget.md)

Defined in: [workflowData.ts:57](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L57)

***

### steps

> **steps**: [`Step`](Step.md)[]

Defined in: [workflowData.ts:58](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L58)

***

### terminal?

> `optional` **terminal?**: `boolean`

Defined in: [workflowData.ts:59](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L59)
