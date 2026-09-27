# Interface: CatalogOverrides

Defined in: [catalogModel.ts:33](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L33)

Overrides applied on top of a base catalog: entries to add, and base entry
names to hide. A hidden entry that is `behavior.required` is NEVER
actually hidden (see `resolveCatalog`).

## Since

1.0.0

## Properties

### add?

> `optional` **add?**: [`VerbSpec`](VerbSpec.md)[]

Defined in: [catalogModel.ts:34](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L34)

***

### hide?

> `optional` **hide?**: `string`[]

Defined in: [catalogModel.ts:35](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L35)
