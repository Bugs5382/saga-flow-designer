# Function: resolveCatalog()

> **resolveCatalog**(`base`, `overrides?`): [`ResolvedCatalog`](../interfaces/ResolvedCatalog.md)

Defined in: [catalogModel.ts:75](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L75)

Resolve the effective catalog from a base catalog plus `{ add, hide }`
overrides.
  - A base entry named in `hide` is dropped UNLESS it is `behavior.required`
    (required entries can never be hidden — hiding one would leave a flow
    that cannot be validly constructed).
  - `add` entries are appended after the kept base entries (added entries
    win on name collision, since they come last in `specs`/`byName`).
  - `groupOrder` starts from the base `VERB_GROUP_ORDER`, then appends any
    group introduced by an added entry, in first-seen order.
  - The behavior sets (`terminal`, `branch`, …) are derived by scanning the
    RESOLVED specs' `behavior` hints — not the base catalog's hardcoded
    globals — so they reflect adds/hides too.

## Parameters

### base

[`VerbSpec`](../interfaces/VerbSpec.md)[]

### overrides?

[`CatalogOverrides`](../interfaces/CatalogOverrides.md) = `{}`

## Returns

[`ResolvedCatalog`](../interfaces/ResolvedCatalog.md)

## Since

1.0.0
