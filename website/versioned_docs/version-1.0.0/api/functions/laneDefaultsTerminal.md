# Function: laneDefaultsTerminal()

> **laneDefaultsTerminal**(`ownerType`, `role`): `boolean`

Defined in: [workflowData.ts:1434](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1434)

Whether a lane defaults to TERMINAL (end) when `terminal` is undefined.
  decision/switch/parallel/join lanes  → default END (true).
  foreach/while body                   → default REJOIN/loop-back (false).
  try_catch TRY                        → default REJOIN (false).
  try_catch CATCH                      → forced END (true).

## Parameters

### ownerType

[`VerbName`](../type-aliases/VerbName.md)

### role

[`LaneRole`](../type-aliases/LaneRole.md)

## Returns

`boolean`

## Since

1.0.0
