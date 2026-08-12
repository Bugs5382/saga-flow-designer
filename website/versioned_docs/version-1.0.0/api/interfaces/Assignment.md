# Interface: Assignment

Defined in: [workflowData.ts:1489](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1489)

One set_var assignment row. set_var supports one OR many assignments; rows are
stored as a JSON string in config.assignments, with a legacy single
\{name,value\} pair still read for back-compat. Empty rows (no name) are ignored
for outputs/validation.

## Since

1.0.0

## Properties

### name

> **name**: `string`

Defined in: [workflowData.ts:1490](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1490)

***

### value

> **value**: `string`

Defined in: [workflowData.ts:1491](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1491)
