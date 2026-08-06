import type {
  Run,
  RunEvent,
  RunStatus,
  StepRun,
  StepRunStatus,
} from "./runData";

// Live run-stream accumulator + engine↔UI enum mappers.
//
// The go-saga engine's `GET /api/v1/sagas/{run_id}/stream` is a WebSocket: on
// connect it sends a `run` snapshot frame, then tails `event` frames (existing,
// then live). This module is the PURE core of that seam — no socket, no React.
// Given a starting Run (or an empty seed) it folds each JSON frame into a new,
// immutable Run: run-frames set status + linkage; event-frames append a
// RunEvent, upsert the matching StepRun, extend the taken path, advance the
// run-level status, and stamp finishedAt/durationMs on terminal events. The
// transport (graphqlGateway.subscribeRun) just parses frames and folds them.

// --- WS frame envelopes ----------------------------------------------------

/**
 * The engine's SagaRunEvent — one recorded state transition.
 *
 * @since 1.0.0
 */
export interface SagaRunEventFrame {
  actor?: string;
  attempt?: number;
  event_type: string;
  from_state?: string;
  id: string;
  metadata?: null | Record<string, unknown>;
  recorded_at: string;
  run_id: string;
  step_id?: string;
  to_state?: string;
}

/**
 * The engine's SagaRun snapshot (only the fields the UI folds).
 *
 * @since 1.0.0
 */
export interface SagaRunFrame {
  current_step: string;
  definition_id: string;
  id: string;
  state: string;
  workflow_id: string;
}

/**
 * Resolves a step id to its authored label/verb (from the loaded WorkflowDef).
 * The host may supply one; absent it, the fold falls back to the raw step id.
 *
 * @since 1.0.0
 */
export interface StepMeta {
  label: string;
  verb: string;
}

/**
 * A function that resolves a step id to its authored label/verb.
 *
 * @since 1.0.0
 */
export type StepResolver = (stepId: string) => StepMeta | undefined;

/**
 * One parsed stream frame: a run snapshot or an event.
 *
 * @since 1.0.0
 */
export type StreamFrame =
  | { data: SagaRunEventFrame; type: "event" }
  | { data: SagaRunFrame; type: "run" };

// --- Enum mappers (engine → UI) --------------------------------------------

/**
 * Engine RunState → UI RunStatus.
 *
 * @since 1.0.0
 */
export const mapRunState = (state: string): RunStatus => {
  switch (state) {
    case "cancelled": {
      return "cancelled";
    }
    case "failed": {
      return "failed";
    }
    case "paused": {
      return "paused";
    }
    case "succeeded": {
      return "succeeded";
    }
    // pending | running | compensating → still running.
    default: {
      return "running";
    }
  }
};

/**
 * Engine EventType → UI RunEvent.kind.
 *
 * @since 1.0.0
 */
export const mapEventKind = (eventType: string): RunEvent["kind"] => {
  switch (eventType) {
    case "run.cancelled": {
      return "cancelled";
    }
    case "run.failed":
    case "step.failed": {
      return "error";
    }
    case "run.succeeded": {
      return "completed";
    }
    case "saga.started": {
      return "started";
    }
    case "step.paused": {
      return "paused";
    }
    // step.dispatched | step.started | step.skipped | step.succeeded |
    // compensation.started | log | metric | rule.evaluated |
    // license.gate.rejected → a plain step event.
    default: {
      return "step";
    }
  }
};

/**
 * Engine EventType → UI StepRunStatus, for events that carry a step_id. Returns
 * undefined for events that do not move a step's status.
 *
 * @since 1.0.0
 */
export const mapStepStatus = (eventType: string): StepRunStatus | undefined => {
  switch (eventType) {
    // The engine's queued/dispatched state maps to the UI's `waiting`.
    case "step.dispatched": {
      return "waiting";
    }
    case "step.failed": {
      return "failed";
    }
    case "step.skipped": {
      return "skipped";
    }
    case "step.started": {
      return "running";
    }
    case "step.succeeded": {
      return "succeeded";
    }
    default: {
      return undefined;
    }
  }
};

// Which events advance the RUN-level status (undefined = leave unchanged).
const eventRunStatus = (eventType: string): RunStatus | undefined => {
  switch (eventType) {
    case "run.cancelled": {
      return "cancelled";
    }
    case "run.failed": {
      return "failed";
    }
    case "run.succeeded": {
      return "succeeded";
    }
    case "saga.started": {
      return "running";
    }
    case "step.paused": {
      return "paused";
    }
    default: {
      return undefined;
    }
  }
};

const TERMINAL = new Set(["run.cancelled", "run.failed", "run.succeeded"]);

/**
 * A concise, human-readable message derived from the event type, enriched with
 * the step id and any state transition it carries.
 *
 * @since 1.0.0
 */
export const eventMessage = (event: SagaRunEventFrame): string => {
  const parts = [event.event_type];
  if (event.step_id) parts.push(event.step_id);
  if (event.from_state && event.to_state)
    parts.push(`${event.from_state} → ${event.to_state}`);
  return parts.join(" · ");
};

const durationBetween = (start: string, end: string): number | undefined => {
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return undefined;
  return to - from;
};

// --- Seed ------------------------------------------------------------------

/**
 * An empty Run for a run id — the snapshot/event frames fill it in.
 *
 * @since 1.0.0
 */
export const seedRun = (runId: string): Run => ({
  events: [],
  id: runId,
  path: [],
  startedAt: "",
  status: "running",
  stepRuns: [],
  trigger: "manual",
  workflowId: "",
  workflowKey: "",
});

// --- Fold ------------------------------------------------------------------

const foldRunFrame = (run: Run, data: SagaRunFrame): Run => ({
  ...run,
  // workflowId = the storage/definition id (FK → WorkflowDef.id); workflowKey =
  // the engine business id — mirrors graphqlGateway.toRun.
  id: data.id || run.id,
  status: mapRunState(data.state),
  workflowId: data.definition_id || run.workflowId,
  workflowKey: data.workflow_id || run.workflowKey,
});

const upsertStepRun = (
  stepRuns: StepRun[],
  event: SagaRunEventFrame,
  status: StepRunStatus,
  resolveStep?: StepResolver,
): StepRun[] => {
  const stepId = event.step_id as string;
  const index = stepRuns.findIndex((sr) => sr.stepId === stepId);
  const error =
    status === "failed"
      ? ((event.metadata?.error ?? event.metadata?.message ?? "step failed") as
          string | undefined)
      : undefined;

  if (index === -1) {
    const meta = resolveStep?.(stepId) ?? { label: stepId, verb: stepId };
    const created: StepRun = {
      label: meta.label,
      startedAt: event.recorded_at,
      status,
      stepId,
      verb: meta.verb,
    };
    if (error) created.error = error;
    return [...stepRuns, created];
  }

  const existing = stepRuns[index];
  const updated: StepRun = { ...existing, status };
  if (status === "succeeded")
    updated.durationMs = durationBetween(existing.startedAt, event.recorded_at);
  if (error) updated.error = error;
  const next = [...stepRuns];
  next[index] = updated;
  return next;
};

const foldEventFrame = (
  run: Run,
  event: SagaRunEventFrame,
  resolveStep?: StepResolver,
): Run => {
  const runEvent: RunEvent = {
    actor: event.actor || "system",
    at: event.recorded_at,
    kind: mapEventKind(event.event_type),
    message: eventMessage(event),
  };

  const stepStatus = event.step_id
    ? mapStepStatus(event.event_type)
    : undefined;
  const stepRuns =
    event.step_id && stepStatus
      ? upsertStepRun(run.stepRuns, event, stepStatus, resolveStep)
      : run.stepRuns;

  // The taken trail grows when a step STARTS or SUCCEEDS (in order, deduped).
  const onPath =
    event.event_type === "step.started" ||
    event.event_type === "step.succeeded";
  const path =
    event.step_id && onPath && !run.path.includes(event.step_id)
      ? [...run.path, event.step_id]
      : run.path;

  const startedAt =
    !run.startedAt && event.event_type === "saga.started"
      ? event.recorded_at
      : run.startedAt;
  const status = eventRunStatus(event.event_type) ?? run.status;

  const terminal = TERMINAL.has(event.event_type);
  const finishedAt = terminal ? event.recorded_at : run.finishedAt;
  const durationMs =
    terminal && startedAt
      ? durationBetween(startedAt, event.recorded_at)
      : run.durationMs;

  return {
    ...run,
    durationMs,
    events: [...run.events, runEvent],
    finishedAt,
    path,
    startedAt,
    status,
    stepRuns,
  };
};

/**
 * Fold ONE frame into a new immutable Run.
 *
 * @since 1.0.0
 */
export const foldFrame = (
  run: Run,
  frame: StreamFrame,
  resolveStep?: StepResolver,
): Run =>
  frame.type === "run"
    ? foldRunFrame(run, frame.data)
    : foldEventFrame(run, frame.data, resolveStep);

/**
 * Fold a sequence of frames left-to-right.
 *
 * @since 1.0.0
 */
export const foldFrames = (
  run: Run,
  frames: StreamFrame[],
  resolveStep?: StepResolver,
): Run => {
  let accumulated = run;
  for (const frame of frames)
    accumulated = foldFrame(accumulated, frame, resolveStep);
  return accumulated;
};
