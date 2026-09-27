# Interface: VerbBehavior

Defined in: [workflowData.ts:182](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L182)

Behavior hints for a verb, derived once from the base catalog's hardcoded
membership sets (TERMINAL_VERBS, BRANCH_VERBS, …) so a catalog overlay can
re-derive those sets from whatever specs are actually in play — base,
added, or hidden — instead of depending on the module-global `Set`s
(which only ever describe the shipped base catalog).

`required` marks a spec that must survive a `hide` override: it is
structurally necessary for a valid flow (e.g. `end`, the terminal every
trail needs).

## Since

1.0.0

## Properties

### branch?

> `optional` **branch?**: `boolean`

Defined in: [workflowData.ts:183](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L183)

***

### fanout?

> `optional` **fanout?**: `boolean`

Defined in: [workflowData.ts:184](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L184)

***

### loop?

> `optional` **loop?**: `boolean`

Defined in: [workflowData.ts:185](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L185)

***

### mergeableOwner?

> `optional` **mergeableOwner?**: `boolean`

Defined in: [workflowData.ts:186](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L186)

***

### pause?

> `optional` **pause?**: `boolean`

Defined in: [workflowData.ts:187](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L187)

***

### required?

> `optional` **required?**: `boolean`

Defined in: [workflowData.ts:188](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L188)

***

### signalWait?

> `optional` **signalWait?**: `boolean`

Defined in: [workflowData.ts:189](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L189)

***

### terminal?

> `optional` **terminal?**: `boolean`

Defined in: [workflowData.ts:190](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/workflowData.ts#L190)
