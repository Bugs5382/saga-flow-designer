# Interface: ResolvedCatalog

Defined in: [catalogModel.ts:45](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L45)

The result of resolving a base catalog + overrides: the effective spec
list/index/group order, plus the behavior sets derived from each resolved
spec's `behavior` hints.

## Since

1.0.0

## Properties

### branch

> **branch**: `Set`\<`string`\>

Defined in: [catalogModel.ts:46](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L46)

***

### byName

> **byName**: `Record`\<`string`, [`VerbSpec`](VerbSpec.md)\>

Defined in: [catalogModel.ts:47](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L47)

***

### fanout

> **fanout**: `Set`\<`string`\>

Defined in: [catalogModel.ts:48](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L48)

***

### groupOrder

> **groupOrder**: [`NodeGroup`](../type-aliases/NodeGroup.md)[]

Defined in: [catalogModel.ts:49](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L49)

***

### loop

> **loop**: `Set`\<`string`\>

Defined in: [catalogModel.ts:50](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L50)

***

### mergeableOwners

> **mergeableOwners**: `Set`\<`string`\>

Defined in: [catalogModel.ts:51](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L51)

***

### pause

> **pause**: `Set`\<`string`\>

Defined in: [catalogModel.ts:52](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L52)

***

### required

> **required**: `Set`\<`string`\>

Defined in: [catalogModel.ts:53](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L53)

***

### signalWait

> **signalWait**: `Set`\<`string`\>

Defined in: [catalogModel.ts:54](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L54)

***

### specs

> **specs**: [`VerbSpec`](VerbSpec.md)[]

Defined in: [catalogModel.ts:55](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L55)

***

### terminal

> **terminal**: `Set`\<`string`\>

Defined in: [catalogModel.ts:56](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/catalogModel.ts#L56)
