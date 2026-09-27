# Type Alias: NodeName

> **NodeName** = `object` & `string` \| [`VerbName`](VerbName.md)

Defined in: [workflowData.ts:92](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L92)

A node's verb name, widened to admit host-contributed verb names (e.g. a
catalog overlay's custom entries) while still surfacing the known base
`VerbName` literals for autocomplete.

## Since

1.0.0
