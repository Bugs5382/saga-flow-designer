# Function: laneIsTerminal()

> **laneIsTerminal**(`ownerType`, `role`, `branch`, `loop`): `boolean`

Defined in: [workflowData.ts:1518](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1518)

The EFFECTIVE terminal flag for a lane (owner-type default when unset; CATCH
is always terminal regardless of the stored flag). `loop` — see
[laneDefaultsTerminal](laneDefaultsTerminal.md).

## Parameters

### ownerType

[`VerbName`](../type-aliases/VerbName.md)

### role

[`LaneRole`](../type-aliases/LaneRole.md)

### branch

`Pick`\<[`Branch`](../interfaces/Branch.md), `"terminal"`\>

### loop

`Set`\<`string`\>

## Returns

`boolean`

## Since

1.0.0
