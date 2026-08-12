# Function: parseDurationParts()

> **parseDurationParts**(`config`): [`DurationParts`](../interfaces/DurationParts.md)

Defined in: [workflowData.ts:1794](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1794)

Parse a stored duration back into parts. Reads the structured per-unit config
keys the panel writes (duration_years, …); falls back to all-zero.

## Parameters

### config

`Record`\<`string`, `string`\>

## Returns

[`DurationParts`](../interfaces/DurationParts.md)

## Since

1.0.0
