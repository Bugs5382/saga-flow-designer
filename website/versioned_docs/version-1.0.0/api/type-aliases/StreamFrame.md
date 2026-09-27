# Type Alias: StreamFrame

> **StreamFrame** = \{ `data`: [`SagaRunEventFrame`](../interfaces/SagaRunEventFrame.md); `type`: `"event"`; \} \| \{ `data`: [`SagaRunFrame`](../interfaces/SagaRunFrame.md); `type`: `"run"`; \}

Defined in: [runStream.ts:85](https://github.com/Bugs5382/saga-flow-designer/blob/43c8f103bce9a8b34baa164470e6b7c1895bf5cd/src/runStream.ts#L85)

One parsed stream frame: a run snapshot or an event.

## Since

1.0.0
