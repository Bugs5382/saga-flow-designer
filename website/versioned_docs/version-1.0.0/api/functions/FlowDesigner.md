# Function: FlowDesigner()

> **FlowDesigner**(`__namedParameters`): `any`

Defined in: [components/FlowDesigner.tsx:1042](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/components/FlowDesigner.tsx#L1042)

The Flow Designer: an embeddable, props-driven workflow editor composing the
verb palette, the React Flow canvas, and the node configuration panel. It owns
its working copy (undo/redo + debounced autosave through the injected
gateway); the host supplies navigation, notices, and persistence side effects.

Provides a [CatalogProvider](CatalogProvider.md) around its tree — seeded with
`catalogOverrides` when given, the base catalog unchanged otherwise — so the
palette, canvas, and config panel read the effective verb catalog +
behavior via `useCatalog()` — the single source of truth — rather than the
module-global catalog.

## Parameters

### \_\_namedParameters

[`FlowDesignerProps`](../interfaces/FlowDesignerProps.md)

## Returns

`any`

## Since

1.0.0
