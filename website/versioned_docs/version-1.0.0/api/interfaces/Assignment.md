# Interface: Assignment

Defined in: [workflowData.ts:1564](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1564)

One set_var assignment row. set_var supports one OR many assignments; rows are
stored as a JSON string in config.assignments, with a legacy single
\{name,value\} pair still read for back-compat. Empty rows (no name) are ignored
for outputs/validation.

## Since

1.0.0

## Properties

### name

> **name**: `string`

Defined in: [workflowData.ts:1565](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1565)

***

### value

> **value**: `string`

Defined in: [workflowData.ts:1566](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1566)
