# Variable: RECORD\_TYPES

> `const` **RECORD\_TYPES**: `Record`\<`string`, \{ `fields`: [`RecordField`](../interfaces/RecordField.md)[]; `label`: `string`; \}\>

Defined in: [workflowData.ts:305](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L305)

Example field lists per record type — the trigger's record type declares
which record fields are in scope as pills (record.\<field\>). A host build
would pull these from its record schema registry via the gateway.

## Since

1.0.0
