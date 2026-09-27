# Variable: LOOP\_VERBS

> `const` **LOOP\_VERBS**: `Set`\<[`VerbName`](../type-aliases/VerbName.md)\>

Defined in: [workflowData.ts:1434](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L1434)

Loop constructs whose body loops back to an entry node at the body head
(also where the canvas renders the teal loop-entry node). `map` iterates a
collection per-item like foreach, so it is a loop too (its per-item child
body is OPTIONAL — a plain map has no body).

## Since

1.0.0
