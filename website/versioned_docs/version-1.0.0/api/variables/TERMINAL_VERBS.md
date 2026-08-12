# Variable: TERMINAL\_VERBS

> `const` **TERMINAL\_VERBS**: `Set`\<[`VerbName`](../type-aliases/VerbName.md)\>

Defined in: [workflowData.ts:1362](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1362)

Verbs that terminate their trail (nothing may run after them on that trail).
`end` = normal completion; `cancel` = abort+compensate; `error` = raise.

## Since

1.0.0
