# Interface: CatalogOverrides

Defined in: [catalogModel.ts:33](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/catalogModel.ts#L33)

Overrides applied on top of a base catalog: entries to add, and base entry
names to hide. A hidden entry that is `behavior.required` is NEVER
actually hidden (see `resolveCatalog`).

## Since

1.0.0

## Properties

### add?

> `optional` **add?**: [`VerbSpec`](VerbSpec.md)[]

Defined in: [catalogModel.ts:34](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/catalogModel.ts#L34)

***

### hide?

> `optional` **hide?**: `string`[]

Defined in: [catalogModel.ts:35](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/catalogModel.ts#L35)
