# Function: setVariableAssignments()

> **setVariableAssignments**(`step`): [`Assignment`](../interfaces/Assignment.md)[]

Defined in: [workflowData.ts:1575](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1575)

Read the assignment rows for a set_var step, tolerating both the new
config.assignments JSON array AND the legacy single \{name,value\}.

## Parameters

### step

[`Step`](../interfaces/Step.md)

## Returns

[`Assignment`](../interfaces/Assignment.md)[]

## Since

1.0.0
