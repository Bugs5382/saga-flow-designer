# Function: CatalogProvider()

> **CatalogProvider**(`__namedParameters`): `any`

Defined in: [catalogContext.tsx:49](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/catalogContext.tsx#L49)

Resolves `base` (defaults to the package's [VERB\_CATALOG](../variables/VERB_CATALOG.md)) plus
`overrides` into a [ResolvedCatalog](../interfaces/ResolvedCatalog.md) — memoized on `[base, overrides]`
so re-renders that don't change either reuse the same resolved catalog —
and publishes it on context for descendants to read via [useCatalog](useCatalog.md).

## Parameters

### \_\_namedParameters

[`CatalogProviderProps`](../interfaces/CatalogProviderProps.md)

## Returns

`any`

## Since

1.0.0
