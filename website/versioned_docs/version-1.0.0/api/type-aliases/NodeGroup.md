# Type Alias: NodeGroup

> **NodeGroup** = `object` & `string` \| [`VerbGroup`](VerbGroup.md)

Defined in: [workflowData.ts:83](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L83)

A node's group, widened to admit host-contributed groups (e.g. a catalog
overlay's custom palette section) while still surfacing the known base
`VerbGroup` literals for autocomplete.

## Since

1.0.0
