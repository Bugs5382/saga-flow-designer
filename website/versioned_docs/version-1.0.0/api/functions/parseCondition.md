# Function: parseCondition()

> **parseCondition**(`cel`): [`ConditionParts`](../interfaces/ConditionParts.md) \| `undefined`

Defined in: [components/ConditionBuilder.tsx:133](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/components/ConditionBuilder.tsx#L133)

Best-effort parse of a composed CEL string back into builder parts. Only the
simple field-operator-value shapes the builder itself emits are recovered;
anything else returns undefined (the caller falls back to raw mode).

## Parameters

### cel

`string`

## Returns

[`ConditionParts`](../interfaces/ConditionParts.md) \| `undefined`

## Since

1.0.0
