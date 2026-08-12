# Type Alias: LaneSemantics

> **LaneSemantics** = `"end"` \| `"forced-end"` \| `"loop-back"` \| `"merge"`

Defined in: [workflowData.ts:1413](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L1413)

The termination semantics of ONE lane, given its owner verb + role.
  "end"        : terminal — renders an End cap; NO merge target.
  "merge"      : non-terminal — MUST name an explicit merge target (sub-entry).
  "loop-back"  : non-terminal — loops back to the construct's entry node
                 (foreach/while body, try_catch TRY). No merge target.
  "forced-end" : always terminal, non-configurable (try_catch CATCH).

## Since

1.0.0
