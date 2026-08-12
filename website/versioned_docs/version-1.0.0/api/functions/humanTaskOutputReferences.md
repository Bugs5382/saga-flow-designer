# Function: humanTaskOutputReferences()

> **humanTaskOutputReferences**(`step`): `string`[]

Defined in: [workflowData.ts:1658](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1658)

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
