# Variable: LOOP\_VERBS

> `const` **LOOP\_VERBS**: `Set`\<[`VerbName`](../type-aliases/VerbName.md)\>

Defined in: [workflowData.ts:1372](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1372)

Loop constructs whose body loops back to an entry node at the body head
(also where the canvas renders the teal loop-entry node). `map` iterates a
collection per-item like foreach, so it is a loop too (its per-item child
body is OPTIONAL — a plain map has no body).

## Since

1.0.0
