# Function: laneDefaultsTerminal()

> **laneDefaultsTerminal**(`ownerType`, `role`, `loop`): `boolean`

Defined in: [workflowData.ts:1501](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1501)

Whether a lane defaults to TERMINAL (end) when `terminal` is undefined.
  decision/switch/parallel/join lanes  → default END (true).
  foreach/while body                   → default REJOIN/loop-back (false).
  try_catch TRY                        → default REJOIN (false).
  try_catch CATCH                      → forced END (true).

`loop` is the set of loop-construct verb names (foreach/while/map for the base
catalog). It is passed in — resolved from the effective catalog via
`useCatalog().loop` (or the module-global `LOOP_VERBS` for the base) — so lane
semantics reflect whatever catalog is actually in play, not a hardcoded set.

## Parameters

### ownerType

[`VerbName`](../type-aliases/VerbName.md)

### role

[`LaneRole`](../type-aliases/LaneRole.md)

### loop

`Set`\<`string`\>

## Returns

`boolean`

## Since

1.0.0
