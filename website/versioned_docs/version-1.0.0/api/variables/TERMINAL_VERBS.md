# Variable: TERMINAL\_VERBS

> `const` **TERMINAL\_VERBS**: `Set`\<[`VerbName`](../type-aliases/VerbName.md)\>

Defined in: [workflowData.ts:1424](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L1424)

Verbs that terminate their trail (nothing may run after them on that trail).
`end` = normal completion; `cancel` = abort+compensate; `error` = raise.

## Since

1.0.0
