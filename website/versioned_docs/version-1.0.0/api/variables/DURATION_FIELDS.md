# Variable: DURATION\_FIELDS

> `const` **DURATION\_FIELDS**: `object`[]

Defined in: [workflowData.ts:1717](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1717)

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
