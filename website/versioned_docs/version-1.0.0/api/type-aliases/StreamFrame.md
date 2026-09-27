# Type Alias: StreamFrame

> **StreamFrame** = \{ `data`: [`SagaRunEventFrame`](../interfaces/SagaRunEventFrame.md); `type`: `"event"`; \} \| \{ `data`: [`SagaRunFrame`](../interfaces/SagaRunFrame.md); `type`: `"run"`; \}

Defined in: [runStream.ts:85](https://github.com/Bugs5382/saga-flow-designer/blob/5d181aa9ea9c8878f7141088f5ed2b3e9fd5e86a/src/runStream.ts#L85)

One parsed stream frame: a run snapshot or an event.

## Since

1.0.0
