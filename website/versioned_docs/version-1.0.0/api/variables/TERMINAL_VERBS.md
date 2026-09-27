# Variable: TERMINAL\_VERBS

> `const` **TERMINAL\_VERBS**: `Set`\<[`VerbName`](../type-aliases/VerbName.md)\>

Defined in: [workflowData.ts:1424](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L1424)

Verbs that terminate their trail (nothing may run after them on that trail).
`end` = normal completion; `cancel` = abort+compensate; `error` = raise.

## Since

1.0.0
