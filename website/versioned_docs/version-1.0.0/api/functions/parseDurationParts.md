# Function: parseDurationParts()

> **parseDurationParts**(`config`): [`DurationParts`](../interfaces/DurationParts.md)

Defined in: [workflowData.ts:1869](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L1869)

Parse a stored duration back into parts. Reads the structured per-unit config
keys the panel writes (duration_years, …); falls back to all-zero.

## Parameters

### config

`Record`\<`string`, `string`\>

## Returns

[`DurationParts`](../interfaces/DurationParts.md)

## Since

1.0.0
