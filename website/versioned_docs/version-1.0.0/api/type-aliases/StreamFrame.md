# Type Alias: StreamFrame

> **StreamFrame** = \{ `data`: [`SagaRunEventFrame`](../interfaces/SagaRunEventFrame.md); `type`: `"event"`; \} \| \{ `data`: [`SagaRunFrame`](../interfaces/SagaRunFrame.md); `type`: `"run"`; \}

Defined in: [runStream.ts:85](https://github.com/Bugs5382/saga-flow-designer/blob/db92d05f5d63a42b6f0355e52df27789bfdcfb21/src/runStream.ts#L85)

One parsed stream frame: a run snapshot or an event.

## Since

1.0.0
