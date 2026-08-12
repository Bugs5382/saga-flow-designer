# Function: laneIsTerminal()

> **laneIsTerminal**(`ownerType`, `role`, `branch`): `boolean`

Defined in: [workflowData.ts:1446](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1446)

The EFFECTIVE terminal flag for a lane (owner-type default when unset; CATCH
is always terminal regardless of the stored flag).

## Parameters

### ownerType

[`VerbName`](../type-aliases/VerbName.md)

### role

[`LaneRole`](../type-aliases/LaneRole.md)

### branch

`Pick`\<[`Branch`](../interfaces/Branch.md), `"terminal"`\>

## Returns

`boolean`

## Since

1.0.0
