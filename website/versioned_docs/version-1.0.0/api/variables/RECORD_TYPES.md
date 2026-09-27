# Variable: RECORD\_TYPES

> `const` **RECORD\_TYPES**: `Record`\<`string`, \{ `fields`: [`RecordField`](../interfaces/RecordField.md)[]; `label`: `string`; \}\>

Defined in: [workflowData.ts:350](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L350)

Example field lists per record type — the trigger's record type declares
which record fields are in scope as pills (record.\<field\>). A host build
would pull these from its record schema registry via the gateway.

## Since

1.0.0
