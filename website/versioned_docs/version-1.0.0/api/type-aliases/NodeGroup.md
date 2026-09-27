# Type Alias: NodeGroup

> **NodeGroup** = `object` & `string` \| [`VerbGroup`](VerbGroup.md)

Defined in: [workflowData.ts:83](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L83)

A node's group, widened to admit host-contributed groups (e.g. a catalog
overlay's custom palette section) while still surfacing the known base
`VerbGroup` literals for autocomplete.

## Since

1.0.0
