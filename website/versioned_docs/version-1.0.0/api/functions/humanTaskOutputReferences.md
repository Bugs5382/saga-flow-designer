# Function: humanTaskOutputReferences()

> **humanTaskOutputReferences**(`step`): `string`[]

Defined in: [workflowData.ts:1733](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1733)

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
