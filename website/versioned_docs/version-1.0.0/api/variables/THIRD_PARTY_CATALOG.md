# Variable: THIRD\_PARTY\_CATALOG

> `const` **THIRD\_PARTY\_CATALOG**: [`VerbSpec`](../interfaces/VerbSpec.md)[]

Defined in: [workflowData.ts:1177](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1177)

Registered extension verbs contributed by vendor plug-ins. Same VerbSpec
shape; `source: "third_party"` + a vendor. All map onto the base `action`
dispatch at runtime, but appear as first-class verbs in the palette.

## Since

1.0.0
