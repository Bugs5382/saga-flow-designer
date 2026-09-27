# Function: laneSemantics()

> **laneSemantics**(`ownerType`, `role`, `branch`, `loop`): [`LaneSemantics`](../type-aliases/LaneSemantics.md)

Defined in: [workflowData.ts:1534](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L1534)

The full semantics of a lane (drives canvas terminus + validation). `loop` —
see [laneDefaultsTerminal](laneDefaultsTerminal.md).

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

[`LaneSemantics`](../type-aliases/LaneSemantics.md)

## Since

1.0.0
