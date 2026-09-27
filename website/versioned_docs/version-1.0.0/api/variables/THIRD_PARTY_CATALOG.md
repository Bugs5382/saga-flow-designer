# Variable: THIRD\_PARTY\_CATALOG

> `const` **THIRD\_PARTY\_CATALOG**: [`VerbSpec`](../interfaces/VerbSpec.md)[]

Defined in: [workflowData.ts:1239](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L1239)

Registered extension verbs contributed by vendor plug-ins. Same VerbSpec
shape; `source: "third_party"` + a vendor. All map onto the base `action`
dispatch at runtime, but appear as first-class verbs in the palette.

## Since

1.0.0
