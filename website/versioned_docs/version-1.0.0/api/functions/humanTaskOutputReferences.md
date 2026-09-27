# Function: humanTaskOutputReferences()

> **humanTaskOutputReferences**(`step`): `string`[]

Defined in: [workflowData.ts:1733](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L1733)

The ref strings a human-task step produces as variable outputs. Used by both
workflowScope.stepOutputPills and workflowValidation.stepOutputs so the two
can never drift apart.

## Parameters

### step

[`Step`](../interfaces/Step.md)

## Returns

`string`[]

## Since

1.0.0
