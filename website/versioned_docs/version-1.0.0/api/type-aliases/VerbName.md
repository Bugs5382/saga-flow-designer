# Type Alias: VerbName

> **VerbName** = `"action"` \| `"assert"` \| `"cancel"` \| `"collect_input"` \| `"decision"` \| `"emit_event"` \| `"emit_signal"` \| `"end"` \| `"entry"` \| `"error"` \| `"filter"` \| `"foreach"` \| `"http_request"` \| `"join"` \| `"log"` \| `"manual_approval"` \| `"map"` \| `"merge"` \| `"metric_emit"` \| `"noop"` \| `"parallel"` \| `"set_var"` \| `"spawn_saga"` \| `"sub_saga"` \| `"switch"` \| `"transform"` \| `"try_catch"` \| `"wait_duration"` \| `"wait_for_event"` \| `"wait_for_signal"` \| `"wait_until"` \| `"webhook"` \| `"while"`

Defined in: [workflowData.ts:196](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/workflowData.ts#L196)

The verbs the engine can dispatch (engine/verbs/registry.go), plus three
first-class BOUNDARY verbs the designer places explicitly:
  - end   : normal successful completion of a trail (terminal).
  - cancel: cancel the saga — abort + compensation semantics (terminal).
  - entry : an entry point that declares a data contract; a rejoining lane
            (merge target) must target an entry and supply its declared inputs.

## Since

1.0.0
