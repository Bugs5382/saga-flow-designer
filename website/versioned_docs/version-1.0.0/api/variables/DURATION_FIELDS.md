# Variable: DURATION\_FIELDS

> `const` **DURATION\_FIELDS**: `object`[]

Defined in: [workflowData.ts:1792](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1792)

The ordered fields of the duration combo (key + label + max), used to render
the number inputs. `years` maxes at 1 and total is capped at 365 days.

## Type Declaration

### key

> **key**: keyof [`DurationParts`](../interfaces/DurationParts.md)

### label

> **label**: `string`

### max

> **max**: `number`

## Since

1.0.0
