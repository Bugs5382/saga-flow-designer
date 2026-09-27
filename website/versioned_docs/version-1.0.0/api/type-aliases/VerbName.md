# Type Alias: VerbName

> **VerbName** = `"action"` \| `"assert"` \| `"cancel"` \| `"collect_input"` \| `"decision"` \| `"emit_event"` \| `"emit_signal"` \| `"end"` \| `"entry"` \| `"error"` \| `"filter"` \| `"foreach"` \| `"http_request"` \| `"join"` \| `"log"` \| `"manual_approval"` \| `"map"` \| `"merge"` \| `"metric_emit"` \| `"noop"` \| `"parallel"` \| `"set_var"` \| `"spawn_saga"` \| `"sub_saga"` \| `"switch"` \| `"transform"` \| `"try_catch"` \| `"wait_duration"` \| `"wait_for_event"` \| `"wait_for_signal"` \| `"wait_until"` \| `"webhook"` \| `"while"`

Defined in: [workflowData.ts:238](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/workflowData.ts#L238)

The verbs the engine can dispatch (engine/verbs/registry.go), plus three
first-class BOUNDARY verbs the designer places explicitly:
  - end   : normal successful completion of a trail (terminal).
  - cancel: cancel the saga — abort + compensation semantics (terminal).
  - entry : an entry point that declares a data contract; a rejoining lane
            (merge target) must target an entry and supply its declared inputs.

## Since

1.0.0
