# Interface: MergeTarget

Defined in: [workflowData.ts:71](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L71)

Where a rejoining (non-terminal) lane merges back to. A merge is ALWAYS
explicit — there is no implicit fall-through / auto-rejoin. It targets a
specific entry-point node (`entryId`, an `entry` verb's step id) and supplies
a data mapping fulfilling that entry's declared input contract:
  inputs[\<entry-declared-name\>] = \<CEL / pill expression the lane provides\>.

## Since

1.0.0

## Properties

### entryId

> **entryId**: `string`

Defined in: [workflowData.ts:72](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L72)

***

### inputs

> **inputs**: `Record`\<`string`, `string`\>

Defined in: [workflowData.ts:73](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L73)
