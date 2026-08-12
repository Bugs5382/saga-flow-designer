# Function: setVariableAssignments()

> **setVariableAssignments**(`step`): [`Assignment`](../interfaces/Assignment.md)[]

Defined in: [workflowData.ts:1500](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1500)

Read the assignment rows for a set_var step, tolerating both the new
config.assignments JSON array AND the legacy single \{name,value\}.

## Parameters

### step

[`Step`](../interfaces/Step.md)

## Returns

[`Assignment`](../interfaces/Assignment.md)[]

## Since

1.0.0
